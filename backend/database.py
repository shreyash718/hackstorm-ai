import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Connection Pool Initialization
db_url = os.getenv("DATABASE_URL")
if db_url:
    db_url = db_url.strip()
    # Min 1, Max 20 connections
    pool = SimpleConnectionPool(1, 20, db_url, cursor_factory=RealDictCursor)
else:
    pool = None

def get_db_connection():
    if not pool:
        print("Error: Database pool not initialized (check DATABASE_URL)")
        return None
    try:
        conn = pool.getconn()
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"Error getting connection from pool: {e}")
        return None

def release_db_connection(conn):
    if pool and conn:
        try:
            if not conn.autocommit:
                conn.rollback()
                conn.autocommit = True
        except Exception:
            pass
        pool.putconn(conn)

def save_session(session_data: Dict[str, Any]):
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = True
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
            return True
    except Exception as e:
        print(f"Error saving session: {e}")
        return False
    finally:
        release_db_connection(conn)

ALLOWED_SESSION_FIELDS = {"phase", "chat_history", "ended_at"}

def update_session(session_id: str, updates: Dict[str, Any]):
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = True
        set_clauses = []
        values = []
        for key, val in updates.items():
            if key not in ALLOWED_SESSION_FIELDS:
                continue
            if key == "chat_history":
                val = json.dumps(val)
            set_clauses.append(f"{key} = %s")
            values.append(val)
        
        if not set_clauses:
            return False

        values.append(session_id)
        query = f"UPDATE sessions SET {', '.join(set_clauses)} WHERE id = %s"
        
        with conn.cursor() as cur:
            cur.execute(query, tuple(values))
            return True
    except Exception as e:
        print(f"Error updating session: {e}")
        return False
    finally:
        release_db_connection(conn)

def save_report(report_data: Dict[str, Any]):
    conn = get_db_connection()
    if not conn:
        return False
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO reports (
                    id, session_id, user_id, overall_score, problem_solving, code_quality,
                    communication, optimization, debugging, hire_recommendation, strengths,
                    improvements, time_complexity, space_complexity, summary, final_code
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                report_data.get("id"),
                report_data.get("session_id"),
                report_data.get("user_id"),
                report_data.get("overall_score"),
                report_data.get("problem_solving"),
                report_data.get("code_quality"),
                report_data.get("communication"),
                report_data.get("optimization"),
                report_data.get("debugging", 0),
                report_data.get("hire_recommendation"),
                report_data.get("strengths", []),
                report_data.get("improvements", []),
                report_data.get("time_complexity"),
                report_data.get("space_complexity"),
                report_data.get("summary"),
                report_data.get("final_code")
            ))
            return True
    except Exception as e:
        print(f"Error saving report: {e}")
        return False
    finally:
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

