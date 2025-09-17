# API Documentation

## Overview

The platform uses Supabase as the primary backend service, providing REST APIs, real-time subscriptions, and custom Edge Functions for AI integrations.

## Authentication

All API requests require authentication via Supabase Auth JWT tokens.

```typescript
// Client setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://pflisxkcxbzboxwidywf.supabase.co',
  'your-anon-key'
)

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## Database API

### Stories Management

#### Get User Stories
```typescript
const { data: stories, error } = await supabase
  .from('interview_stories')
  .select(`
    *,
    story_tags (tag_name),
    story_bookmarks (id)
  `)
  .order('created_at', { ascending: false })
```

#### Create Story
```typescript
const { data, error } = await supabase
  .from('interview_stories')
  .insert({
    theme: 'Leadership',
    organisation: 'Tech Corp',
    situation: 'Team conflict situation...',
    task: 'Resolve the conflict...',
    action: 'I facilitated a meeting...',
    result: 'Team productivity improved...',
    lesson: 'Communication is key...',
    framing: 'positive'
  })
```

#### Update Story
```typescript
const { data, error } = await supabase
  .from('interview_stories')
  .update({
    theme: 'Updated theme',
    optimized_version: 'AI-optimized content...'
  })
  .eq('id', storyId)
```

#### Delete Story
```typescript
const { data, error } = await supabase
  .from('interview_stories')
  .delete()
  .eq('id', storyId)
```

### Job Descriptions

#### Get Job Descriptions
```typescript
const { data: jobs, error } = await supabase
  .from('job_descriptions')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Create Job Description
```typescript
const { data, error } = await supabase
  .from('job_descriptions')
  .insert({
    title: 'Senior Developer',
    company: 'Tech Company',
    description: 'Full job description...',
    extracted_themes: ['React', 'TypeScript', 'Leadership']
  })
```

### Practice Sessions

#### Create Practice Session
```typescript
const { data: session, error } = await supabase
  .from('practice_sessions')
  .insert({
    session_type: 'flashcard',
    started_at: new Date().toISOString()
  })
  .select()
  .single()
```

#### Complete Practice Session
```typescript
const { data, error } = await supabase
  .from('practice_sessions')
  .update({
    completed_at: new Date().toISOString(),
    duration_minutes: 15
  })
  .eq('id', sessionId)
```

### Bookmarks

#### Toggle Bookmark
```typescript
// Check if bookmark exists
const { data: existing } = await supabase
  .from('story_bookmarks')
  .select('id')
  .eq('story_id', storyId)
  .single()

if (existing) {
  // Remove bookmark
  await supabase
    .from('story_bookmarks')
    .delete()
    .eq('story_id', storyId)
} else {
  // Add bookmark
  await supabase
    .from('story_bookmarks')
    .insert({ story_id: storyId })
}
```

## Edge Functions

### analyze-story

Analyzes individual stories using OpenAI for optimization suggestions.

**Endpoint**: `https://pflisxkcxbzboxwidywf.supabase.co/functions/v1/analyze-story`

**Method**: POST

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```typescript
{
  storyId: string;
  content: {
    theme: string;
    situation: string;
    task: string;
    action: string;  
    result: string;
    lesson?: string;
  };
}
```

**Response**:
```typescript
{
  analysis: {
    themes: string[];
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    optimizedVersion: string;
    qualityScore: number;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**Example Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('analyze-story', {
  body: {
    storyId: 'uuid-here',
    content: {
      theme: 'Leadership',
      situation: 'Team facing deadline pressure...',
      task: 'Ensure project delivery on time...',
      action: 'Reorganized team structure...',
      result: 'Delivered 2 days early...',
      lesson: 'Clear communication prevents bottlenecks'
    }
  }
})
```

### analyze-job-description

Analyzes job descriptions to extract themes and requirements.

**Endpoint**: `https://pflisxkcxbzboxwidywf.supabase.co/functions/v1/analyze-job-description`

**Method**: POST

**Request Body**:
```typescript
{
  jobDescription: string;
  title: string;
  company: string;
}
```

**Response**:
```typescript
{
  analysis: {
    themes: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    keyResponsibilities: string[];
    companyValues: string[];
    matchingStories?: Array<{
      storyId: string;
      theme: string;
      relevanceScore: number;
      reasoning: string;
    }>;
  };
  insights: {
    difficulty: 'entry' | 'mid' | 'senior' | 'executive';
    industry: string;
    workStyle: string[];
    preparationTips: string[];
  };
}
```

