import json
from database import get_db_connection, release_db_connection

def get_all_problems():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            # Only return public problems for the main list
            cur.execute("SELECT * FROM problems WHERE is_public = TRUE ORDER BY id ASC")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching problems: {e}")
        return []
    finally:
        release_db_connection(conn)

def get_all_problems_admin():
    conn = get_db_connection()
    if not conn: return []
    try:
        with conn.cursor() as cur:
            # Admin gets everything
            cur.execute("SELECT * FROM problems ORDER BY id ASC")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching problems: {e}")
        return []
    finally:
        release_db_connection(conn)

def get_problem(problem_id: int):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM problems WHERE id = %s", (problem_id,))
            return cur.fetchone()
    except Exception as e:
        print(f"Error fetching problem {problem_id}: {e}")
        return None
    finally:
        release_db_connection(conn)

def add_problem(data: dict):
    conn = get_db_connection()
    if not conn: return None
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO problems (title, difficulty, description, examples, constraints, tags, is_public)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                data["title"],
                data["difficulty"],
                data["description"],
                json.dumps(data["examples"]),
                data["constraints"],
                data["tags"],
                data.get("is_public", True)
            ))
            new_id = cur.fetchone()["id"]
            return new_id
    except Exception as e:
        print(f"Error adding problem: {e}")
        return None
    finally:
        release_db_connection(conn)
