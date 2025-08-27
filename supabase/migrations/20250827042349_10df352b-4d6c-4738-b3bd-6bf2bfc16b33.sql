
-- Remove only the stories that are not enriched yet (no STAR-L ID present)
-- This prevents duplicates when we import the 60 enriched records.
DELETE FROM public.interview_stories
WHERE star_l_id IS NULL;
