import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import datetime
import time

from models import ChatRequest, EvaluateRequest, Session, CreateProblemRequest
from problems import get_all_problems, get_problem, add_problem
from interviewer import build_system_prompt, call_gemini, call_gemini_stream, detect_phase_transition, detect_interview_complete
from fastapi.responses import StreamingResponse
import json
from evaluator import generate_report
import resend
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
import base64
from database import (
    save_session, update_session, save_report, get_report, check_admin, 
    get_all_sessions, get_all_reports, get_all_users, delete_user_by_id,
    get_all_admins, make_admin, revoke_admin, get_all_recruiters,
    check_recruiter, make_recruiter, revoke_recruiter, create_assessment_in_db,
    get_assessments_by_recruiter, get_assessment_details,
    get_all_problems_db, update_problem_in_db, delete_problem_in_db, toggle_problem_visibility_db,
    save_otp, verify_otp, get_user_email_by_id,
    get_db_connection, release_db_connection
)
from supabase import create_client, Client
import os
import tempfile
from fastapi import File, UploadFile
from faster_whisper import WhisperModel
from starlette.concurrency import run_in_threadpool

def get_supabase_admin() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase Admin credentials not configured in backend .env")
    return create_client(url, key)

load_dotenv()

app = FastAPI(title="HackStorm Interview AI")

security = HTTPBearer()

