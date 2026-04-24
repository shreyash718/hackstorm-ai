# LLD: AI Orchestration

This document deep dives into the AI logic, prompt engineering, and the decision-making process behind the virtual interviewer, **Arjun**.

## 1. Prompt Engineering Strategy

The system uses a "Role-Based Multi-Phase Prompting" strategy. Instead of one giant prompt, the context is rebuilt for every turn based on the current interview phase.

### 1.1 Base System Instructions
The core personality is defined by:
- **Seniority**: 6 years of experience (Arjun).
- **Style**: Casual, conversational, uses fillers ("Hmm", "Yeah").
- **Pedagogy**: Never gives answers, only nudges and clarifying questions.

### 1.2 Phase-Specific Logic

| Phase | AI Focus | Example Nudge |
|-------|----------|---------------|
| `INTRO` | Build rapport, explain the process. | "Ready to dive in? Here's the problem." |
| `APPROACH` | Validate complexity BEFORE coding starts. | "Wait, what's the time complexity of that nested loop?" |
| `CODING` | Monitor syntax and logical flow. | "Interesting approach on line 12, what happens if the input is empty?" |
| `OPTIMIZATION` | Push for better time/space trade-offs. | "Can we do this without the extra hash map?" |

## 2. Interview Completion Detection

The interview does not end on a fixed timer. Instead, completion is determined by:
1.  **AI Detection**: The LLM outputs a special token `INTERVIEW_COMPLETE` when it feels all phases are covered.
2.  **UI Detection**: The frontend monitors the stream for this token and triggers the `onInterviewComplete` callback.

## 3. The Evaluation Pipeline

Evaluation is a two-step process:
1.  **Summarization**: The backend compiles the full chat history, the final code, and the problem description.
2.  **JSON Extraction**: A specialized "Evaluation Prompt" forces the LLM to output a JSON object matching the `reports` table schema.

### Scoring Criteria (Rubric)
- **Technical**: 40% (Logic, Complexity, Edge cases).
- **Communication**: 30% (Clarity, Responsiveness).
- **Problem Solving**: 30% (Independence, Speed).

## 4. LLM Fallback & Stability

To ensure a reliable experience, the orchestration layer supports:
- **Streaming Timeouts**: If a cloud provider (Groq) hangs, the frontend can catch the error and prompt a retry.
- **Context Pruning**: If the history exceeds the context window, the system prunes middle messages while keeping the `INTRO` and the last 5 turns.
