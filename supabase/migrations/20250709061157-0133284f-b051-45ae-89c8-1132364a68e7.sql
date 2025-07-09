-- Add detailed STAR scoring columns to interview_stories table
ALTER TABLE public.interview_stories 
ADD COLUMN situation_score integer DEFAULT 0 CHECK (situation_score >= 0 AND situation_score <= 5),
ADD COLUMN task_score integer DEFAULT 0 CHECK (task_score >= 0 AND task_score <= 5),
ADD COLUMN action_score integer DEFAULT 0 CHECK (action_score >= 0 AND action_score <= 5),
ADD COLUMN result_score integer DEFAULT 0 CHECK (result_score >= 0 AND result_score <= 5),
ADD COLUMN lesson_score integer DEFAULT 0 CHECK (lesson_score >= 0 AND lesson_score <= 5),
ADD COLUMN values_bonus integer DEFAULT 0 CHECK (values_bonus >= 0 AND values_bonus <= 3),
ADD COLUMN total_star_score integer DEFAULT 0 CHECK (total_star_score >= 0 AND total_star_score <= 28);