async def get_current_user_id(auth: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verifies Supabase JWT and returns the user ID."""
    try:
        sb = get_supabase_admin()
        res = sb.auth.get_user(auth.credentials)
        if res.user:
            return str(res.user.id)
        raise HTTPException(status_code=401, detail="Invalid session")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_admin_user(user_id: str = Depends(get_current_user_id)) -> str:
    if not check_admin(user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user_id

async def get_recruiter_user(user_id: str = Depends(get_current_user_id)) -> str:
    if not check_recruiter(user_id) and not check_admin(user_id):
        raise HTTPException(status_code=403, detail="Recruiter access required")
    return user_id

# Initialize Whisper model globally (using tiny.en for maximum speed on CPU)
try:
    whisper_model = WhisperModel(
        "tiny.en", 
        device="cpu", 
        compute_type="int8",
        cpu_threads=2, # Optimized for low-resource/free hosting
        num_workers=1
    )
except Exception as e:
    print(f"Warning: Faster Whisper failed to load: {e}")
    whisper_model = None

def run_whisper(path):
    segments, info = whisper_model.transcribe(
        path,
        beam_size=1,
        language="en",
        vad_filter=False,
        condition_on_previous_text=False,
    )
    transcript = " ".join(segment.text.strip() for segment in segments).strip()
    return transcript, info.language, info.duration

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if whisper_model is None:
        raise HTTPException(status_code=500, detail="Transcription service not available")
    
    # Validation
    MAX_SIZE = 10 * 1024 * 1024 # 10MB
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large")
    
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Run in thread pool to avoid blocking the event loop
        start_time = time.perf_counter()
        transcript, language, duration = await run_in_threadpool(run_whisper, tmp_path)
        end_time = time.perf_counter()
        print(f"[STT] Transcribed {duration:.2f}s audio in {end_time - start_time:.2f}s")

        # Cleanup
        os.remove(tmp_path)

        return {
            "transcript": transcript,
            "language": language,
            "duration": duration
        }
    except Exception as e:
        print(f"Transcription error: {e}")
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))

# --- CORS Configuration ---
frontend_urls = os.getenv("FRONTEND_URL", "https://hackstorm-ai.vercel.app")
origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]

# Add defaults if not present
defaults = ["http://localhost:3000", "https://hackstorm-ai.vercel.app"]
for d in defaults:
    if d not in origins:
        origins.append(d)

# --- IP Restriction Middleware for /admin/* routes ---
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class AdminIPRestrictionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/admin"):
            # 1. Check for Device Secret (Cookie)
            device_secret = os.getenv("ADMIN_DEVICE_SECRET")
            admin_cookie = request.cookies.get("hackstorm_admin_auth")
            
            if device_secret and admin_cookie == device_secret:
                return await call_next(request)

            # 2. Fallback: Check for IP Restriction
            allowed_ips_str = os.getenv("ALLOWED_ADMIN_IPS", "")
            
            if allowed_ips_str:
                allowed_ips = [ip.strip() for ip in allowed_ips_str.split(",") if ip.strip()]
                
                # Get client IP (handles proxies like Render/Vercel)
                client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
                if not client_ip:
                    client_ip = request.headers.get("x-real-ip", "")
                if not client_ip and request.client:
                    client_ip = request.client.host
                
                if client_ip not in allowed_ips:
                    return JSONResponse(
                        status_code=403,
                        content={"detail": f"Access denied. Your IP ({client_ip}) is not authorized."}
                    )
        
        return await call_next(request)

# --- Middleware Configuration ---
# Note: Last added is outermost for request, but outermost for response is what we want for CORS.
# In Starlette, middlewares wrap the app. To make CORS outermost for response, add it LAST.

app.add_middleware(AdminIPRestrictionMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Debugging wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"status": "alive", "timestamp": datetime.datetime.now().isoformat()}

@app.get("/ip")
def get_ip(request: Request):
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.headers.get("x-real-ip", "")
    if not client_ip and request.client:
        client_ip = request.client.host
    return {"ip": client_ip}

import io
import wave
from google import genai as new_genai
from google.genai import types as new_types


import struct

def parse_audio_mime_type(mime_type: str) -> dict:
    bits_per_sample = 16
    rate = 24000
    parts = mime_type.split(";")
    for param in parts:
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate = int(param.split("=", 1)[1])
            except: pass
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except: pass
    return {"bits_per_sample": bits_per_sample, "rate": rate}

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size
    
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", chunk_size, b"WAVE", b"fmt ", 16, 1,
        num_channels, sample_rate, byte_rate, block_align,
        bits_per_sample, b"data", data_size
    )
    return header + audio_data

@app.post("/api/tts")
async def generate_tts(request: Request):
    try:
        data = await request.json()
        text = data.get("text", "")
        if not text:
            return JSONResponse(status_code=400, content={"error": "No text provided"})
            
        print(f"Generating TTS (Zephyr) for: {text[:50]}...")
        
        api_key = os.getenv("GEMINI_API_KEY")
        client = new_genai.Client(api_key=api_key)
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-tts-preview",
            contents=text,
            config=new_types.GenerateContentConfig(
                response_modalities=["audio"],
                speech_config=new_types.SpeechConfig(
                    voice_config=new_types.VoiceConfig(
                        prebuilt_voice_config=new_types.PrebuiltVoiceConfig(
                            voice_name="Zephyr"
                        )
                    )
                ),
            )
        )
        
        if not response.candidates or not response.candidates[0].content.parts:
            return JSONResponse(status_code=500, content={"error": "No audio generated"})

        part = response.candidates[0].content.parts[0]
        if not part.inline_data:
            return JSONResponse(status_code=500, content={"error": "No inline data"})

        audio_bytes = part.inline_data.data
        mime_type = part.inline_data.mime_type or "audio/L16;rate=24000"
        
        wav_data = convert_to_wav(audio_bytes, mime_type)
        b64_audio = base64.b64encode(wav_data).decode('utf-8')
            
        return {"audio": b64_audio, "format": "wav"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health/db")
def health_db():
    import traceback
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return {"status": "error", "message": "DATABASE_URL environment variable is missing"}
    
    db_url = db_url.strip()
    
    # Obfuscate password for safe display
    try:
        # Sanitize health check to avoid leaking DB details
        conn = get_db_connection()
        if not conn:
            return {"status": "unhealthy"}
        release_db_connection(conn)
        return {"status": "healthy"}
    except Exception:
        return {"status": "unhealthy"}

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
    
    # Determine current phase: prefer frontend provided phase, fallback to history-based detection
    current_phase = req.phase if req.phase else detect_phase_transition(history, "INTRO") 
    
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
async def evaluate(req: EvaluateRequest, user_id: str = Depends(get_current_user_id)):
    return persist_evaluation_report(req, user_id)

def persist_evaluation_report(req: EvaluateRequest, user_id: str = None):
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
        "user_id": user_id,
        "problem_id": req.problem_id,
        "phase": "COMPLETED",
        "chat_history": history,
        "assessment_id": req.assessment_id,
        "candidate_name": req.candidate_name
    }
    save_session(session_data)
    
    report_data["id"] = str(uuid.uuid4())
    report_data["session_id"] = session_id
    report_data["user_id"] = user_id
    report_data["final_code"] = req.code
    
    if not save_report(report_data):
        raise HTTPException(status_code=500, detail="Failed to save report to database")
    
    # Trigger readiness calculation if target exists
    if user_id:
        target = get_target_company(user_id)
        if target:
            benchmark = get_benchmark(target['company_name'], target['role'], target['target_level'])
            if benchmark:
                readiness = calculate_readiness(report_data, benchmark)
                readiness["ai_analysis"] = generate_ai_analysis(readiness, report_data)
                save_progress_snapshot(user_id, target['id'], readiness)
                report_data["readiness"] = {
                    "target_company": target['company_name'],
                    "score": readiness["readiness_score"],
                    "skill_gaps": readiness["skill_gaps"]
                }
    
    return report_data


@app.get("/report/{session_id}")
def fetch_report(session_id: str, user_id: str = Depends(get_current_user_id)):
    report = get_report(session_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Ownership check
    if report.get('user_id') and report['user_id'] != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this report")
        
    return report

@app.get("/admin/dashboard")
def get_admin_dashboard(user_id: str = Depends(get_admin_user)):
    
    sessions = get_all_sessions()
    reports = get_all_reports()
    users = get_all_users()
    admins = get_all_admins()
    recruiters = get_all_recruiters()
    problems = get_all_problems_db()
    
    # Calculate some basic stats
    total_interviews = len(sessions)
    completed_interviews = len(reports)
    avg_score = sum(r["overall_score"] for r in reports if r.get("overall_score")) / max(1, completed_interviews)
    
    return {
        "stats": {
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "average_score": round(avg_score, 1),
            "total_problems": len(problems)
        },
        "sessions": sessions,
        "reports": reports,
        "users": users,
        "admins": admins,
        "recruiters": recruiters,
        "problems": problems
    }

from pydantic import BaseModel
class AdminActionRequest(BaseModel):
    user_id: str # Admin ID
    target_id: str = None
    email: str = None
    password: str = None

@app.post("/admin/users")
def add_new_user(req: AdminActionRequest, admin_id: str = Depends(get_admin_user)):
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
def delete_user(target_id: str, admin_id: str = Depends(get_admin_user)):
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
def promote_admin(req: AdminActionRequest, admin_id: str = Depends(get_admin_user)):
    make_admin(req.target_id)
    return {"message": "Promoted to admin"}

@app.delete("/admin/admins/{target_id}")
def remove_admin(target_id: str, admin_id: str = Depends(get_admin_user)):
    if target_id == admin_id: raise HTTPException(status_code=400, detail="Cannot revoke yourself")
    revoke_admin(target_id)
    return {"message": "Admin revoked"}

@app.post("/admin/recruiters")
def promote_recruiter_admin(req: AdminActionRequest, admin_id: str = Depends(get_admin_user)):
    make_recruiter(req.target_id)
    return {"message": "Promoted to recruiter"}

@app.delete("/admin/recruiters/{target_id}")
def remove_recruiter_admin(target_id: str, admin_id: str = Depends(get_admin_user)):
    revoke_recruiter(target_id)
    return {"message": "Recruiter revoked"}

@app.post("/admin/problems")
def create_problem(req: CreateProblemRequest, admin_id: str = Depends(get_admin_user)):
    
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

@app.put("/admin/problems/{problem_id}")
def update_problem(problem_id: int, req: CreateProblemRequest, admin_id: str = Depends(get_admin_user)):
    
    success = update_problem_in_db(problem_id, {
        "title": req.title,
        "difficulty": req.difficulty,
        "description": req.description,
        "examples": req.examples,
        "constraints": req.constraints,
        "tags": req.tags
    })
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update problem")
        
    return {"message": "Problem updated successfully"}

@app.delete("/admin/problems/{problem_id}")
def delete_problem(problem_id: int, admin_id: str = Depends(get_admin_user)):
    
    success = delete_problem_in_db(problem_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete problem")
        
    return {"message": "Problem deleted successfully"}

class VisibilityRequest(BaseModel):
    user_id: str
    is_public: bool

@app.patch("/admin/problems/{problem_id}/visibility")
def toggle_visibility(problem_id: int, req: VisibilityRequest, admin_id: str = Depends(get_admin_user)):
    
    success = toggle_problem_visibility_db(problem_id, req.is_public)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update visibility")
        
    return {"message": "Visibility updated successfully"}

import random
import smtplib
from email.mime.text import MIMEText

class OTPSendRequest(BaseModel):
    user_id: str

@app.post("/admin/otp/send")
def send_admin_otp(req: OTPSendRequest, admin_id: str = Depends(get_admin_user)):
    email = get_user_email_by_id(admin_id)
    if not email:
        raise HTTPException(status_code=404, detail="Admin email not found")
    
    otp_code = str(random.randint(100000, 999999))
    save_otp(email, otp_code)
    
    # Mock Email Send (Console)
    print(f"\n[SECURITY] Admin OTP for {email}: {otp_code}\n")
    
    # 1. Try Resend SDK (Recommended)
    resend_api_key = os.getenv("RESEND_API_KEY")
    sender_email = os.getenv("SMTP_FROM", "onboarding@resend.dev")
    
    if resend_api_key:
        try:
            resend.api_key = resend_api_key
            resend.Emails.send({
                "from": f"HackStorm AI Security <{sender_email}>",
                "to": [email],
                "subject": "HackStorm AI Security Verification",
                "html": f"""
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #1e3a8a;">Verify Your Identity</h2>
                        <p>You are attempting to access the HackStorm AI Admin Portal. Please use the following code to complete your login:</p>
                        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 8px; margin: 20px 0;">
                            {otp_code}
                        </div>
                        <p style="color: #64748b; font-size: 12px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
                    </div>
                """
            })
            return {"message": "Verification code sent to your registered email"}
        except Exception as e:
            print(f"Resend SDK Error: {e}")

    # 2. Fallback to SMTP
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", 587)
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if smtp_server and smtp_user and smtp_pass:
        try:
            msg = MIMEText(f"Your HackStorm AI Admin Verification Code is: {otp_code}")
            msg['Subject'] = 'HackStorm AI Security Verification'
            msg['From'] = f"HackStorm AI Security <{sender_email}>"
            msg['To'] = email
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            return {"message": "Verification code sent to your registered email"}
        except Exception as e:
            print(f"Failed to send email via SMTP: {e}")

    return {"message": "Verification code sent to your registered email"}

class OTPVerifyRequest(BaseModel):
    user_id: str
    otp_code: str

@app.post("/admin/otp/verify")
def verify_admin_otp(req: OTPVerifyRequest, admin_id: str = Depends(get_admin_user)):
    email = get_user_email_by_id(admin_id)
    if not email or not verify_otp(email, req.otp_code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    return {"message": "Identity verified"}

from models import MakeRecruiterRequest, CreateAssessmentRequest

# Public recruiter promotion removed for security. Recruiters must be promoted by an admin.
@app.get("/recruiter/check")
def verify_recruiter_status(user_id: str = Depends(get_current_user_id)):
    is_recruiter = check_recruiter(user_id)
    return {"is_recruiter": is_recruiter}

@app.post("/assessment")
def create_assessment(req: CreateAssessmentRequest, recruiter_id: str = Depends(get_recruiter_user)):
    
    assessment_id = str(uuid.uuid4())
    success = create_assessment_in_db(
        assessment_id=assessment_id,
        recruiter_id=recruiter_id,
        title=req.title,
        questions=req.questions
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create assessment")
    
    return {"message": "Assessment created", "assessment_id": assessment_id}
def generate_ai_analysis(readiness: dict, report: dict):
    # Simple logic to generate feedback based on gaps
    gaps = readiness.get('skill_gaps', {})
    if not gaps: return "Complete more interviews to get analysis."
    
    worst_skill = min(gaps, key=gaps.get)
    best_skill = max(gaps, key=gaps.get)
    
    analysis = f"Your overall readiness is {readiness['readiness_score']}%. "
    if gaps[worst_skill] < -10:
        analysis += f"Focus on {worst_skill.replace('_', ' ')}: you are {abs(gaps[worst_skill])}% below the target bar. "
    else:
        analysis += f"Your skills are well-balanced for this role. "
        
    analysis += f"Strongest area: {best_skill.replace('_', ' ')}. "
    
    if report.get('improvements') and len(report['improvements']) > 0:
        analysis += f"Suggested next step: {report['improvements'][0]}."
        
    return analysis
@app.get("/recruiter/assessments")
def list_assessments(recruiter_id: str = Depends(get_recruiter_user)):
    return get_assessments_by_recruiter(recruiter_id)

@app.get("/assessment/{assessment_id}")
def fetch_assessment(assessment_id: str):
    assessment = get_assessment_details(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@app.post("/assessment/{assessment_id}/evaluate")
async def evaluate_assessment_candidate(assessment_id: str, req: EvaluateRequest):
    assessment = get_assessment_details(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    valid_problem_ids = {q["problem_id"] for q in assessment.get("questions", [])}
    if req.problem_id not in valid_problem_ids:
        raise HTTPException(status_code=400, detail="Problem does not belong to this assessment")

    req.assessment_id = assessment_id
    return persist_evaluation_report(req, user_id=None)

def calculate_readiness(candidate_scores: dict, benchmark: dict):
    # weights: problem_solving: 30%, optimization: 25%, code_quality: 20%, communication: 15%, debugging: 10%
    weights = {
        'problem_solving': 0.30,
        'optimization': 0.25,
        'code_quality': 0.20,
        'communication': 0.15,
        'debugging': 0.10
    }
    
    skill_ratios = []
    skill_gaps = {}
    
    # Skills mapping (from score key to benchmark column name)
    skills = [
        ('communication', 'communication_required'),
        ('problem_solving', 'problem_solving_required'),
        ('code_quality', 'code_quality_required'),
        ('optimization', 'optimization_required'),
        ('debugging', 'debugging_required')
    ]
    
    for skill, bench_key in skills:
        candidate_val = candidate_scores.get(skill, 0)
        required_val = benchmark.get(bench_key, 100)
        
        ratio = min(1.0, candidate_val / required_val) if required_val > 0 else 1.0
        skill_ratios.append(ratio * weights[skill])
        skill_gaps[skill] = candidate_val - required_val
        
    readiness_score = int(sum(skill_ratios) * 100)
    return {
        "readiness_score": readiness_score,
        "skill_gaps": skill_gaps,
        "candidate_scores": {
            "problem_solving": candidate_scores.get("problem_solving", 0),
            "optimization": candidate_scores.get("optimization", 0),
            "code_quality": candidate_scores.get("code_quality", 0),
            "communication": candidate_scores.get("communication", 0),
            "debugging": candidate_scores.get("debugging", 0)
        },
        "benchmark_scores": {
            "problem_solving": benchmark.get("problem_solving_required", 0),
            "optimization": benchmark.get("optimization_required", 0),
            "code_quality": benchmark.get("code_quality_required", 0),
            "communication": benchmark.get("communication_required", 0),
            "debugging": benchmark.get("debugging_required", 0)
        }
    }

# --- Candidate Dashboard Routes ---

from database import (
    get_candidate_reports, get_report_by_id, set_target_company, 
    get_target_company, get_company_benchmarks, get_benchmark,
    save_progress_snapshot, get_progress_history
)
from models import TargetCompanyRequest, ProgressResponse, ProgressSnapshotModel

@app.get("/candidate/reports")
def list_candidate_reports(user_id: str = Depends(get_current_user_id)):
    return get_candidate_reports(user_id)

@app.get("/candidate/reports/{report_id}")
def fetch_specific_report(report_id: str, user_id: str = Depends(get_current_user_id)):
    report = get_report_by_id(report_id, user_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or access denied")
    return report

@app.post("/candidate/target-company")
def update_target_company(req: TargetCompanyRequest, user_id: str = Depends(get_current_user_id)):
    target_id = set_target_company(user_id, req.company_name, req.role, req.target_level)
    if not target_id:
        raise HTTPException(status_code=500, detail="Failed to update target company")
    
    # Recalculate readiness using latest report if exists
    reports = get_candidate_reports(user_id)
    if reports:
        latest = reports[0]
        benchmark = get_benchmark(req.company_name, req.role, req.target_level)
        if benchmark:
            readiness = calculate_readiness(latest, benchmark)
            readiness["ai_analysis"] = generate_ai_analysis(readiness, latest)
            save_progress_snapshot(user_id, target_id, readiness)
            
    return {"message": "Target company updated", "target_id": target_id}

@app.get("/candidate/target-company")
def fetch_target_company(user_id: str = Depends(get_current_user_id)):
    target = get_target_company(user_id)
    if not target:
        return {}
    return target

@app.get("/candidate/progress", response_model=ProgressResponse)
def get_candidate_progress(user_id: str = Depends(get_current_user_id)):
    target = get_target_company(user_id)
    
    # Get history for ACTIVE target if exists, else all history
    target_id = target['id'] if target else None
    history = get_progress_history(user_id, target_id)
    
    formatted_history = [
        ProgressSnapshotModel(date=h['date'].strftime("%Y-%m-%d"), readiness_score=h['readiness_score'])
        for h in history
    ]
    
    current_readiness = formatted_history[-1].readiness_score if formatted_history else 0
    
    # Get skill gaps & analysis from latest report if possible
    skill_gaps = {}
    candidate_scores = {}
    benchmark_scores = {}
    ai_analysis = "Set a target company and complete an interview to see your analysis."
    
    if target:
        reports = get_candidate_reports(user_id)
        if reports:
            latest = reports[0]
            benchmark = get_benchmark(target['company_name'], target['role'], target['target_level'])
            if benchmark:
                res = calculate_readiness(latest, benchmark)
                skill_gaps = res["skill_gaps"]
                candidate_scores = res["candidate_scores"]
                benchmark_scores = res["benchmark_scores"]
                ai_analysis = generate_ai_analysis(res, latest)

    return ProgressResponse(
        target_company=target['company_name'] if target else None,
        target_level=target['target_level'] if target else None,
        current_readiness=current_readiness,
        history=formatted_history,
        skill_gaps=skill_gaps,
        ai_analysis=ai_analysis,
        candidate_scores=candidate_scores,
        benchmark_scores=benchmark_scores
    )

@app.get("/candidate/benchmarks")
def list_benchmarks():
    return get_company_benchmarks()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
