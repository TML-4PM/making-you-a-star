-- Create user questions table
CREATE TABLE public.user_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('question', 'prompt')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own questions" 
ON public.user_questions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions" 
ON public.user_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
ON public.user_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
ON public.user_questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_questions_updated_at
BEFORE UPDATE ON public.user_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();