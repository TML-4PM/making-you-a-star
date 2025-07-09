-- Clean up duplicate interview stories
-- This will identify duplicates based on key content fields and keep only the most recent version

-- Delete related data first - story_tags
DELETE FROM story_tags 
WHERE story_id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);

-- Delete user_bookmarks for duplicates
DELETE FROM user_bookmarks 
WHERE story_id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);

-- Delete user_story_notes for duplicates
DELETE FROM user_story_notes 
WHERE story_id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);

-- Delete jd_story_matches for duplicates
DELETE FROM jd_story_matches 
WHERE story_id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);

-- Delete story_group_items for duplicates
DELETE FROM story_group_items 
WHERE story_id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);

-- Finally, delete the duplicate stories themselves
DELETE FROM interview_stories 
WHERE id IN (
  WITH duplicate_stories AS (
    SELECT 
      id,
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
  SELECT id 
  FROM duplicate_stories 
  WHERE row_num > 1
);