### bulk-analyze-stories

Processes multiple stories in batch for efficient analysis.

**Endpoint**: `https://pflisxkcxbzboxwidywf.supabase.co/functions/v1/bulk-analyze-stories`

**Method**: POST

**Request Body**:
```typescript
{
  stories: Array<{
    id: string;
    theme: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    lesson?: string;
  }>;
  options?: {
    includeOptimization: boolean;
    batchSize: number;
  };
}
```

**Response**:
```typescript
{
  results: Array<{
    storyId: string;
    analysis: StoryAnalysis;
    error?: string;
  }>;
  summary: {
    processed: number;
    succeeded: number;
    failed: number;
    totalTokensUsed: number;
  };
}
```

## Real-time Subscriptions

### Story Updates
```typescript
const channel = supabase
  .channel('stories-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'interview_stories'
    },
    (payload) => {
      console.log('Story changed:', payload)
    }
  )
  .subscribe()
```

### Practice Session Updates
```typescript
const channel = supabase
  .channel('practice-sessions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public', 
      table: 'practice_sessions'
    },
    (payload) => {
      console.log('New practice session:', payload)
    }
  )
  .subscribe()
```

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    message: string;
    code?: string;
    details?: any;
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `PGRLS0001` | Row Level Security violation |
| `23505` | Unique constraint violation |
| `42501` | Insufficient privileges |
| `22001` | String data truncated |

### Error Handling Example
```typescript
const { data, error } = await supabase
  .from('interview_stories')
  .insert(newStory)

if (error) {
  switch (error.code) {
    case '23505':
      console.error('Story already exists')
      break
    case 'PGRLS0001':
      console.error('Access denied')
      break
    default:
      console.error('Unexpected error:', error.message)
  }
}
```

## Rate Limits

### Database API
- **Read operations**: 1000 requests/minute per user
- **Write operations**: 100 requests/minute per user
- **Bulk operations**: 10 requests/minute per user

### Edge Functions
- **analyze-story**: 20 requests/minute per user
- **analyze-job-description**: 10 requests/minute per user
- **bulk-analyze-stories**: 2 requests/minute per user

## Security Considerations

### Row Level Security Policies

Stories are protected by RLS policies:
```sql
-- Users can only access their own stories
CREATE POLICY "Users can manage their own stories" 
ON interview_stories 
FOR ALL 
USING (auth.uid() = user_id);
```

### API Key Management
- OpenAI API keys stored securely in Supabase secrets
- No API keys exposed in client code
- Automatic key rotation supported

### Input Validation
- All inputs sanitized before processing
- SQL injection prevention via parameterized queries
- Content filtering for inappropriate material

## Performance Optimization

### Query Optimization
```typescript
// Use select() to limit returned columns
const { data } = await supabase
  .from('interview_stories')
  .select('id, theme, created_at') // Only needed columns
  .limit(20)

// Use indexes for filtering
const { data } = await supabase
  .from('interview_stories')
  .select('*')
  .eq('theme', 'Leadership') // Indexed column
  .order('created_at', { ascending: false })
```

### Caching Strategy
- Use React Query for client-side caching
- Cache Edge Function responses when appropriate
- Implement cache invalidation on data changes

### Pagination
```typescript
const pageSize = 20
const { data, error } = await supabase
  .from('interview_stories')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('created_at', { ascending: false })
```

## Testing

### API Testing Examples

```typescript
// Test story creation
describe('Story API', () => {
  it('should create a new story', async () => {
    const newStory = {
      theme: 'Test Theme',
      situation: 'Test situation',
      task: 'Test task',
      action: 'Test action',
      result: 'Test result'
    }
    
    const { data, error } = await supabase
      .from('interview_stories')
      .insert(newStory)
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data.theme).toBe('Test Theme')
  })
})
```

## Migration Guide

### Schema Changes
Database migrations are handled through Supabase CLI:

```bash
# Generate migration
supabase db diff --file new_migration

# Apply migration  
supabase db push
```

### API Versioning
Currently using v1 endpoints. Future versions will be backward compatible with deprecation notices.