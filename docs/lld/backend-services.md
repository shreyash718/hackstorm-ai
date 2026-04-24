# LLD: Backend Services

This document details the low-level design of the FastAPI-based backend services for HackStorm AI.

## 1. Interview Orchestration (`interviewer.py`)

The `interviewer.py` module is responsible for managing the AI's personality, prompt construction, and interview phase detection.

### 1.1 State Machine: Phase Detection
The interview flows through several predefined phases. Transition is determined by `detect_phase_transition` based on conversation history and specific triggers.

| Phase | Description | Transition Trigger |
|-------|-------------|-------------------|
| `INTRO` | AI introduces itself and sets the tone. | `len(history) >= 2` |
| `PROBLEM PRESENTATION` | AI presents the DSA problem. | `len(history) >= 4` |
| `APPROACH DISCUSSION` | AI discusses potential solutions and trade-offs. | `len(history) >= 8` |
| `CODING` | Candidate writes the solution. AI monitors and nudges. | User says "done" or similar |
| `REVIEW & OPTIMIZATION` | AI asks for complexity analysis and optimizations. | `len(history) >= 16` |
| `WRAP UP` | AI concludes the interview. | `INTERVIEW_COMPLETE` token detected |

### 1.2 System Prompt Construction
The `build_system_prompt` function dynamically generates the system instructions for the LLM. It includes:
- **Arjun's Personality**: Senior engineer, warm but rigorous.
- **Constraints**: 3-sentence limit, no code generation, no bullet points.
- **Context**: Current code from the editor and full chat history.

## 2. Evaluation Logic (`evaluator.py`)

The evaluation pipeline is triggered once the interview is complete. It uses a specialized prompt to extract a structured JSON report from the LLM.

### 2.1 Metrics Captured
- **Technical Skill**: Correctness of logic, time/space complexity understanding.
- **Problem Solving**: How the candidate handled hints and edge cases.
- **Communication**: Clarity of explanation and responsiveness to feedback.
- **Behavioral**: Confidence, humility, and professional tone.

## 3. LLM Abstraction Layer

The system supports multiple LLM providers via a unified interface:
- **Local (Ollama)**: Uses the `ollama` Python library for local inference.
- **Cloud (Groq/OpenAI)**: Uses the `openai` SDK with custom `base_url` for high-speed providers.

### 3.1 Streaming Implementation
The `call_gemini_stream` (generic name) handles Server-Sent Events (SSE) from the LLM, enabling real-time response generation on the frontend.

## 4. Data Access Layer (`database.py`)

Uses `psycopg2` for direct PostgreSQL interaction and Supabase client for specific operations.
- **Pooling**: Connection pooling is managed to handle concurrent candidate sessions.
- **Migrations**: Custom script-based migrations for schema updates (e.g., `migrate_assessments.py`).