def make_admin(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO admin_users (user_id) VALUES (%s) ON CONFLICT DO NOTHING", (user_id,))
    except Exception as e:
        print(f"Error making admin: {e}")
    finally:
        release_db_connection(conn)

def revoke_admin(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM admin_users WHERE user_id = %s", (user_id,))
    except Exception as e:
        print(f"Error revoking admin: {e}")
    finally:
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

def make_recruiter(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO recruiters (user_id) VALUES (%s) ON CONFLICT DO NOTHING", (user_id,))
    except Exception as e:
        print(f"Error making recruiter: {e}")
    finally:
        release_db_connection(conn)

def revoke_recruiter(user_id: str):
    conn = get_db_connection()
    if not conn: return
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM recruiters WHERE user_id = %s", (user_id,))
    except Exception as e:
        print(f"Error revoking recruiter: {e}")
    finally:
        release_db_connection(conn)

def create_assessment_in_db(assessment_id: str, recruiter_id: str, title: str, questions: list):
    import json
    import uuid
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = False # Use transaction
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
                    INSERT INTO problems (title, difficulty, description, examples, constraints, tags, created_by, is_public)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """, (
                    q.title, q.difficulty, q.description, json.dumps(q.examples),
                    q.constraints, q.tags, recruiter_id, False # Private by default
                ))
                problem_id = cur.fetchone()['id']
                
                # 2. Link it to the assessment_questions
                aq_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO assessment_questions (id, assessment_id, problem_id, allowed_languages, ai_enabled, time_limit_mins, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    aq_id, assessment_id, problem_id, q.allowed_languages, q.ai_enabled, q.time_limit_mins, q.order_index
                ))
            conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        print(f"Error creating assessment: {e}")
        return False
    finally:
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

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
        release_db_connection(conn)

# ==========================================
# PROBLEM OPERATIONS (ADMIN)
# ==========================================

def get_all_problems_db():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM problems ORDER BY id DESC")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching problems: {e}")
        return []
    finally:
        release_db_connection(conn)

def update_problem_in_db(problem_id: int, data: dict):
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE problems SET 
                    title = %s, difficulty = %s, description = %s, 
                    examples = %s, constraints = %s, tags = %s
                WHERE id = %s
            """, (
                data["title"], data["difficulty"], data["description"],
                json.dumps(data["examples"]), data["constraints"], data["tags"],
                problem_id
            ))
            return True
    except Exception as e:
        print(f"Error updating problem: {e}")
        return False
    finally:
        release_db_connection(conn)

def delete_problem_in_db(problem_id: int):
    conn = get_db_connection()
    if not conn: return False
    try:
        # Disable autocommit for transaction atomicity
        conn.autocommit = False
        with conn.cursor() as cur:
            # 1. Delete reports associated with sessions of this problem
            cur.execute("""
                DELETE FROM reports 
                WHERE session_id IN (SELECT id FROM sessions WHERE problem_id = %s)
            """, (problem_id,))
            
            # 2. Delete sessions associated with this problem
            cur.execute("DELETE FROM sessions WHERE problem_id = %s", (problem_id,))
            
            # 3. Delete from assessment_questions (linking table)
            cur.execute("DELETE FROM assessment_questions WHERE problem_id = %s", (problem_id,))
            
            # 4. Finally delete the problem
            cur.execute("DELETE FROM problems WHERE id = %s", (problem_id,))
            
            conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        print(f"Error deleting problem: {e}")
        return False
    finally:
        release_db_connection(conn)

def toggle_problem_visibility_db(problem_id: int, is_public: bool):
    conn = get_db_connection()
    if not conn: return False
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE problems SET is_public = %s WHERE id = %s", (is_public, problem_id))
            return True
    except Exception as e:
        print(f"Error toggling problem visibility: {e}")
        return False
    finally:
        release_db_connection(conn)

# ==========================================
# OTP OPERATIONS
# ==========================================

import hashlib

def save_otp(email: str, code: str):
    import datetime
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = True
        # Hash OTP for security
        hashed_code = hashlib.sha256(code.encode()).hexdigest()
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO admin_otps (email, otp_code, expires_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET
                otp_code = EXCLUDED.otp_code,
                expires_at = EXCLUDED.expires_at
            """, (email, hashed_code, expires_at))
            return True
    except Exception as e:
        print(f"Error saving OTP: {e}")
        return False
    finally:
        release_db_connection(conn)

def verify_otp(email: str, code: str):
    import datetime
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = True
        hashed_code = hashlib.sha256(code.encode()).hexdigest()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM admin_otps 
                WHERE email = %s AND otp_code = %s AND expires_at > %s
            """, (email, hashed_code, datetime.datetime.utcnow()))
            otp = cur.fetchone()
            if otp:
                # Delete OTP after successful verification
                cur.execute("DELETE FROM admin_otps WHERE email = %s", (email,))
                return True
            return False
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return False
    finally:
        release_db_connection(conn)

def get_user_email_by_id(user_id: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT email FROM auth.users WHERE id = %s", (user_id,))
            result = cur.fetchone()
            return result['email'] if result else None
    except Exception as e:
        print(f"Error fetching user email: {e}")
        return None
    finally:
        release_db_connection(conn)

# ==========================================
# CANDIDATE DASHBOARD & PROGRESS
# ==========================================

def get_candidate_reports(user_id: str):
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT r.*, p.title as problem_title 
                FROM reports r
                JOIN sessions s ON r.session_id = s.id
                JOIN problems p ON s.problem_id = p.id
                WHERE r.user_id = %s OR s.user_id = %s
                ORDER BY r.created_at DESC
            """, (user_id, user_id))
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching candidate reports: {e}")
        return []
    finally:
        release_db_connection(conn)

def get_report_by_id(report_id: str, user_id: str = None):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            if user_id:
                cur.execute("""
                    SELECT r.*, p.title as problem_title 
                    FROM reports r
                    JOIN sessions s ON r.session_id = s.id
                    JOIN problems p ON s.problem_id = p.id
                    WHERE r.id = %s AND (r.user_id = %s OR s.user_id = %s)
                """, (report_id, user_id, user_id))
            else:
                cur.execute("""
                    SELECT r.*, p.title as problem_title 
                    FROM reports r
                    JOIN sessions s ON r.session_id = s.id
                    JOIN problems p ON s.problem_id = p.id
                    WHERE r.id = %s
                """, (report_id,))
            return cur.fetchone()
    except Exception as e:
        print(f"Error fetching report by id: {e}")
        return None
    finally:
        release_db_connection(conn)

def set_target_company(user_id: str, company_name: str, role: str, target_level: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            # Deactivate old targets
            cur.execute("UPDATE target_companies SET is_active = FALSE WHERE user_id = %s", (user_id,))
            # Insert new active target
            cur.execute("""
                INSERT INTO target_companies (user_id, company_name, role, target_level, is_active)
                VALUES (%s, %s, %s, %s, TRUE)
                RETURNING id
            """, (user_id, company_name, role, target_level))
            new_id = cur.fetchone()['id']
            return new_id
    except Exception as e:
        print(f"Error setting target company: {e}")
        return None
    finally:
        release_db_connection(conn)

def get_target_company(user_id: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM target_companies WHERE user_id = %s AND is_active = TRUE", (user_id,))
            return cur.fetchone()
    except Exception as e:
        print(f"Error fetching target company: {e}")
        return None
    finally:
        release_db_connection(conn)

def get_company_benchmarks():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM company_benchmarks")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching benchmarks: {e}")
        return []
    finally:
        release_db_connection(conn)

def get_benchmark(company_name: str, role: str, level: str):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM company_benchmarks 
                WHERE company_name = %s AND role = %s AND level = %s
            """, (company_name, role, level))
            return cur.fetchone()
    except Exception as e:
        print(f"Error fetching benchmark: {e}")
        return None
    finally:
        release_db_connection(conn)

def save_progress_snapshot(user_id: str, target_company_id: str, readiness_data: dict):
    conn = get_db_connection()
    if not conn: return False
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO candidate_progress_snapshots (
                    user_id, target_company_id, readiness_score, 
                    communication_gap, problem_solving_gap, code_quality_gap, 
                    optimization_gap, debugging_gap, ai_analysis
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id, target_company_id, readiness_data['readiness_score'],
                readiness_data['skill_gaps'].get('communication'),
                readiness_data['skill_gaps'].get('problem_solving'),
                readiness_data['skill_gaps'].get('code_quality'),
                readiness_data['skill_gaps'].get('optimization'),
                readiness_data['skill_gaps'].get('debugging'),
                readiness_data.get('ai_analysis')
            ))
            return True
    except Exception as e:
        print(f"Error saving progress snapshot: {e}")
        return False
    finally:
        release_db_connection(conn)

def get_progress_history(user_id: str, target_id: str = None):
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            if target_id:
                cur.execute("""
                    SELECT created_at as date, readiness_score 
                    FROM candidate_progress_snapshots 
                    WHERE user_id = %s AND target_company_id = %s
                    ORDER BY created_at ASC
                """, (user_id, target_id))
            else:
                cur.execute("""
                    SELECT created_at as date, readiness_score 
                    FROM candidate_progress_snapshots 
                    WHERE user_id = %s 
                    ORDER BY created_at ASC
                """, (user_id,))
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching progress history: {e}")
        return []
    finally:
        release_db_connection(conn)
