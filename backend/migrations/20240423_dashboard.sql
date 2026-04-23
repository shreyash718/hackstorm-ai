-- Migration: Candidate Dashboard & Readiness
-- Date: 2024-04-23

-- Add user_id and extra scores to reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS debugging INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0;

-- Target Companies Table
CREATE TABLE IF NOT EXISTS target_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    target_level TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Benchmarks Table
CREATE TABLE IF NOT EXISTS company_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    communication_required INTEGER NOT NULL,
    problem_solving_required INTEGER NOT NULL,
    code_quality_required INTEGER NOT NULL,
    optimization_required INTEGER NOT NULL,
    debugging_required INTEGER NOT NULL,
    overall_required INTEGER NOT NULL
);

-- Progress Snapshots Table
CREATE TABLE IF NOT EXISTS candidate_progress_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_company_id UUID,
    readiness_score INTEGER NOT NULL,
    communication_gap INTEGER,
    problem_solving_gap INTEGER,
    code_quality_gap INTEGER,
    optimization_gap INTEGER,
    debugging_gap INTEGER,
    ai_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial benchmarks
INSERT INTO company_benchmarks (company_name, role, level, communication_required, problem_solving_required, code_quality_required, optimization_required, debugging_required, overall_required)
VALUES 
('Google', 'Software Engineer', 'SDE-1', 80, 85, 82, 85, 75, 85),
('Amazon', 'Software Engineer', 'SDE-1', 85, 80, 75, 75, 80, 80),
('Meta', 'Software Engineer', 'SDE-1', 75, 88, 85, 88, 70, 85),
('Microsoft', 'Software Engineer', 'SDE-1', 82, 80, 80, 80, 85, 82),
('Netflix', 'Software Engineer', 'L4', 90, 85, 90, 85, 80, 88)
ON CONFLICT (id) DO NOTHING;
