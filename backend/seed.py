import os
import json
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

PROBLEMS = [
    {
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.",
        "examples": [
            {"input": "s = '()'", "output": "true"},
            {"input": "s = '()[]{}'", "output": "true"},
            {"input": "s = '(]'", "output": "false"}
        ],
        "constraints": "- 1 <= s.length <= 10^4\n- s consists of parentheses only '()[]{}'",
        "tags": ["String", "Stack"]
    },
    {
        "title": "LRU Cache",
        "difficulty": "Medium",
        "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
        "examples": [
            {"input": "['LRUCache', 'put', 'put', 'get', 'put', 'get']\\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]", "output": "[null, null, null, 1, null, -1]"}
        ],
        "constraints": "- 1 <= capacity <= 3000\n- 0 <= key <= 10^4\n- 0 <= value <= 10^5",
        "tags": ["Hash Table", "Linked List", "Design", "Doubly-Linked List"]
    },
    {
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "description": "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "examples": [
            {"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"},
            {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]"}
        ],
        "constraints": "- 1 <= intervals.length <= 10^4\n- intervals[i].length == 2\n- 0 <= starti <= endi <= 10^4",
        "tags": ["Array", "Sorting"]
    },
    {
        "title": "Group Anagrams",
        "difficulty": "Medium",
        "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        "examples": [
            {"input": "strs = ['eat','tea','tan','ate','nat','bat']", "output": "[['bat'],['nat','tan'],['ate','eat','tea']]"},
            {"input": "strs = ['']", "output": "[['']]"}
        ],
        "constraints": "- 1 <= strs.length <= 10^4\n- 0 <= strs[i].length <= 100\n- strs[i] consists of lowercase English letters",
        "tags": ["Array", "Hash Table", "String", "Sorting"]
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "examples": [
            {"input": "prices = [7,1,5,3,6,4]", "output": "5"},
            {"input": "prices = [7,6,4,3,1]", "output": "0"}
        ],
        "constraints": "- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4",
        "tags": ["Array", "Dynamic Programming"]
    },
    {
        "title": "Course Schedule",
        "difficulty": "Medium",
        "description": "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`. Return `true` if you can finish all courses. Otherwise, return `false`.",
        "examples": [
            {"input": "numCourses = 2, prerequisites = [[1,0]]", "output": "true"},
            {"input": "numCourses = 2, prerequisites = [[1,0],[0,1]]", "output": "false"}
        ],
        "constraints": "- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000\n- prerequisites[i].length == 2",
        "tags": ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"]
    },
    {
        "title": "Find Median from Data Stream",
        "difficulty": "Hard",
        "description": "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values. Implement the `MedianFinder` class:\n- `MedianFinder()` initializes the `MedianFinder` object.\n- `void addNum(int num)` adds the integer `num` from the data stream to the data structure.\n- `double findMedian()` returns the median of all elements so far.",
        "examples": [
            {"input": "['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian']\\n[[], [1], [2], [], [3], []]", "output": "[null, null, null, 1.5, null, 2.0]"}
        ],
        "constraints": "- -10^5 <= num <= 10^5\n- There will be at least one element in the data structure before calling findMedian.\n- At most 5 * 10^4 calls will be made to addNum and findMedian.",
        "tags": ["Two Pointers", "Design", "Sorting", "Heap (Priority Queue)", "Data Stream"]
    },
    {
        "title": "Word Search",
        "difficulty": "Medium",
        "description": "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
        "examples": [
            {"input": "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED'", "output": "true"},
            {"input": "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'SEE'", "output": "true"}
        ],
        "constraints": "- m == board.length\n- n = board[i].length\n- 1 <= m, n <= 6\n- 1 <= word.length <= 15",
        "tags": ["Array", "Backtracking", "Matrix"]
    },
    {
        "title": "Reverse Linked List",
        "difficulty": "Easy",
        "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
            {"input": "head = [1,2]", "output": "[2,1]"}
        ],
        "constraints": "- The number of nodes in the list is the range [0, 5000].\n- -5000 <= Node.val <= 5000",
        "tags": ["Linked List", "Recursion"]
    },
    {
        "title": "Trapping Rain Water",
        "difficulty": "Hard",
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
        "examples": [
            {"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"},
            {"input": "height = [4,2,0,3,2,5]", "output": "9"}
        ],
        "constraints": "- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5",
        "tags": ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"]
    }
]

def seed_db():
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            for p in PROBLEMS:
                # Check if it already exists to prevent duplicates if run multiple times
                cur.execute("SELECT id FROM problems WHERE title = %s AND created_by IS NULL", (p["title"],))
                if not cur.fetchone():
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
                    print(f"Inserted: {p['title']}")
                else:
                    print(f"Skipped (already exists): {p['title']}")
        print("Database seeding completed.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_db()
