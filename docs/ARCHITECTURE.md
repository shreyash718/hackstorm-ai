# Technical Architecture

This document provides a deep dive into the architecture of HackStorm AI, covering the frontend, backend, and AI integration.

## System Overview

HackStorm AI is built using a modern decoupled architecture:
- **Frontend**: A Next.js application providing the candidate interface, recruiter dashboard, and admin panel.
- **Backend**: A FastAPI server handling logic, database interactions, and AI orchestration.
- **Database**: PostgreSQL (via Supabase) for structured data storage.
- **Authentication**: Supabase Auth for user management.
- **AI Engine**: A flexible LLM bridge supporting **Ollama** (Local), **Groq** (Cloud), and **Google Gemini**.

---

## Frontend Architecture

### Framework
Built with **Next.js 14** using the **App Router** for optimized routing and server-side rendering where applicable.

### Component Structure
- `app/`: Contains the main application routes.
  - `assessment/`: Candidate assessment flow.
  - `recruiter/`: Recruiter-specific pages (dashboard, assessments).
  - `admin/`: Platform administration.
- `components/`: Reusable React components.
  - `ChatPanel`: Interactive AI chat interface.
  - `CodeEditor`: Monaco-based code editor.
  - `VoiceController`: Manages voice interaction and speech recognition.

### Voice & Interaction
The `VoiceController` uses the **Web Speech API** (`window.speechSynthesis`) for Text-to-Speech (TTS) and `window.webkitSpeechRecognition` for candidate input. This ensures low-latency voice interaction without requiring a dedicated cloud TTS API.

---

## Backend Architecture

### API Framework
Built with **FastAPI**, providing high-performance asynchronous endpoints.

### Key Modules
- `main.py`: Entry point and API route definitions.
- `interviewer.py`: Logic for building AI prompts and handling phase transitions. Supports multiple LLM providers via a unified interface.
- `evaluator.py`: Generates comprehensive candidate reports.
- `database.py`: Data access layer for PostgreSQL/Supabase.
- `models.py`: Pydantic models for request/response validation.

### LLM Orchestration
The system can be configured via environment variables to use different LLM backends:
- **Ollama**: For local, offline development using models like Mistral or Llama.
- **Groq**: For production-grade, high-speed inference (Llama 3.1 8B).
- **Gemini**: For complex evaluation and fallback logic.

---

## AI Interaction Lifecycle
1. **INTRO**: AI introduces the problem and sets the stage.
2. **BRAINSTORM**: Candidate explains their approach; AI provides hints and clarifies requirements.
3. **CODING**: Candidate implements the solution; AI monitors and asks clarifying questions.
4. **OPTIMIZATION**: AI challenges the candidate to improve time/space complexity.
5. **COMPLETED**: Interview ends, and the evaluation pipeline starts.

---

## Data Model

Key entities stored in PostgreSQL:
- **Users**: Admin, Recruiters, and Candidates.
- **Problems**: DSA problem bank.
- **Sessions**: Individual interview attempts and chat history.
- **Reports**: Evaluation results and scores.
- **Assessments**: Collections of problems assigned by recruiters.

---

## Low Level Design (LLD)

For a more granular view of the implementation details, please see the **[Low Level Design Folder](file:///c:/interview-app/docs/lld/)**.
