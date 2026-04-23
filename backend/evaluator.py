from interviewer import call_gemini
import os
import json
from typing import Dict, Any, List

def generate_report(problem: Dict[str, Any], chat_history: List[Dict[str, str]], final_code: str) -> Dict[str, Any]:
    history_text = ""
    for msg in chat_history:
        role = "Candidate" if msg["role"] == "user" else "Interviewer"
        history_text += f"{role}: {msg['content']}\n"

    system_prompt = "You are a senior technical interviewer. Evaluate the candidate's performance based on the provided conversation and code. Return ONLY valid JSON."
    
    user_message = f"""You evaluated a candidate solving: {problem['title']}

Full conversation:
{history_text}

Final code submitted:
```
{final_code}
```

Give a structured evaluation as JSON with these exact keys:
{{
  "overall_score": <number 1-100>,
  "hire_recommendation": <"Strong Hire" | "Hire" | "No Hire">,
  "problem_solving": <number 1-100>,
  "code_quality": <number 1-100>,
  "communication": <number 1-100>,
  "optimization": <number 1-100>,
  "debugging": <number 1-100>,
  "time_complexity": "<e.g. O(n)>",
  "space_complexity": "<e.g. O(n)>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>"],
  "summary": "<2-3 sentence overall summary>"
}}

Return ONLY valid JSON, without formatting blocks or markdown.
"""

    try:
        reply = call_gemini(system_prompt, user_message)
        
        raw = reply.strip()
        # Remove markdown code blocks if present
        if raw.startswith("```json"):
            raw = raw[7:]
        elif raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
            
        return json.loads(raw.strip())
    except Exception as e:
        print(f"Evaluation generation error: {e}")
        return {
            "error": "Failed to generate or parse evaluation",
            "detail": str(e)
        }
