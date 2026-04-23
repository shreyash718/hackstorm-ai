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
    
    user_message = f"""You are an extremely rigorous technical bar-raiser. Evaluate the candidate's performance based on the conversation and final code.

STRICT GRADING CRITERIA:
1. If the conversation is empty, minimal (less than 5 meaningful turns), or irrelevant, you MUST give an overall_score below 20 and a 'No Hire' recommendation.
2. If the final code is empty, incomplete, or contains syntax errors, penalize the 'code_quality' and 'problem_solving' heavily.
3. Do NOT give 'free' points. An average candidate should score around 50. A score above 80 is reserved for exceptional performance.
4. If the candidate was silent or didn't solve the core problem, they MUST receive a 'No Hire'.

PROBLEM TO SOLVE: {problem['title']}
{problem['description']}

CONVERSATION HISTORY:
{history_text}

FINAL CODE SUBMITTED:
```
{final_code if final_code.strip() else "[NO CODE SUBMITTED]"}
```

Return a structured evaluation as JSON with these exact keys:
{{
  "overall_score": <number 0-100>,
  "hire_recommendation": <"Strong Hire" | "Hire" | "No Hire">,
  "problem_solving": <number 0-100>,
  "code_quality": <number 0-100>,
  "communication": <number 0-100>,
  "optimization": <number 0-100>,
  "debugging": <number 0-100>,
  "time_complexity": "<e.g. O(n)>",
  "space_complexity": "<e.g. O(n)>",
  "strengths": ["<detailed strength 1>", "<detailed strength 2>"],
  "improvements": ["<critical area 1>", "<critical area 2>"],
  "summary": "<3-4 sentence professional technical assessment>"
}}

IMPORTANT: Return ONLY the JSON object. Do not include any explanations before or after.
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
