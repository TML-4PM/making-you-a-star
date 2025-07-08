-- Create interview stories table
CREATE TABLE public.interview_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  organisation TEXT NOT NULL,
  theme TEXT NOT NULL,
  framing TEXT NOT NULL CHECK (framing IN ('Positive', 'Negative')),
  situation TEXT NOT NULL,
  task TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  lesson TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all stories" 
ON public.interview_stories 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own stories" 
ON public.interview_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own stories" 
ON public.interview_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.interview_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user bookmarks table
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable RLS for bookmarks
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create bookmark policies
CREATE POLICY "Users can manage their own bookmarks" 
ON public.user_bookmarks 
FOR ALL 
USING (auth.uid() = user_id);

-- Create user notes table
CREATE TABLE public.user_story_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable RLS for notes
ALTER TABLE public.user_story_notes ENABLE ROW LEVEL SECURITY;

-- Create notes policies
CREATE POLICY "Users can manage their own notes" 
ON public.user_story_notes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create question pools table for managing interview themes/questions
CREATE TABLE public.question_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for question pools
ALTER TABLE public.question_pools ENABLE ROW LEVEL SECURITY;

-- Create question pools policies (public readable, admin manageable)
CREATE POLICY "Anyone can view active question pools" 
ON public.question_pools 
FOR SELECT 
USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_interview_stories_updated_at
  BEFORE UPDATE ON public.interview_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_story_notes_updated_at
  BEFORE UPDATE ON public.user_story_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_pools_updated_at
  BEFORE UPDATE ON public.question_pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();