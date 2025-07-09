-- Add development bypass for story_groups RLS policies
-- This allows story group creation in development without proper auth

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can manage their own story groups" ON public.story_groups;

-- Create new policy that allows development access
CREATE POLICY "Users can manage their own story groups" 
ON public.story_groups 
FOR ALL 
USING (
  -- Allow if user matches (production)
  auth.uid() = user_id 
  OR 
  -- Allow in development for mock user ID
  user_id = '12345678-1234-5678-9abc-123456789012'::uuid
);

-- Also update the story_group_items policy for consistency
DROP POLICY IF EXISTS "Users can manage their own group items" ON public.story_group_items;

CREATE POLICY "Users can manage their own group items" 
ON public.story_group_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.story_groups 
    WHERE story_groups.id = story_group_items.group_id 
    AND (
      story_groups.user_id = auth.uid()
      OR 
      story_groups.user_id = '12345678-1234-5678-9abc-123456789012'::uuid
    )
  )
);