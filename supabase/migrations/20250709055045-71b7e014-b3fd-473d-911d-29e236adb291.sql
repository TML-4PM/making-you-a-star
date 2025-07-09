-- Clean up duplicate interview stories
-- This will identify duplicates based on key content fields and keep only the most recent version

-- First, let's create a temporary table to identify duplicates
WITH duplicate_stories AS (
  SELECT 
    id,
    organisation,
    theme,
    situation,
    task,
    action,
    result,
    lesson,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        lower(trim(organisation)),
        lower(trim(theme)),
        lower(trim(situation)),
        lower(trim(task)),
        lower(trim(action)),
        lower(trim(result)),
        lower(trim(lesson))
      ORDER BY created_at DESC
    ) as row_num
  FROM interview_stories
),
stories_to_delete AS (
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
)

-- Delete related data first to maintain referential integrity
DELETE FROM story_tags 
WHERE story_id IN (SELECT id FROM stories_to_delete);

DELETE FROM user_bookmarks 
WHERE story_id IN (SELECT id FROM stories_to_delete);

DELETE FROM user_story_notes 
WHERE story_id IN (SELECT id FROM stories_to_delete);

DELETE FROM jd_story_matches 
WHERE story_id IN (SELECT id FROM stories_to_delete);

DELETE FROM story_group_items 
WHERE story_id IN (SELECT id FROM stories_to_delete);

-- Finally, delete the duplicate stories themselves
WITH duplicate_stories AS (
  SELECT 
    id,
    organisation,
    theme,
    situation,
    task,
    action,
    result,
    lesson,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        lower(trim(organisation)),
        lower(trim(theme)),
        lower(trim(situation)),
        lower(trim(task)),
        lower(trim(action)),
        lower(trim(result)),
        lower(trim(lesson))
      ORDER BY created_at DESC
    ) as row_num
  FROM interview_stories
)
DELETE FROM interview_stories 
WHERE id IN (
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);