import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

conn = psycopg2.connect(db_url)
cur = conn.cursor()

try:
    print("Cleaning duplicate benchmarks...")
    cur.execute("""
        DELETE FROM company_benchmarks a
        USING company_benchmarks b
        WHERE a.id > b.id
        AND a.company_name = b.company_name
        AND a.role = b.role
        AND a.level = b.level;
    """)
    print(f"Rows deleted: {cur.rowcount}")

    print("Adding unique constraint...")
    cur.execute("""
        ALTER TABLE company_benchmarks 
        DROP CONSTRAINT IF EXISTS unique_company_role_level;
        
        ALTER TABLE company_benchmarks 
        ADD CONSTRAINT unique_company_role_level 
        UNIQUE (company_name, role, level);
    """)
    conn.commit()
    print("Success!")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
finally:
    conn.close()




