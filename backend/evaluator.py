import google.generativeai as genai
import os
import json
from typing import Dict, Any, List

def generate_report(problem: Dict[str, Any], chat_history: List[Dict[str, str]], final_code: str) -> Dict[str, Any]:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")

    history_text = ""
    for msg in chat_history:
        role = "Candidate" if msg["role"] == "user" else "Interviewer"
        history_text += f"{role}: {msg['content']}\n"

    prompt = f"""You evaluated a candidate solving: {problem['title']}

Full conversation:
{history_text}

Final code submitted:
```
{final_code}
```

Give a structured evaluation as JSON with these exact keys:
{{
  "overall_score": <number 1-10>,
  "hire_recommendation": <"Strong Hire" | "Hire" | "No Hire">,
  "problem_solving": <number 1-10>,
  "code_quality": <number 1-10>,
  "communication": <number 1-10>,
  "optimization": <number 1-10>,
  "time_complexity": "<e.g. O(n)>",
  "space_complexity": "<e.g. O(n)>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>"],
  "summary": "<2-3 sentence overall summary>"
}}

Return ONLY valid JSON, without formatting blocks or markdown.
"""

    response = model.generate_content(prompt)
    try:
        raw = response.text.strip()
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        return json.loads(raw.strip())
    except Exception as e:
        return {
            "error": "Failed to parse evaluation",
            "raw": response.text
        }
