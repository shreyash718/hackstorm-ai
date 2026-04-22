import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def create_table():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS admin_otps (
                    email TEXT PRIMARY KEY,
                    otp_code TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL
                );
            """)
            print("Successfully created admin_otps table.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_table()
