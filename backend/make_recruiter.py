import os
import psycopg2
import sys
from dotenv import load_dotenv

load_dotenv()

def make_recruiter(email):
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        with conn.cursor() as cur:
            # First, find the user in Supabase auth
            cur.execute("SELECT id FROM auth.users WHERE email = %s;", (email,))
            user = cur.fetchone()
            
            if not user:
                print(f"Error: Could not find a registered user with the email: {email}")
                print("Make sure you sign up on the frontend first!")
                return
                
            user_id = user[0]
            
            # Insert them into the recruiters table
            cur.execute(
                "INSERT INTO recruiters (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING;", 
                (user_id,)
            )
            print(f"SUCCESS! User {email} has been granted Recruiter privileges.")
            print("You can now access the recruiter dashboard.")
            
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_recruiter.py <email>")
        sys.exit(1)
        
    make_recruiter(sys.argv[1])
