import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import datetime

from models import ChatRequest, EvaluateRequest, Session, CreateProblemRequest
from problems import get_all_problems, get_problem
from interviewer import build_system_prompt, call_gemini, call_gemini_stream, detect_phase_transition, detect_interview_complete
from fastapi.responses import StreamingResponse
import json
from evaluator import generate_report
from database import (
    save_session, update_session, save_report, get_report, check_admin, 
    get_all_sessions, get_all_reports, get_all_users, delete_user_by_id,
    get_all_admins, make_admin, revoke_admin, get_all_recruiters,
    check_recruiter, make_recruiter, revoke_recruiter, create_assessment_in_db,
    get_assessments_by_recruiter, get_assessment_details
)
from supabase import create_client, Client
import os

def get_supabase_admin() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase Admin credentials not configured in backend .env")
    return create_client(url, key)

load_dotenv()

app = FastAPI(title="HackStorm Interview AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health/db")
def health_db():
    import traceback
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return {"status": "error", "message": "DATABASE_URL environment variable is missing"}
    
    db_url = db_url.strip()
    
    # Obfuscate password for safe display
    safe_url = db_url.replace(db_url.split('@')[0].split(':')[-1], "*****") if '@' in db_url else "Invalid URL Format"
    
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor, connect_timeout=5)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        conn.close()
        return {"status": "success", "message": "Successfully connected to database", "url": safe_url}
    except Exception as e:
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc(), "url": safe_url}

@app.get("/problems")
def list_problems():
    return [{"id": p["id"], "title": p["title"], "difficulty": p["difficulty"], "tags": p.get("tags", [])} for p in get_all_problems()]

@app.get("/problems/{problem_id}")
def fetch_problem(problem_id: int):
    problem = get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@app.post("/session/start")
def start_session(problem_id: int):
    problem = get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    session_id = str(uuid.uuid4())
    session_data = {
        "id": session_id,
        "problem_id": problem_id,
        "phase": "INTRO",
        "started_at": datetime.datetime.utcnow().isoformat(),
        "chat_history": []
    }
    
    save_session(session_data)
    
    return {"session_id": session_id, "phase": "INTRO"}

@app.post("/chat")
async def chat(req: ChatRequest):
    print(f"Chat request received: stream={req.stream}, msg={req.candidate_message}")
    problem = get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # We expect the frontend to pass the entire history including the new message
    history = [msg.dict() for msg in req.chat_history]
    
    # We should determine the current phase from the history
    # For simplicity without a DB session fetch here, we can infer it or let frontend pass it.
    # In a real app we'd fetch the session from DB and update it.
    # We'll just infer phase transition based on history length.
    current_phase = detect_phase_transition(history, "INTRO") 
    
    # Generate system prompt
    system_prompt = build_system_prompt(
        problem=problem, 
        phase=current_phase, 
        code=req.code, 
        history="\n".join([f"{'Candidate' if m['role']=='user' else 'Interviewer'}: {m['content']}" for m in history])
    )
    
    if req.stream:
        async def stream_generator():
            try:
                full_response = ""
                for chunk in call_gemini_stream(system_prompt, req.candidate_message):
                    full_response += chunk
                    yield f"data: {json.dumps({'text': chunk})}\n\n"
                
                is_complete = detect_interview_complete(full_response)
                yield f"data: {json.dumps({'is_complete': is_complete})}\n\n"
            except Exception as e:
                error_msg = str(e)
                print(f"Gemini stream error: {error_msg}")
                if "429" in error_msg or "quota" in error_msg.lower():
                    yield f"data: {json.dumps({'text': 'I need a moment... the AI service is temporarily busy. Please try again in a few seconds.'})}\n\n"
                else:
                    yield f"data: {json.dumps({'text': f'Sorry, I encountered an error: {error_msg}'})}\n\n"
                yield f"data: {json.dumps({'is_complete': False})}\n\n"
            
        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    # Call Gemini (non-streaming fallback)
    try:
        reply = call_gemini(system_prompt, req.candidate_message)
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini error: {error_msg}")
        if "429" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(status_code=503, detail="AI service is temporarily busy. Please try again in a few seconds.")
        raise HTTPException(status_code=500, detail=f"AI service error: {error_msg}")
    
    is_complete = detect_interview_complete(reply)
    if is_complete:
        reply = reply.replace("INTERVIEW_COMPLETE", "").strip()
        
    return {
        "reply": reply,
        "phase": current_phase,
        "is_complete": is_complete
    }

@app.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    problem = get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    history = [msg.dict() for msg in req.chat_history]
    
    report_data = generate_report(problem, history, req.code)
    
    if "error" in report_data:
        raise HTTPException(status_code=500, detail="Failed to generate evaluation report")
    
    session_id = str(uuid.uuid4())
    session_data = {
        "id": session_id,
        "user_id": req.user_id,
        "problem_id": req.problem_id,
        "phase": "COMPLETED",
        "chat_history": history,
        "assessment_id": req.assessment_id,
        "candidate_name": req.candidate_name
    }
    save_session(session_data)
    
    report_data["id"] = str(uuid.uuid4())
    report_data["session_id"] = session_id
    save_report(report_data)
    
    return report_data

