# LLD: Database Schema

This document details the relational database design for HackStorm AI, used for managing problems, assessments, interview sessions, and AI-generated reports.

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    RECRUITERS ||--o{ ASSESSMENTS : manages
    RECRUITERS ||--o{ PROBLEMS : creates
    ASSESSMENTS ||--o{ ASSESSMENT_QUESTIONS : contains
    PROBLEMS ||--o{ ASSESSMENT_QUESTIONS : linked_to
    ASSESSMENTS ||--o{ SESSIONS : tracks
    PROBLEMS ||--o{ SESSIONS : linked_to
    SESSIONS ||--|| REPORTS : generates
    ADMIN_USERS {
        uuid user_id PK
        timestamp created_at
    }
    RECRUITERS {
        uuid user_id PK
        timestamp created_at
    }
    PROBLEMS {
        int id PK
        string title
        string difficulty
        text description
        jsonb examples
        text constraints
        text[] tags
        uuid created_by FK
    }
    ASSESSMENTS {
        uuid id PK
        uuid recruiter_id FK
        string title
        timestamp created_at
    }
    ASSESSMENT_QUESTIONS {
        uuid id PK
        uuid assessment_id FK
        int problem_id FK
        text[] allowed_languages
        boolean ai_enabled
        int time_limit_mins
    }
    SESSIONS {
        uuid id PK
        uuid user_id
        int problem_id FK
        uuid assessment_id FK
        string candidate_name
        timestamp started_at
        timestamp ended_at
        string phase
        jsonb chat_history
    }
    REPORTS {
        uuid id PK
        uuid session_id FK
        int overall_score
        int problem_solving
        int code_quality
        int communication
        int optimization
        string hire_recommendation
        text[] strengths
        text[] improvements
        string time_complexity
        string space_complexity
        text summary
        text final_code
    }
```

## 2. Table Definitions

### 2.1 `problems`
Stores the DSA problem bank.
- **`examples`**: JSONB field containing input/output pairs.
- **`tags`**: Array of categories (e.g., "Hash Table", "Dynamic Programming").

### 2.2 `sessions`
Captures an individual interview attempt.
- **`chat_history`**: JSONB array of message objects `[{role: "user", content: "..."}, ...]`.
- **`phase`**: Tracks the current stage of the interview (INTRO, CODING, etc.).

### 2.3 `reports`
Detailed AI-generated feedback.
- **Scoring**: Integer values from 1-10 across 5 dimensions.
- **`hire_recommendation`**: Enum-like string (e.g., "Strong Hire", "No Hire").

### 2.4 `assessment_questions`
A join table between `assessments` and `problems` allowing recruiters to customize settings per question (like time limits).

## 3. Indexing Strategy

- **B-Tree Indexes**: Created on all Foreign Keys (`problem_id`, `session_id`, `recruiter_id`) to optimize join performance.
- **GIN Indexes**: Recommended for `problems.tags` and `sessions.chat_history` if searching within JSON/Array fields becomes a requirement.
