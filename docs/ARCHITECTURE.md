# Technical Architecture

This document provides a deep dive into the architecture of HackStorm AI, covering the frontend, backend, and AI integration.

## System Overview

HackStorm AI is built using a modern decoupled architecture:
- **Frontend**: A Next.js application providing the candidate interface, recruiter dashboard, and admin panel.
- **Backend**: A FastAPI server handling logic, database interactions, and AI orchestration.
- **Database**: PostgreSQL (via Supabase) for structured data storage.
- **Authentication**: Supabase Auth for user management.
- **AI Engine**: Google Gemini Pro for real-time interviewing and candidate evaluation.

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
  - `VoiceController`: Manages voice interaction and TTS.

### Voice & Interaction
The `VoiceController` uses the Web Speech API for Text-to-Speech (TTS) and custom Voice Activity Detection (VAD) logic to provide a hands-free interview experience.

---

## Backend Architecture

### API Framework
Built with **FastAPI**, providing high-performance asynchronous endpoints.

### Key Modules
- `main.py`: Entry point and API route definitions.
- `interviewer.py`: Logic for building AI prompts and handling phase transitions.
- `evaluator.py`: Generates comprehensive candidate reports using Gemini.
- `database.py`: Data access layer for PostgreSQL/Supabase.
- `models.py`: Pydantic models for request/response validation.

### Interview Lifecycle
1. **INTRO**: AI introduces the problem and sets the stage.
2. **BRAINSTORM**: Candidate explains their approach; AI provides hints and clarifies requirements.
3. **CODING**: Candidate implements the solution; AI monitors and asks clarifying questions.
4. **OPTIMIZATION**: AI challenges the candidate to improve time/space complexity.
5. **COMPLETED**: Interview ends, and the evaluation pipeline starts.

---

## AI Integration

### Prompt Engineering
The system uses sophisticated system prompts that dynamically incorporate:
- Problem description and constraints.
- Current interview phase.
- Real-time code state.
- Chat history.

### Phase Detection
The backend automatically detects when a candidate should move to the next phase based on their responses and code progress, ensuring a structured yet flexible interview flow.

---

## Data Model

Key entities stored in PostgreSQL:
- **Users**: Admin, Recruiters, and Candidates.
- **Problems**: DSA problem bank.
- **Sessions**: Individual interview attempts and chat history.
- **Reports**: Evaluation results and scores.
- **Assessments**: Collections of problems assigned by recruiters.
