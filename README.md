# Interview Blitz AI

### AI-Powered B2B Technical Assessment Platform

**Interview Blitz AI** is a state-of-the-art platform designed to revolutionize technical hiring. By leveraging advanced LLM capabilities (Gemini, Groq, or local Ollama), it provides a human-like, interactive interview experience that goes beyond simple code execution.

---

## 🚀 Features

### 🤖 AI Interviewer
- **Interactive DSA Sessions**: Real-time streaming chat that guides candidates through problem-solving phases.
- **Phase Detection**: Intelligent tracking of interview stages (Introduction, Brainstorming, Coding, Optimization).
- **Flexible LLM Support**: Run locally with **Ollama** (offline) or in the cloud with **Groq/Gemini** (high speed).
- **Voice Interaction**: Built-in voice-activity detection and browser-native text-to-speech for a natural conversational flow.

### 📊 Recruiter Dashboard
- **Custom Assessments**: Create tailored interview sets for different roles.
- **Candidate Tracking**: Monitor progress and view detailed performance reports.
- **In-depth Evaluation**: Automated scoring across technical skills, behavioral traits, and problem-solving efficiency.

### 🛠️ Developer & Admin Tools
- **Admin Panel**: Manage the entire platform, users, and problem bank.
- **FastAPI Backend**: High-performance, scalable API with built-in Swagger UI.
- **Next.js Frontend**: Responsive, modern UI with dark mode support.
- **Deployment Ready**: Optimized for Render and Vercel with a single-command blueprint.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Monaco Editor.
- **Backend**: FastAPI (Python), Supabase (Auth & PostgreSQL).
- **AI Models**: 
  - **Local**: Ollama (Mistral/Qwen).
  - **Cloud**: Groq (Llama 3.1/3.3) or Google Gemini.
- **Infrastructure**: Render (Full-stack Deployment), Supabase (Storage/Auth).

---

## 🛠️ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Account
- (Optional) Ollama installed for offline use
- (Optional) Groq API Key for high-speed cloud use

### Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Configure `.env` with your `LLM_PROVIDER` (ollama or cloud).
3. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `.env.local`.
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📖 Documentation

For detailed information, please refer to the following guides:

- 🏗️ **[Architecture Guide](file:///c:/interview-app/docs/ARCHITECTURE.md)**: Deep dive into the system design and AI logic.
- 🛡️ **[Security Guide](file:///c:/interview-app/docs/SECURITY.md)**: Detailed instructions on IP whitelisting and Device Authorization.
- 🔌 **[API Reference](file:///c:/interview-app/docs/API_REFERENCE.md)**: Detailed documentation of all endpoints and Swagger UI.
- 🤝 **[Contributing](file:///c:/interview-app/docs/CONTRIBUTING.md)**: Guidelines for local development and contributions.

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
