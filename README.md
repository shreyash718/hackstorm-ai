# DSA Interview Simulator

AI-powered DSA interview platform. Pick a problem, write code, get real interviewer feedback from Claude.

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- An Anthropic API key → get one at https://console.anthropic.com

---

## Setup & Run (do this once)

### Step 1 — Get your API key
1. Go to https://console.anthropic.com
2. Click "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-...`)

---

### Step 2 — Backend setup

Open a terminal and run:

```bash
cd interview-app/backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Now open .env and paste your API key:
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start the backend
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### Step 3 — Frontend setup

Open a **second terminal** and run:

```bash
cd interview-app/frontend

# Install dependencies (takes ~2 mins first time)
npm install

# Start the frontend
npm start
```

Browser opens automatically at http://localhost:3000

---

## How to use

1. **Pick a problem** from the home screen
2. **Read the problem** in the left panel
3. **Write your code** in the middle editor
4. **Talk to the AI interviewer** in the right chat panel
   - Explain your approach: *"I'm thinking of using a hashmap..."*
   - Ask for hints: *"I'm stuck, can you give me a nudge?"*
   - Discuss complexity: *"This is O(n) time and O(1) space"*
5. When done, click **END INTERVIEW** → get your evaluation report

---

## Project structure

```
interview-app/
├── backend/
│   ├── main.py          ← FastAPI server + all AI logic
│   ├── requirements.txt
│   └── .env             ← your API key goes here
└── frontend/
    ├── src/
│   │   ├── App.jsx      ← entire React app
│   │   └── index.js
    └── public/
        └── index.html
```

---

## Troubleshooting

**"connecting to backend..." stuck on home screen**
→ Backend isn't running. Make sure Step 2 is done in a separate terminal.

**"Connection error" in chat**
→ Check backend terminal for errors. Make sure ANTHROPIC_API_KEY is set in `.env`.

**Monaco editor not loading**
→ Run `npm install` again in the frontend folder.

**Port 8000 already in use**
→ `uvicorn main:app --reload --port 8001` and update API url in App.jsx line 3 to `http://localhost:8001`

---

## For the hackathon demo

Best demo flow:
1. Pick "Two Sum" (everyone knows it)
2. Start with a brute force O(n²) approach — explain it
3. Watch AI ask about complexity
4. Optimize to hashmap O(n) solution
5. AI acknowledges it and asks about edge cases
6. End interview → show the report card

This 5-minute flow shows: problem reading → coding → AI feedback loop → evaluation. That's the whole pitch.
