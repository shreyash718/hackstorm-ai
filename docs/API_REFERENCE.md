# API Reference

HackStorm AI's backend is powered by a FastAPI server. All endpoints are documented and can be tested interactively.

---

## 🚀 Interactive Documentation

FastAPI provides built-in interactive documentation. Once the backend is running (typically at `http://localhost:8000`), you can access:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
  - Features: Live testing of all endpoints, schema visualization, and easy request building.
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
  - Features: Clean, professional API documentation focused on readability.

---

## 🛠️ Key Endpoints

### Public / Problems
- `GET /problems`: List all available DSA problems.
- `GET /problems/{id}`: Fetch detailed information for a specific problem.

### Interview Flow
- `POST /session/start`: Initialize a new interview session.
- `POST /chat`: Send a candidate message and receive an AI response (supports streaming).
- `POST /evaluate`: Finalize the interview and trigger the report generation.
- `GET /report/{session_id}`: Retrieve the evaluation report for a session.

### Recruiter
- `GET /recruiter/check/{user_id}`: Verify if a user has recruiter privileges.
- `POST /assessment`: Create a new assessment with selected problems.
- `GET /recruiter/assessments/{user_id}`: List assessments created by a recruiter.

### Admin
- `GET /admin/dashboard`: High-level stats and management data (requires Admin privileges).
- `POST /admin/problems`: Add a new problem to the platform.
- `POST /admin/users`: Create new users via Supabase Admin API.
- `DELETE /admin/users/{id}`: Remove a user from the platform.

---

## 🔐 Authentication

Most admin and recruiter endpoints require a `user_id` passed as a query parameter or in the request body for authorization. In production, these should be secured with JWT tokens via Supabase.

---

## 📡 Request & Response Models

All requests and responses use JSON. You can find the exact schemas for each model in the [Swagger UI](http://localhost:8000/docs) under the "Schemas" section at the bottom of the page.
