import google.generativeai as genai
import os
import time
from typing import List, Dict, Any

def build_system_prompt(problem: Dict[str, Any], phase: str, code: str, history: str) -> str:
    return f"""
You are Arjun, a senior software engineer with 6 years of 
experience conducting technical interviews at a top tech company.
You are doing a live coding interview right now.

PROBLEM: {problem['title']}
{problem['description']}

CURRENT PHASE: {phase}

CANDIDATE'S CODE RIGHT NOW:
{code if code.strip() else "No code written yet."}

YOUR PERSONALITY:
- Warm but rigorous. You want the candidate to succeed 
  but you never hand them answers.
- You speak casually. Short sentences. Real reactions.
- You remember everything said and reference it naturally.
- You adjust difficulty based on performance in real time.
- Struggling candidate: give nudges as questions, not answers.
- Excelling candidate: push harder, add constraints, 
  ask follow-up variants.

STRICT RULES:
- ONE thing at a time. Never ask two questions in one message.
- Maximum 3 sentences per response.
- Never use bullet points. Speak naturally.
- Never write code. Pseudocode in plain English only if 
  absolutely needed as a final hint.
- React to what they ACTUALLY said. Never be generic.
- Use fillers naturally: "Right", "Hmm", "Yeah", "Okay"
- Never say "Great question!" or "Excellent!"
- When interview is fully complete output: INTERVIEW_COMPLETE

CONVERSATION SO FAR:
{history}
"""

def call_gemini(system_prompt: str, user_message: str) -> str:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")
    prompt = f"{system_prompt}\n\nCandidate says: {user_message}"
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                wait_time = 2 ** (attempt + 1)  # 2, 4, 8 seconds
                print(f"Rate limited, retrying in {wait_time}s (attempt {attempt + 1}/3)")
                time.sleep(wait_time)
                if attempt == 2:
                    raise
            else:
                raise

def call_gemini_stream(system_prompt: str, user_message: str):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")
    prompt = f"{system_prompt}\n\nCandidate says: {user_message}"
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                try:
                    if chunk.text:
                        yield chunk.text
                except ValueError:
                    # Handle safety filter blocks
                    continue
            return  # Success, exit retry loop
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                wait_time = 2 ** (attempt + 1)
                print(f"Rate limited on stream, retrying in {wait_time}s (attempt {attempt + 1}/3)")
                time.sleep(wait_time)
                if attempt == 2:
                    raise
            else:
                raise

def detect_phase_transition(history: List[Dict[str, str]], current_phase: str) -> str:
    # A simple state machine logic to advance phases based on message count or keywords
    if current_phase == "INTRO" and len(history) >= 2:
        return "PROBLEM PRESENTATION"
    if current_phase == "PROBLEM PRESENTATION" and len(history) >= 4:
        return "APPROACH DISCUSSION"
    if current_phase == "APPROACH DISCUSSION" and len(history) >= 8:
        return "CODING"
    if current_phase == "CODING" and any("done" in msg["content"].lower() for msg in history[-2:]):
        return "REVIEW & OPTIMIZATION"
    if current_phase == "REVIEW & OPTIMIZATION" and len(history) >= 16:
        return "WRAP UP"
    return current_phase

def detect_interview_complete(response: str) -> bool:
    return "INTERVIEW_COMPLETE" in response
