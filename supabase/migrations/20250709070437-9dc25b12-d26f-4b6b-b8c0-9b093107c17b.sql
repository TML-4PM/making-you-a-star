-- Create story_suggestions table to track individual suggestions
CREATE TABLE public.story_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('situation', 'task', 'action', 'result', 'lesson')),
  suggestion_text TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('quantification', 'leadership', 'impact', 'clarity', 'structure')),
  impact_level TEXT NOT NULL DEFAULT 'medium' CHECK (impact_level IN ('high', 'medium', 'low')),
  expected_improvement INTEGER DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'applied', 'dismissed')),
  original_content TEXT,
  suggested_content TEXT,
  confidence NUMERIC DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_suggestion_applications table to track applied changes
CREATE TABLE public.story_suggestion_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES public.story_suggestions(id) ON DELETE CASCADE,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_by UUID REFERENCES auth.users(id),
  previous_content TEXT,
  new_content TEXT,
  quality_impact INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.story_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_suggestion_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for story_suggestions
CREATE POLICY "Users can view suggestions for their stories" 
ON public.story_suggestions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.interview_stories 
  WHERE interview_stories.id = story_suggestions.story_id 
  AND interview_stories.user_id = auth.uid()
));

CREATE POLICY "Users can manage suggestions for their stories" 
ON public.story_suggestions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.interview_stories 
  WHERE interview_stories.id = story_suggestions.story_id 
  AND interview_stories.user_id = auth.uid()
));

-- Create policies for story_suggestion_applications
CREATE POLICY "Users can view applications for their suggestions" 
ON public.story_suggestion_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.story_suggestions ss
  JOIN public.interview_stories story ON ss.story_id = story.id
  WHERE ss.id = story_suggestion_applications.suggestion_id 
  AND story.user_id = auth.uid()
));

CREATE POLICY "Users can manage applications for their suggestions" 
ON public.story_suggestion_applications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.story_suggestions ss
  JOIN public.interview_stories story ON ss.story_id = story.id
  WHERE ss.id = story_suggestion_applications.suggestion_id 
  AND story.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_story_suggestions_story_id ON public.story_suggestions(story_id);
CREATE INDEX idx_story_suggestions_status ON public.story_suggestions(status);
CREATE INDEX idx_story_suggestion_applications_suggestion_id ON public.story_suggestion_applications(suggestion_id);

-- Create trigger for updated_at
CREATE TRIGGER update_story_suggestions_updated_at
  BEFORE UPDATE ON public.story_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();