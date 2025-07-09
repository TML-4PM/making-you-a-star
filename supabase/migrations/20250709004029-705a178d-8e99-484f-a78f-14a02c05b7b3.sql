-- Create job descriptions table
CREATE TABLE public.job_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  requirements_json JSONB DEFAULT '[]'::jsonb,
  extracted_keywords JSONB DEFAULT '[]'::jsonb,
  extracted_themes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create JD analysis results table
CREATE TABLE public.jd_story_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jd_id UUID NOT NULL REFERENCES public.job_descriptions(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2) DEFAULT 0.0,
  match_reasons JSONB DEFAULT '[]'::jsonb,
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(jd_id, story_id)
);

-- Enable RLS
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_story_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_descriptions
CREATE POLICY "Users can manage their own job descriptions" 
ON public.job_descriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for jd_story_matches
CREATE POLICY "Users can view their own JD matches" 
ON public.jd_story_matches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.job_descriptions 
  WHERE job_descriptions.id = jd_story_matches.jd_id 
  AND job_descriptions.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own JD matches" 
ON public.jd_story_matches 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.job_descriptions 
  WHERE job_descriptions.id = jd_story_matches.jd_id 
  AND job_descriptions.user_id = auth.uid()
));

-- Create triggers for updated_at
CREATE TRIGGER update_job_descriptions_updated_at
  BEFORE UPDATE ON public.job_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();