# HackStorm AI

### AI-Powered B2B Technical Assessment Platform

**HackStorm AI** is a state-of-the-art platform designed to revolutionize technical hiring. By leveraging Google Gemini's advanced LLM capabilities, it provides a human-like, interactive interview experience that goes beyond simple code execution.

---

## 🚀 Features

### 🤖 AI Interviewer
- **Interactive DSA Sessions**: Real-time streaming chat that guides candidates through problem-solving phases.
- **Phase Detection**: Intelligent tracking of interview stages (Introduction, Brainstorming, Coding, Optimization).
- **Voice Interaction**: Built-in voice-activity detection and text-to-speech for a natural conversational flow.

### 📊 Recruiter Dashboard
- **Custom Assessments**: Create tailored interview sets for different roles.
- **Candidate Tracking**: Monitor progress and view detailed performance reports.
- **In-depth Evaluation**: Automated scoring across technical skills, behavioral traits, and problem-solving efficiency.

### 🛠️ Developer & Admin Tools
- **Admin Panel**: Manage the entire platform, users, and problem bank.
- **FastAPI Backend**: High-performance, scalable API with built-in Swagger UI.
- **Next.js Frontend**: Responsive, modern UI with dark mode support.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Monaco Editor.
- **Backend**: FastAPI (Python), Supabase (Auth & PostgreSQL), Google Gemini Pro.
- **Infrastructure**: Vercel (Frontend), Render (Backend), Supabase (Storage/Auth).

---

## 🛠️ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Account & Project
- Google Gemini API Key

### Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Configure `.env` (use `.env.example` as a template).
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
- 🔌 **[API Reference](file:///c:/interview-app/docs/API_REFERENCE.md)**: Detailed documentation of all endpoints and Swagger UI.
- 🤝 **[Contributing](file:///c:/interview-app/docs/CONTRIBUTING.md)**: Guidelines for local development and contributions.

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
