import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

sql = """
CREATE TABLE IF NOT EXISTS recruiters (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE problems ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES recruiters(user_id) NULL;

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY,
  recruiter_id UUID REFERENCES recruiters(user_id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  problem_id INT REFERENCES problems(id),
  allowed_languages TEXT[],
  ai_enabled BOOLEAN DEFAULT true,
  time_limit_mins INT DEFAULT 30,
  order_index INT DEFAULT 0
);

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES assessments(id) NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS candidate_name TEXT NULL;
"""

def migrate():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            print("Migration successful.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
