-- Add full-text search capabilities to interview_stories
ALTER TABLE public.interview_stories 
ADD COLUMN search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION public.update_story_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.theme, '') || ' ' ||
    coalesce(NEW.organisation, '') || ' ' ||
    coalesce(NEW.situation, '') || ' ' ||
    coalesce(NEW.task, '') || ' ' ||
    coalesce(NEW.action, '') || ' ' ||
    coalesce(NEW.result, '') || ' ' ||
    coalesce(NEW.lesson, '') || ' ' ||
    coalesce(NEW.framing, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_interview_stories_search_vector
  BEFORE INSERT OR UPDATE ON public.interview_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_story_search_vector();

-- Create index for fast full-text search
CREATE INDEX idx_interview_stories_search ON public.interview_stories USING gin(search_vector);

-- Update existing records with search vectors
UPDATE public.interview_stories SET search_vector = to_tsvector('english', 
  coalesce(theme, '') || ' ' ||
  coalesce(organisation, '') || ' ' ||
  coalesce(situation, '') || ' ' ||
  coalesce(task, '') || ' ' ||
  coalesce(action, '') || ' ' ||
  coalesce(result, '') || ' ' ||
  coalesce(lesson, '') || ' ' ||
  coalesce(framing, '')
);

-- Add story tags table for AI-generated tags
CREATE TABLE public.story_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tag_type TEXT NOT NULL DEFAULT 'skill', -- 'skill', 'competency', 'industry', 'level'
  confidence NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_tags
ALTER TABLE public.story_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for story_tags
CREATE POLICY "Users can view tags for their stories" 
ON public.story_tags 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.interview_stories 
  WHERE interview_stories.id = story_tags.story_id 
  AND interview_stories.user_id = auth.uid()
));

CREATE POLICY "System can manage tags" 
ON public.story_tags 
FOR ALL 
USING (true);

-- Add story quality metrics
ALTER TABLE public.interview_stories 
ADD COLUMN quality_score INTEGER DEFAULT 0,
ADD COLUMN completeness_score INTEGER DEFAULT 0,
ADD COLUMN star_rating INTEGER DEFAULT 0,
ADD COLUMN ai_suggestions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN last_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX idx_story_tags_story_id ON public.story_tags(story_id);
CREATE INDEX idx_story_tags_tag ON public.story_tags(tag);
CREATE INDEX idx_interview_stories_quality ON public.interview_stories(quality_score);
CREATE INDEX idx_interview_stories_user_theme ON public.interview_stories(user_id, theme);