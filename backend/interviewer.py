import os
import time
from typing import List, Dict, Any
import ollama
import openai

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

def get_llm_client():
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()
    if provider == "ollama":
        return None  # We use the ollama library directly
    
    return openai.OpenAI(
        api_key=os.getenv("LLM_API_KEY"),
        base_url=os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
    )

def call_gemini(system_prompt: str, user_message: str) -> str:
    """Generic LLM call (keeping name for compatibility)."""
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()
    model = os.getenv("LLM_MODEL", "mistral")
    
    try:
        if provider == "ollama":
            response = ollama.chat(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ]
            )
            return response['message']['content'].strip()
        else:
            client = get_llm_client()
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ]
            )
            return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM Error ({provider}): {e}")
        raise

def call_gemini_stream(system_prompt: str, user_message: str):
    """Generic LLM stream (keeping name for compatibility)."""
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()
    model = os.getenv("LLM_MODEL", "mistral")
    
    try:
        if provider == "ollama":
            stream = ollama.chat(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ],
                stream=True
            )
            for chunk in stream:
                if 'message' in chunk and 'content' in chunk['message']:
                    yield chunk['message']['content']
        else:
            client = get_llm_client()
            stream = client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ],
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
    except Exception as e:
        print(f"LLM Stream Error ({provider}): {e}")
        raise

def detect_phase_transition(history: List[Dict[str, str]], current_phase: str) -> str:
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
