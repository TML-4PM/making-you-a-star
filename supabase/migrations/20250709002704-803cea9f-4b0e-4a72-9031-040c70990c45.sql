-- Create story groups table
CREATE TABLE public.story_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group-story mappings table
CREATE TABLE public.story_group_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.story_groups(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.interview_stories(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, story_id)
);

-- Enable RLS
ALTER TABLE public.story_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_group_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_groups
CREATE POLICY "Users can manage their own story groups" 
ON public.story_groups 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for story_group_items
CREATE POLICY "Users can manage their own group items" 
ON public.story_group_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.story_groups 
  WHERE story_groups.id = story_group_items.group_id 
  AND story_groups.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_story_groups_updated_at
  BEFORE UPDATE ON public.story_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();