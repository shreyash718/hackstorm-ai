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

from google import genai
from google.genai import types

_gemini_client = None

def get_llm_client():
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client

def call_gemini(system_prompt: str, user_message: str) -> str:
    """LLM call using google.genai SDK."""
    try:
        client = get_llm_client()
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise

def call_gemini_stream(system_prompt: str, user_message: str):
    """LLM stream using google.genai SDK."""
    try:
        client = get_llm_client()
        response_stream = client.models.generate_content_stream(
            model="gemini-3-flash-preview",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Gemini API Stream Error: {e}")
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
