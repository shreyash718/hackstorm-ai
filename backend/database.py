import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from typing import Dict, Any

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return None
    try:
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def save_session(session_data: Dict[str, Any]):
    conn = get_db_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO sessions (id, user_id, problem_id, phase, chat_history, assessment_id, candidate_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                phase = EXCLUDED.phase,
                chat_history = EXCLUDED.chat_history,
                ended_at = EXCLUDED.ended_at
            """, (
                session_data["id"],
                session_data.get("user_id"),
                session_data["problem_id"],
                session_data["phase"],
                json.dumps(session_data.get("chat_history", [])),
                session_data.get("assessment_id"),
                session_data.get("candidate_name")
            ))
    except Exception as e:
        print(f"Error saving session: {e}")
    finally:
        conn.close()

def update_session(session_id: str, updates: Dict[str, Any]):
    conn = get_db_connection()
    if not conn:
        return
    try:
        set_clauses = []
        values = []
        for key, val in updates.items():
            if key == "chat_history":
                val = json.dumps(val)
            set_clauses.append(f"{key} = %s")
            values.append(val)
        
        if not set_clauses:
            return

        values.append(session_id)
        query = f"UPDATE sessions SET {', '.join(set_clauses)} WHERE id = %s"
        
        with conn.cursor() as cur:
            cur.execute(query, tuple(values))
    except Exception as e:
        print(f"Error updating session: {e}")
    finally:
        conn.close()

def save_report(report_data: Dict[str, Any]):
    conn = get_db_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO reports (
                    id, session_id, overall_score, problem_solving, code_quality,
                    communication, optimization, hire_recommendation, strengths,
                    improvements, time_complexity, space_complexity, summary, final_code
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                report_data.get("id"),
                report_data.get("session_id"),
                report_data.get("overall_score"),
                report_data.get("problem_solving"),
                report_data.get("code_quality"),
                report_data.get("communication"),
                report_data.get("optimization"),
                report_data.get("hire_recommendation"),
                report_data.get("strengths", []),
                report_data.get("improvements", []),
                report_data.get("time_complexity"),
                report_data.get("space_complexity"),
                report_data.get("summary"),
                report_data.get("final_code")
            ))
    except Exception as e:
        print(f"Error saving report: {e}")
    finally:
        conn.close()

def get_report(session_id: str):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM reports WHERE session_id = %s", (session_id,))
            return cur.fetchone()
    except Exception as e:
        print(f"Error fetching report: {e}")
        return None
    finally:
        conn.close()

def check_admin(user_id: str) -> bool:
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM admin_users WHERE user_id = %s", (user_id,))
            return bool(cur.fetchone())
    except Exception as e:
        return False
    finally:
        conn.close()

def get_all_admins():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, created_at FROM admin_users ORDER BY created_at DESC")
            return cur.fetchall()
    except Exception as e:
        return []
    finally:
        conn.close()

def make_admin(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO admin_users (user_id) VALUES (%s) ON CONFLICT DO NOTHING", (user_id,))
    except Exception as e:
        print(f"Error making admin: {e}")
    finally:
        conn.close()

def revoke_admin(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM admin_users WHERE user_id = %s", (user_id,))
    except Exception as e:
        print(f"Error revoking admin: {e}")
    finally:
        conn.close()

def get_all_sessions():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, user_id, problem_id, started_at, ended_at, phase FROM sessions ORDER BY started_at DESC")
            return cur.fetchall()
    except Exception as e:
        return []
    finally:
        conn.close()

def get_all_reports():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, session_id, overall_score, hire_recommendation FROM reports ORDER BY created_at DESC")
            return cur.fetchall()
    except Exception as e:
        return []
    finally:
        conn.close()

# ==========================================
# RECRUITER & ASSESSMENT OPERATIONS
# ==========================================

def check_recruiter(user_id: str) -> bool:
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM recruiters WHERE user_id = %s", (user_id,))
            return bool(cur.fetchone())
    except Exception as e:
        return False
    finally:
        conn.close()

def get_all_recruiters():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, created_at FROM recruiters ORDER BY created_at DESC")
            return cur.fetchall()
    except Exception as e:
        return []
    finally:
        conn.close()

def make_recruiter(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO recruiters (user_id) VALUES (%s) ON CONFLICT DO NOTHING", (user_id,))
    except Exception as e:
        print(f"Error making recruiter: {e}")
    finally:
        conn.close()

def revoke_recruiter(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM recruiters WHERE user_id = %s", (user_id,))
    except Exception as e:
        print(f"Error revoking recruiter: {e}")
    finally:
        conn.close()

def create_assessment_in_db(assessment_id: str, recruiter_id: str, title: str, questions: list):
    import json
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            # Insert assessment
            cur.execute(
                "INSERT INTO assessments (id, recruiter_id, title) VALUES (%s, %s, %s)",
                (assessment_id, recruiter_id, title)
            )
            # Process each question
            for q in questions:
                # 1. Create the custom problem
                cur.execute("""
                    INSERT INTO problems (title, difficulty, description, examples, constraints, tags, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
                """, (
                    q.title, q.difficulty, q.description, json.dumps(q.examples),
                    q.constraints, q.tags, recruiter_id
                ))
                problem_id = cur.fetchone()['id']
                
                # 2. Link it to the assessment_questions
                import uuid
                aq_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO assessment_questions (id, assessment_id, problem_id, allowed_languages, ai_enabled, time_limit_mins, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    aq_id, assessment_id, problem_id, q.allowed_languages, q.ai_enabled, q.time_limit_mins, q.order_index
                ))
            return True
    except Exception as e:
        print(f"Error creating assessment: {e}")
        return False
    finally:
        conn.close()

def get_assessments_by_recruiter(recruiter_id: str):
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM assessments WHERE recruiter_id = %s ORDER BY created_at DESC", (recruiter_id,))
            assessments = cur.fetchall()
            # Get question counts
            for a in assessments:
                cur.execute("SELECT count(*) FROM assessment_questions WHERE assessment_id = %s", (a['id'],))
                a['question_count'] = cur.fetchone()['count']
            return assessments
    except Exception as e:
        print(f"Error fetching assessments: {e}")
        return []
    finally:
        conn.close()

def get_assessment_details(assessment_id: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM assessments WHERE id = %s", (assessment_id,))
            assessment = cur.fetchone()
            if not assessment: return None

            cur.execute("""
                SELECT aq.*, p.title, p.difficulty, p.description, p.examples, p.constraints, p.tags
                FROM assessment_questions aq
                JOIN problems p ON aq.problem_id = p.id
                WHERE aq.assessment_id = %s
                ORDER BY aq.order_index ASC
            """, (assessment_id,))
            assessment['questions'] = cur.fetchall()
            return assessment
    except Exception as e:
        print(f"Error fetching assessment details: {e}")
        return None
    finally:
        conn.close()

# ==========================================
# SUPABASE USER OPERATIONS
# ==========================================

def get_all_users():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []
    finally:
        conn.close()

def delete_user_by_id(user_id: str):
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM auth.users WHERE id = %s", (user_id,))
            return True
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False
    finally:
        conn.close()
