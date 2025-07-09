import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface AnalysisResult {
  storyId: string;
  success: boolean;
  error?: string;
  analysis?: {
    tags: Array<{
      tag: string;
      type: 'skill' | 'competency' | 'industry' | 'level';
      confidence: number;
    }>;
    qualityScore: number;
    completenessScore: number;
    starRating: number;
    suggestions: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, batchSize = 5 } = await req.json();
    
    console.log('Function called with:', { userId, batchSize });

    // Handle health check
    if (batchSize === 0 || userId === 'health-check' || userId === 'test') {
      console.log('Health check request');
      return new Response(JSON.stringify({
        success: true,
        message: 'Function is available',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    if (!userId || userId === 'undefined') {
      throw new Error('Valid user ID is required');
    }

    console.log('Fetching stories for user:', userId);

    // Get unanalyzed stories for this user
    const fetchResponse = await fetch(`${supabaseUrl}/rest/v1/interview_stories?user_id=eq.${userId}&or=(quality_score.is.null,quality_score.eq.0)&limit=${batchSize}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error('Failed to fetch stories:', errorText);
      throw new Error(`Failed to fetch stories: ${errorText}`);
    }

    const stories = await fetchResponse.json();
    console.log('Fetched stories count:', stories?.length || 0);
    const results: AnalysisResult[] = [];

    // Process stories in parallel but with rate limiting
    const analysisPromises = stories.map(async (story: any): Promise<AnalysisResult> => {
      try {
        const analysisPrompt = `
Analyze this interview story and provide structured feedback:

**Story Details:**
Theme: ${story.theme}
Organisation: ${story.organisation}
Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}
Lesson: ${story.lesson}

Please provide analysis in this exact JSON format:
{
  "tags": [
    {"tag": "leadership", "type": "skill", "confidence": 0.9},
    {"tag": "problem-solving", "type": "competency", "confidence": 0.8}
  ],
  "qualityScore": 85,
  "completenessScore": 90,
  "starRating": 4,
  "suggestions": [
    "Add more specific metrics to quantify the result",
    "Include timeline details for better context"
  ]
}

**Scoring Criteria:**
- qualityScore (0-100): Overall story quality, clarity, impact
- completenessScore (0-100): How complete the STAR format is
- starRating (1-5): Interview readiness rating
- tags: Extract 3-8 relevant skills, competencies, industries, or experience levels
- suggestions: 2-4 specific improvement recommendations

Focus on business skills, leadership competencies, and technical abilities.
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert interview coach analyzing STAR format stories. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const analysisText = aiResponse.choices[0]?.message?.content;

        if (!analysisText) {
          throw new Error('No analysis received from OpenAI');
        }

        let analysis;
        try {
          analysis = JSON.parse(analysisText);
        } catch (parseError) {
          console.error('Failed to parse AI response:', analysisText);
          // Fallback analysis
          analysis = {
            tags: [{ tag: story.theme.toLowerCase(), type: 'skill', confidence: 0.8 }],
            qualityScore: 70,
            completenessScore: story.situation && story.task && story.action && story.result ? 85 : 60,
            starRating: 3,
            suggestions: ['Consider adding more specific details and measurable outcomes']
          };
        }

        // Update story with analysis
        const updateStoryResponse = await fetch(`${supabaseUrl}/rest/v1/interview_stories?id=eq.${story.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            quality_score: analysis.qualityScore,
            completeness_score: analysis.completenessScore,
            star_rating: analysis.starRating,
            ai_suggestions: analysis.suggestions,
            last_analyzed_at: new Date().toISOString(),
          }),
        });

        if (!updateStoryResponse.ok) {
          console.error('Failed to update story:', await updateStoryResponse.text());
        }

        // Insert tags
        for (const tag of analysis.tags) {
          await fetch(`${supabaseUrl}/rest/v1/story_tags`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
            body: JSON.stringify({
              story_id: story.id,
              tag: tag.tag,
              tag_type: tag.type,
              confidence: tag.confidence,
            }),
          });
        }

        return {
          storyId: story.id,
          success: true,
          analysis
        };
      } catch (error) {
        console.error(`Error analyzing story ${story.id}:`, error);
        return {
          storyId: story.id,
          success: false,
          error: error.message
        };
      }
    });

    // Wait for all analyses to complete
    const analysisResults = await Promise.all(analysisPromises);
    
    const successCount = analysisResults.filter(r => r.success).length;
    const errorCount = analysisResults.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      success: true,
      processed: analysisResults.length,
      successful: successCount,
      failed: errorCount,
      results: analysisResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk-analyze-stories function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});