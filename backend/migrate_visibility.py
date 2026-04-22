import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        with conn.cursor() as cur:
            # Add is_public column to problems table
            cur.execute("ALTER TABLE problems ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;")
            
            # Set is_public = false for all problems created by a recruiter
            cur.execute("UPDATE problems SET is_public = FALSE WHERE created_by IS NOT NULL;")
            
            print("Successfully added is_public to problems table and updated recruiter problems.")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate()
