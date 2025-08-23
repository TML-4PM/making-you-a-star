
-- 1) Extend interview_stories with Notion-aligned fields
ALTER TABLE public.interview_stories
  ADD COLUMN IF NOT EXISTS star_l_id text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS tier smallint,
  ADD COLUMN IF NOT EXISTS external_docs_url text,
  ADD COLUMN IF NOT EXISTS score integer;

-- 2) Unique index for dedupe/merge by (user_id, star_l_id)
-- Use a COALESCE on user_id so NULL-user imports in dev can still be deduped
CREATE UNIQUE INDEX IF NOT EXISTS interview_stories_user_star_id_uniq
ON public.interview_stories (
  COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  star_l_id
)
WHERE star_l_id IS NOT NULL;

-- 3) Helpful indexes for new filters
CREATE INDEX IF NOT EXISTS interview_stories_role_idx
  ON public.interview_stories (lower(role));

CREATE INDEX IF NOT EXISTS interview_stories_tier_idx
  ON public.interview_stories (tier);

CREATE INDEX IF NOT EXISTS interview_stories_year_idx
  ON public.interview_stories (year);

CREATE INDEX IF NOT EXISTS interview_stories_score_idx
  ON public.interview_stories (score);
