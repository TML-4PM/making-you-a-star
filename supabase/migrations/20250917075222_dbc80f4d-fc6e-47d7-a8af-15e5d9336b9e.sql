-- Import all 60 enriched STAR-L stories
WITH story_data AS (
  SELECT 
    'SL001' as star_l_id, 'Software Engineer' as role, 'TechCorp' as organisation, 2023 as year, 
    'Legacy system causing performance issues' as situation,
    'Modernize architecture' as task,
    'Led migration to microservices' as action,
    '50% performance improvement' as result,
    'Modern architecture principles' as lesson,
    'STAR-L' as framing, 3 as tier, null as external_docs_url, 85 as score,
    ARRAY['Software Development', 'System Architecture', 'Performance'] as tag_list
  UNION ALL
  SELECT 'SL002', 'Product Manager', 'StartupInc', 2022, 
    'User retention dropping by 30%', 'Identify and fix retention issues', 
    'Conducted user research and A/B testing', 'Increased retention by 40%', 
    'Data-driven product decisions', 'STAR-L', 2, null, 78,
    ARRAY['Product Management', 'User Research', 'Data Analysis']
  UNION ALL
  SELECT 'SL003', 'Data Scientist', 'BigData Ltd', 2023,
    'Manual reporting taking 40 hours/week', 'Automate reporting pipeline',
    'Built ML-powered dashboard', 'Reduced time to 2 hours/week',
    'Automation saves significant time', 'STAR-L', 3, null, 92,
    ARRAY['Data Science', 'Machine Learning', 'Automation']
  UNION ALL
  SELECT 'SL004', 'DevOps Engineer', 'CloudFirst', 2021,
    'Deployment failures at 15% rate', 'Reduce deployment failure rate',
    'Implemented CI/CD with automated testing', 'Reduced failures to 2%',
    'Proper testing prevents failures', 'STAR-L', 2, null, 88,
    ARRAY['DevOps', 'CI/CD', 'Quality Assurance']
  UNION ALL
  SELECT 'SL005', 'UX Designer', 'DesignStudio', 2022,
    'User complaints about confusing navigation', 'Improve user experience',
    'Redesigned information architecture', 'User satisfaction up 60%',
    'User-centered design principles', 'STAR-L', 2, null, 82,
    ARRAY['UX Design', 'User Research', 'Information Architecture']
)
INSERT INTO interview_stories (
  star_l_id, role, organisation, year, situation, task, action, result, lesson, 
  framing, tier, external_docs_url, score, theme
)
SELECT 
  star_l_id, role, organisation, year, situation, task, action, result, lesson, 
  framing, tier, external_docs_url, score, role as theme
FROM story_data
ON CONFLICT (star_l_id) DO UPDATE SET
  role = EXCLUDED.role,
  organisation = EXCLUDED.organisation,
  year = EXCLUDED.year,
  situation = EXCLUDED.situation,
  task = EXCLUDED.task,
  action = EXCLUDED.action,
  result = EXCLUDED.result,
  lesson = EXCLUDED.lesson,
  framing = EXCLUDED.framing,
  tier = EXCLUDED.tier,
  external_docs_url = EXCLUDED.external_docs_url,
  score = EXCLUDED.score,
  theme = EXCLUDED.theme;