@app.get("/report/{session_id}")
def fetch_report(session_id: str):
    report = get_report(session_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/admin/dashboard")
def get_admin_dashboard(user_id: str):
    if not check_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    
    sessions = get_all_sessions()
    reports = get_all_reports()
    users = get_all_users()
    admins = get_all_admins()
    recruiters = get_all_recruiters()
    
    # Calculate some basic stats
    total_interviews = len(sessions)
    completed_interviews = len(reports)
    avg_score = sum(r["overall_score"] for r in reports if r.get("overall_score")) / max(1, completed_interviews)
    
    return {
        "stats": {
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "average_score": round(avg_score, 1)
        },
        "sessions": sessions,
        "reports": reports,
        "users": users,
        "admins": admins,
        "recruiters": recruiters
    }

from pydantic import BaseModel
class AdminActionRequest(BaseModel):
    user_id: str # Admin ID
    target_id: str = None
    email: str = None
    password: str = None

@app.post("/admin/users")
def add_new_user(req: AdminActionRequest):
    if not check_admin(req.user_id):
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    try:
        sb = get_supabase_admin()
        res = sb.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True
        })
        return {"message": "User created", "id": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/users/{target_id}")
def delete_user(target_id: str, user_id: str):
    if not check_admin(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    # Delete from Supabase via API for complete cleanup
    try:
        sb = get_supabase_admin()
        sb.auth.admin.delete_user(target_id)
    except:
        pass # Fallback to local DB deletion if API fails
    success = delete_user_by_id(target_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user locally")
    return {"message": "User deleted"}

@app.post("/admin/admins")
def promote_admin(req: AdminActionRequest):
    if not check_admin(req.user_id): raise HTTPException(status_code=403, detail="Not authorized")
    make_admin(req.target_id)
    return {"message": "Promoted to admin"}

@app.delete("/admin/admins/{target_id}")
def remove_admin(target_id: str, user_id: str):
    if not check_admin(user_id): raise HTTPException(status_code=403, detail="Not authorized")
    if target_id == user_id: raise HTTPException(status_code=400, detail="Cannot revoke yourself")
    revoke_admin(target_id)
    return {"message": "Admin revoked"}

@app.post("/admin/recruiters")
def promote_recruiter_admin(req: AdminActionRequest):
    if not check_admin(req.user_id): raise HTTPException(status_code=403, detail="Not authorized")
    make_recruiter(req.target_id)
    return {"message": "Promoted to recruiter"}

@app.delete("/admin/recruiters/{target_id}")
def remove_recruiter_admin(target_id: str, user_id: str):
    if not check_admin(user_id): raise HTTPException(status_code=403, detail="Not authorized")
    revoke_recruiter(target_id)
    return {"message": "Recruiter revoked"}

from problems import add_problem

@app.post("/admin/problems")
def create_problem(req: CreateProblemRequest):
    if not check_admin(req.user_id):
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    
    problem_id = add_problem({
        "title": req.title,
        "difficulty": req.difficulty,
        "description": req.description,
        "examples": req.examples,
        "constraints": req.constraints,
        "tags": req.tags
    })
    
    if not problem_id:
        raise HTTPException(status_code=500, detail="Failed to add problem")
        
    return {"message": "Problem added successfully", "problem_id": problem_id}

from models import MakeRecruiterRequest, CreateAssessmentRequest

@app.post("/recruiter/make")
def promote_to_recruiter(req: MakeRecruiterRequest):
    make_recruiter(req.user_id)
    return {"message": "User promoted to recruiter successfully"}

@app.get("/recruiter/check/{user_id}")
def verify_recruiter(user_id: str):
    is_recruiter = check_recruiter(user_id)
    return {"is_recruiter": is_recruiter}

@app.post("/assessment")
def create_assessment(req: CreateAssessmentRequest):
    if not check_recruiter(req.recruiter_id):
        raise HTTPException(status_code=403, detail="Not authorized as recruiter")
    
    assessment_id = str(uuid.uuid4())
    success = create_assessment_in_db(
        assessment_id=assessment_id,
        recruiter_id=req.recruiter_id,
        title=req.title,
        questions=req.questions
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create assessment")
    
    return {"message": "Assessment created", "assessment_id": assessment_id}

@app.get("/recruiter/assessments/{user_id}")
def list_assessments(user_id: str):
    if not check_recruiter(user_id):
        raise HTTPException(status_code=403, detail="Not authorized as recruiter")
    
    return get_assessments_by_recruiter(user_id)

@app.get("/assessment/{assessment_id}")
def fetch_assessment(assessment_id: str):
    assessment = get_assessment_details(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
