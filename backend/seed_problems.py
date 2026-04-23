import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

problems = [
    {
        "title": "Two Sum",
        "difficulty": "Easy",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
        ],
        "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        "tags": ["Array", "Hash Table"]
    },
    {
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order. 3. Every close bracket has a corresponding open bracket of the same type.",
        "examples": [
            {"input": "s = '()'", "output": "true"},
            {"input": "s = '()[]{}'", "output": "true"},
            {"input": "s = '(]'", "output": "false"}
        ],
        "constraints": "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
        "tags": ["String", "Stack"]
    },
    {
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "examples": [
            {"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"},
            {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]"}
        ],
        "constraints": "1 <= intervals.length <= 10^4\nintervals[i].length == 2",
        "tags": ["Array", "Sorting"]
    },
    {
        "title": "Trapping Rain Water",
        "difficulty": "Hard",
        "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "examples": [
            {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
            {"input": "height = [4,2,0,3,2,5]", "output": "9"}
        ],
        "constraints": "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
        "tags": ["Array", "Two Pointers", "Dynamic Programming", "Stack"]
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "examples": [
            {"input": "s = 'abcabcbb'", "output": "3"},
            {"input": "s = 'bbbbb'", "output": "1"},
            {"input": "s = 'pwwkew'", "output": "3"}
        ],
        "constraints": "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
        "tags": ["Hash Table", "String", "Sliding Window"]
    },
    {
        "title": "Reverse Linked List",
        "difficulty": "Easy",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
            {"input": "head = [1,2]", "output": "[2,1]"}
        ],
        "constraints": "The number of nodes in the list is the range [0, 5000]\n-5000 <= Node.val <= 5000",
        "tags": ["Linked List", "Recursion"]
    }
]

def seed():
    if not db_url:
        print("DATABASE_URL not found")
        return
    try:
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        conn.autocommit = True
        with conn.cursor() as cur:
            # Check if is_public column exists
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='problems' AND column_name='is_public';")
            has_visibility = bool(cur.fetchone())
            
            for p in problems:
                # Check if exists
                cur.execute("SELECT id FROM problems WHERE title = %s", (p["title"],))
                if cur.fetchone():
                    print(f"Problem '{p['title']}' already exists. Skipping.")
                    continue
                
                if has_visibility:
                    cur.execute("""
                        INSERT INTO problems (title, difficulty, description, examples, constraints, tags, is_public)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (
                        p["title"],
                        p["difficulty"],
                        p["description"],
                        json.dumps(p["examples"]),
                        p["constraints"],
                        p["tags"],
                        True
                    ))
                else:
                    cur.execute("""
                        INSERT INTO problems (title, difficulty, description, examples, constraints, tags)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        p["title"],
                        p["difficulty"],
                        p["description"],
                        json.dumps(p["examples"]),
                        p["constraints"],
                        p["tags"]
                    ))
                print(f"Seeded: {p['title']}")
        print("\nSeeding complete!")
    except Exception as e:
        print(f"Seeding error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    seed()
