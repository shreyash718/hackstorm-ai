CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  examples JSONB,
  constraints TEXT,
  tags TEXT[]
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  problem_id INT REFERENCES problems(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  phase TEXT NOT NULL,
  chat_history JSONB
);

CREATE TABLE reports (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  overall_score INT,
  problem_solving INT,
  code_quality INT,
  communication INT,
  optimization INT,
  hire_recommendation TEXT,
  strengths TEXT[],
  improvements TEXT[],
  time_complexity TEXT,
  space_complexity TEXT,
  summary TEXT,
  final_code TEXT,
  detailed_metrics JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample problem for testing
INSERT INTO problems (title, difficulty, description, examples, constraints, tags) VALUES (
  'Two Sum',
  'Easy',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}, {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}]',
  '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
  ARRAY['Array', 'Hash Table']
);

CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- RECRUITER & ASSESSMENTS B2B LAYER
-- =========================================================

CREATE TABLE recruiters (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE problems ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES recruiters(user_id) NULL;

CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  recruiter_id UUID REFERENCES recruiters(user_id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  problem_id INT REFERENCES problems(id),
  allowed_languages TEXT[],
  ai_enabled BOOLEAN DEFAULT true,
  time_limit_mins INT DEFAULT 30,
  order_index INT DEFAULT 0
);

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES assessments(id) NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS candidate_name TEXT NULL;
