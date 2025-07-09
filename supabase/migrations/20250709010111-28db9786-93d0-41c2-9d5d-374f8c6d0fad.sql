
-- Create practice sessions table to track study activities
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'flashcard', 'story_review', 'mock_interview'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  total_items INTEGER DEFAULT 0,
  correct_items INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice items table to track individual question/story performance
CREATE TABLE public.practice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  question_text TEXT,
  user_response TEXT,
  is_correct BOOLEAN,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  time_spent_seconds INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics summary table for quick access to user performance
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_practice_time_minutes INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_confidence NUMERIC DEFAULT 0,
  weak_themes JSONB DEFAULT '[]',
  strong_themes JSONB DEFAULT '[]',
  last_practice_at TIMESTAMP WITH TIME ZONE,
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for practice_sessions
CREATE POLICY "Users can manage their own practice sessions" 
ON public.practice_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for practice_items
CREATE POLICY "Users can manage their own practice items" 
ON public.practice_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.practice_sessions 
  WHERE practice_sessions.id = practice_items.session_id 
  AND practice_sessions.user_id = auth.uid()
));

-- RLS policies for user_analytics
CREATE POLICY "Users can manage their own analytics" 
ON public.user_analytics 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_session_type ON public.practice_sessions(session_type);
CREATE INDEX idx_practice_items_session_id ON public.practice_items(session_id);
CREATE INDEX idx_practice_items_story_id ON public.practice_items(story_id);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);

-- Create trigger to update user_analytics when practice sessions are completed
CREATE OR REPLACE FUNCTION public.update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when a session is completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.user_analytics (user_id, total_practice_time_minutes, total_sessions, last_practice_at)
    VALUES (NEW.user_id, COALESCE(NEW.duration_minutes, 0), 1, NEW.completed_at)
    ON CONFLICT (user_id) DO UPDATE SET
      total_practice_time_minutes = user_analytics.total_practice_time_minutes + COALESCE(NEW.duration_minutes, 0),
      total_sessions = user_analytics.total_sessions + 1,
      last_practice_at = NEW.completed_at,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_user_analytics_trigger
  AFTER UPDATE ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_analytics();

-- Create function to calculate readiness score
CREATE OR REPLACE FUNCTION public.calculate_readiness_score(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_confidence NUMERIC;
  recent_accuracy NUMERIC;
  practice_frequency NUMERIC;
  story_coverage NUMERIC;
  final_score INTEGER;
BEGIN
  -- Calculate average confidence from recent sessions (last 30 days)
  SELECT COALESCE(AVG(confidence_level), 0) INTO avg_confidence
  FROM public.practice_items pi
  JOIN public.practice_sessions ps ON pi.session_id = ps.id
  WHERE ps.user_id = target_user_id 
  AND ps.started_at > now() - interval '30 days';
  
  -- Calculate recent accuracy
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE is_correct = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
    0
  ) INTO recent_accuracy
  FROM public.practice_items pi
  JOIN public.practice_sessions ps ON pi.session_id = ps.id
  WHERE ps.user_id = target_user_id 
  AND ps.started_at > now() - interval '30 days';
  
  -- Calculate practice frequency (sessions per week in last month)
  SELECT COALESCE(COUNT(*) * 7.0 / 30.0, 0) INTO practice_frequency
  FROM public.practice_sessions
  WHERE user_id = target_user_id 
  AND started_at > now() - interval '30 days';
  
  -- Calculate story coverage (percentage of stories practiced)
  SELECT COALESCE(
    (COUNT(DISTINCT pi.story_id)::NUMERIC / NULLIF(
      (SELECT COUNT(*) FROM public.interview_stories WHERE user_id = target_user_id), 
      0
    )) * 100, 
    0
  ) INTO story_coverage
  FROM public.practice_items pi
  JOIN public.practice_sessions ps ON pi.session_id = ps.id
  WHERE ps.user_id = target_user_id;
  
  -- Weighted calculation of final score
  final_score := LEAST(100, GREATEST(0, 
    (avg_confidence * 4) + 
    (recent_accuracy * 0.3) + 
    (LEAST(practice_frequency * 10, 20)) + 
    (story_coverage * 0.3)
  ));
  
  -- Update user analytics with the new score
  INSERT INTO public.user_analytics (user_id, readiness_score)
  VALUES (target_user_id, final_score)
  ON CONFLICT (user_id) DO UPDATE SET
    readiness_score = final_score,
    updated_at = now();
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
