# Contributing to HackStorm AI

Thank you for your interest in contributing to HackStorm AI! This guide will help you get started with local development and the contribution process.

---

## 🛠️ Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hackstorm-ai.git
cd hackstorm-ai
```

### 2. Backend Configuration
- Navigate to `backend/`.
- Create a virtual environment and install dependencies (see [README.md](file:///c:/interview-app/README.md)).
- Copy `.env.example` to `.env` and fill in the required keys:
  - `DATABASE_URL`: Your Supabase PostgreSQL connection string.
  - `SUPABASE_URL`: Your Supabase project URL.
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin actions.
  - `GOOGLE_API_KEY`: Your Google Gemini API key.

### 3. Frontend Configuration
- Navigate to `frontend/`.
- Install dependencies with `npm install`.
- Create a `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_BACKEND_URL` (usually `http://localhost:8000`)

---

## 🧪 Testing

### Backend
Run the backend with reload enabled to see changes immediately:
```bash
uvicorn main:app --reload
```
You can use the [Swagger UI](http://localhost:8000/docs) to test your changes to the API endpoints.

### Frontend
Run the frontend development server:
```bash
npm run dev
```

---

## 📝 Coding Standards

- **Python**: Follow PEP 8 guidelines. Use type hints for function arguments and return types.
- **Javascript/React**: Use functional components and hooks. Follow the project's existing linting rules (`.eslintrc.json`).
- **CSS**: Use Tailwind CSS for styling. Ensure your designs are responsive and support dark mode.

---

## 🚀 Pull Request Process

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`.
2. Commit your changes with descriptive messages.
3. Push to your branch and open a Pull Request.
4. Ensure your PR description clearly explains the changes and includes relevant screenshots if applicable.
