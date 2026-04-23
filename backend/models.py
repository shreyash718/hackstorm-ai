from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    problem_id: int
    code: str
    chat_history: List[ChatMessage]
    candidate_message: str
    user_id: Optional[str] = None
    stream: Optional[bool] = False
    phase: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    phase: str
    is_complete: bool

class EvaluateRequest(BaseModel):
    problem_id: int
    code: str
    chat_history: List[ChatMessage]
    user_id: Optional[str] = None
    assessment_id: Optional[str] = None
    candidate_name: Optional[str] = None

class ReportResponse(BaseModel):
    overall_score: int
    problem_solving: int
    code_quality: int
    communication: int
    optimization: int
    hire_recommendation: str
    strengths: List[str]
    improvements: List[str]
    time_complexity: str
    space_complexity: str
    summary: str

class Problem(BaseModel):
    id: int
    title: str
    difficulty: str
    description: str
    examples: List[Dict[str, str]]
    constraints: str
    tags: List[str]

class CreateProblemRequest(BaseModel):
    title: str
    difficulty: str
    description: str
    examples: List[Dict[str, str]]
    constraints: str
    tags: List[str]
    user_id: str

class Session(BaseModel):
    id: str
    user_id: Optional[str] = None
    problem_id: int
    started_at: str
    ended_at: Optional[str] = None
    phase: str
    chat_history: List[Dict[str, Any]]
    assessment_id: Optional[str] = None
    candidate_name: Optional[str] = None

class MakeRecruiterRequest(BaseModel):
    user_id: str

class AssessmentQuestionRequest(BaseModel):
    title: str
    difficulty: str
    description: str
    examples: List[Dict[str, str]]
    constraints: str
    tags: List[str]
    allowed_languages: List[str]
    ai_enabled: bool
    time_limit_mins: int
    order_index: int

class CreateAssessmentRequest(BaseModel):
    title: str
    questions: List[AssessmentQuestionRequest]

class TargetCompanyRequest(BaseModel):
    user_id: str
    company_name: str
    role: str
    target_level: str

class TargetCompanyResponse(BaseModel):
    id: str
    company_name: str
    role: str
    target_level: str
    is_active: bool

class ProgressSnapshotModel(BaseModel):
    date: str
    readiness_score: int

class ProgressResponse(BaseModel):
    target_company: Optional[str] = None
    target_level: Optional[str] = None
    current_readiness: int = 0
    history: List[ProgressSnapshotModel] = []
    skill_gaps: Dict[str, int] = {}
    ai_analysis: Optional[str] = None
    candidate_scores: Dict[str, int] = {}
    benchmark_scores: Dict[str, int] = {}
