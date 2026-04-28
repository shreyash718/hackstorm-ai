from interviewer import call_gemini
import os
import json
from typing import Dict, Any, List

def generate_report(problem: Dict[str, Any], chat_history: List[Dict[str, str]], final_code: str) -> Dict[str, Any]:
    history_text = ""
    for msg in chat_history:
        role = "Candidate" if msg["role"] == "user" else "Interviewer"
        history_text += f"{role}: {msg['content']}\n"

    system_prompt = "You are a rigorous technical interviewer. Evaluate the candidate's performance based on the provided conversation and code. Return ONLY valid JSON."
    
    user_message = f"""You are an extremely rigorous technical bar-raiser. Evaluate the candidate's performance based on the conversation and final code.

STRICT GRADING CRITERIA:
1. Provide extremely accurate and harsh evaluations on a scale of 1 to 10 for every metric.
2. An average candidate should score around 5. 10 is reserved for flawless, exceptional performance. 1 is for absolute failure.
3. If the conversation is empty, minimal, or the candidate didn't solve the core problem, scores MUST be very low (1-3).
4. If the final code is empty or has syntax errors, penalize compilation_success and code_quality heavily.

PROBLEM TO SOLVE: {problem['title']}
{problem['description']}

CONVERSATION HISTORY:
{history_text}

FINAL CODE SUBMITTED:
```
{final_code if final_code.strip() else "[NO CODE SUBMITTED]"}
```

Return a structured evaluation as JSON with these exact nested keys (all values MUST be integers 1-10 unless specified otherwise):
{{
  "technical_competence": {{ "concept_accuracy": <1-10>, "depth_of_knowledge": <1-10>, "cross_topic_linking": <1-10> }},
  "problem_solving": {{ "approach_quality": <1-10>, "time_to_solution": <1-10>, "hints_used": <1-10> (1=many hints, 10=no hints), "optimization_level": <1-10> }},
  "coding_execution": {{ "compilation_success": <1-10>, "testcases_passed_ratio": <1-10>, "edge_case_handling": <1-10>, "code_quality": <1-10> }},
  "debugging": {{ "error_detection_speed": <1-10>, "fix_accuracy": <1-10>, "number_of_attempts": <1-10> (1=many attempts, 10=one attempt), "retry_efficiency": <1-10> }},
  "communication": {{ "clarity": <1-10>, "structure": <1-10>, "confidence": <1-10>, "filler_word_frequency": <1-10> (1=very frequent fillers, 10=no fillers) }},
  "behavioral": {{ "consistency": <1-10>, "honesty": <1-10>, "confidence_level": <1-10>, "attitude": <1-10> }},
  "adaptability": {{ "improvement_trend": <1-10>, "response_to_hints": <1-10> }},
  "hire_recommendation": "<'Strong Hire' | 'Hire' | 'No Hire'>",
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
        if raw.startswith("```json"): raw = raw[7:]
        elif raw.startswith("```"): raw = raw[3:]
        if raw.endswith("```"): raw = raw[:-3]
            
        data = json.loads(raw.strip())
        
        # Helper to safely extract sub-metrics and ensure 1-10 range
        def safe_get(d, key, sub_key, default=5):
            try:
                val = d.get(key, {}).get(sub_key, default)
                return max(1, min(10, int(val)))
            except:
                return default

        # 1. Extract and Normalize (x_norm = x / 10 -> which maps to 10-100 scale directly via * 10)
        # We will directly calculate the percentages (0-100) for the final report fields by multiplying the average of 1-10 by 10.

        # Tech = avg(concept, depth, linking)
        tc = data.get("technical_competence", {})
        tech_score = sum([safe_get(data, "technical_competence", k) for k in ["concept_accuracy", "depth_of_knowledge", "cross_topic_linking"]]) / 3

        # PS = avg(approach, time, hints, optimization)
        ps_score = sum([safe_get(data, "problem_solving", k) for k in ["approach_quality", "time_to_solution", "hints_used", "optimization_level"]]) / 4

        # Code = avg(compilation, testcases, edge, quality)
        code_score = sum([safe_get(data, "coding_execution", k) for k in ["compilation_success", "testcases_passed_ratio", "edge_case_handling", "code_quality"]]) / 4

        # Debug = avg(error, fix, attempts, retry)
        debug_score = sum([safe_get(data, "debugging", k) for k in ["error_detection_speed", "fix_accuracy", "number_of_attempts", "retry_efficiency"]]) / 4

        # Comm = avg(clarity, structure, confidence, (10 - filler) -> wait, if filler=1 means bad, filler=10 means good, then we just average it directly. The prompt says 1=very frequent, 10=no fillers)
        comm_score = sum([safe_get(data, "communication", k) for k in ["clarity", "structure", "confidence", "filler_word_frequency"]]) / 4

        # Behav = avg(consistency, honesty, confidence_level, attitude)
        behav_score = sum([safe_get(data, "behavioral", k) for k in ["consistency", "honesty", "confidence_level", "attitude"]]) / 4
        
        # Adapt = avg(improvement, response_to_hints)
        adapt_score = sum([safe_get(data, "adaptability", k) for k in ["improvement_trend", "response_to_hints"]]) / 2

        # Overall Score: Weighted average of the above
        overall_avg = (tech_score * 1.5 + ps_score * 2.0 + code_score * 2.0 + debug_score * 1.0 + comm_score * 1.0 + behav_score * 0.5 + adapt_score * 1.0) / 9.0

        # Map to the existing Report format (scaling 1-10)
        report = {
            "overall_score": round(overall_avg, 1),
            "problem_solving": round(ps_score, 1),
            "code_quality": round(code_score, 1),
            "communication": round(comm_score, 1),
            "optimization": round(safe_get(data, "problem_solving", "optimization_level"), 1),
            "debugging": round(debug_score, 1),
            "hire_recommendation": data.get("hire_recommendation", "No Hire"),
            "time_complexity": data.get("time_complexity", "Unknown"),
            "space_complexity": data.get("space_complexity", "Unknown"),
            "strengths": data.get("strengths", []),
            "improvements": data.get("improvements", []),
            "summary": data.get("summary", "No summary provided."),
            "detailed_metrics": data # We can keep the raw data for future dashboard use
        }

        return report
    except Exception as e:
        print(f"Evaluation generation error: {e}")
        return {
            "error": "Failed to generate or parse evaluation",
            "detail": str(e)
        }
