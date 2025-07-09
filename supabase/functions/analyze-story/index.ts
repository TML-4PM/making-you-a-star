import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface StoryAnalysis {
  tags: Array<{
    tag: string;
    type: 'skill' | 'competency' | 'industry' | 'level';
    confidence: number;
  }>;
  qualityScore: number;
  completenessScore: number;
  starRating: number;
  suggestions: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const { story, storyId, mode = 'analyze' } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (mode === 'suggestions' || mode === 'optimize') {
      // Optimization mode: Generate granular suggestions for each section
      const optimizationPrompt = `
You are an expert interview coach specializing in optimizing STAR format stories. Generate detailed, granular improvement suggestions for each section.

**Current Story:**
Theme: ${story.theme}
Organisation: ${story.organisation}
Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}
Lesson: ${story.lesson}

**Your task:** Generate 2-4 specific, actionable suggestions for each section that can be applied individually.

For each suggestion, provide:
- suggestion_text: Clear description of what to improve
- suggestion_type: One of "quantification", "leadership", "impact", "clarity", "structure"
- impact_level: "high", "medium", or "low" 
- expected_improvement: Points (1-5) this would add to quality score
- original_content: Current text that needs improvement
- suggested_content: Your improved version
- confidence: How confident you are (0.1-1.0)

Focus on:
- Quantifiable metrics and specific numbers
- Leadership behaviors and strategic thinking
- Business impact and stakeholder value
- Clear, compelling storytelling
- Senior-level competencies

Provide response in this exact JSON format:
{
  "suggestions": [
    {
      "section": "situation",
      "suggestion_text": "Add specific metrics about team size and project scope",
      "suggestion_type": "quantification",
      "impact_level": "high",
      "expected_improvement": 3,
      "original_content": "current situation text...",
      "suggested_content": "improved situation text...",
      "confidence": 0.9
    }
  ],
  "overall_quality_increase": 12
}
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
              content: 'You are an expert interview coach specializing in STAR story optimization. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: optimizationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const optimizationText = aiResponse.choices[0]?.message?.content;

      if (!optimizationText) {
        throw new Error('No optimization received from OpenAI');
      }

      try {
        const optimization = JSON.parse(optimizationText);
        
        // Store suggestions in database
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (supabaseUrl && supabaseKey) {
          // Clear existing pending suggestions for this story
          await fetch(`${supabaseUrl}/rest/v1/story_suggestions?story_id=eq.${storyId}&status=eq.pending`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
          });

          // Insert new suggestions
          for (const suggestion of optimization.suggestions || []) {
            await fetch(`${supabaseUrl}/rest/v1/story_suggestions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
              },
              body: JSON.stringify({
                story_id: storyId,
                section: suggestion.section,
                suggestion_text: suggestion.suggestion_text,
                suggestion_type: suggestion.suggestion_type,
                impact_level: suggestion.impact_level,
                expected_improvement: suggestion.expected_improvement,
                original_content: suggestion.original_content,
                suggested_content: suggestion.suggested_content,
                confidence: suggestion.confidence,
                status: 'pending'
              }),
            });
          }
        }
        
        return new Response(JSON.stringify(optimization), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse optimization response:', optimizationText);
        throw new Error('Invalid optimization response format');
      }
    }

    // Standard analysis mode: Analyze story with OpenAI using Enhanced STAR+L+V Model
    const analysisPrompt = `
Analyze this interview story using the Extended STAR + L + V Model with 5-point scoring per element:

**Story Details:**
Theme: ${story.theme}
Organisation: ${story.organisation}
Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}
Lesson: ${story.lesson}

**Scoring Criteria (5 points each):**
- **Situation (0-5)**: Relevant context, senior stakes, clear setup, complexity level
- **Task (0-5)**: Defined role/responsibility, clarity of challenge, ownership demonstration
- **Action (0-5)**: Leadership, ownership, cross-functional delivery, strategic thinking
- **Result (0-5)**: Quantified/strategic outcome, business value, measurable impact
- **Lesson (0-5)**: Self-awareness, evolution, scalable reflection, growth mindset

**Values Alignment Bonus (0-3):**
- Trust: Transparency, credibility, governance
- Customer Success: Prioritizing customer outcomes
- Innovation: Challenging status quo, bold thinking
- Equality: Inclusive leadership, diverse perspectives
- Sustainability/Ethics: Responsible innovation
- Ohana: Supporting, mentoring, uplifting others

Please provide analysis in this exact JSON format:
{
  "situationScore": 4,
  "taskScore": 3,
  "actionScore": 5,
  "resultScore": 4,
  "lessonScore": 3,
  "valuesBonus": 2,
  "totalStarScore": 21,
  "qualityScore": 85,
  "completenessScore": 90,
  "starRating": 4,
  "tags": [
    {"tag": "leadership", "type": "skill", "confidence": 0.9},
    {"tag": "problem-solving", "type": "competency", "confidence": 0.8}
  ],
  "suggestions": [
    "Add more specific metrics to quantify the result",
    "Include timeline details for better context"
  ],
  "starBreakdown": {
    "situation": "Strong context but could include more senior-level stakes",
    "task": "Clear responsibility but challenge complexity could be better defined",
    "action": "Excellent leadership and cross-functional delivery demonstrated",
    "result": "Good quantified outcome, business value is clear",
    "lesson": "Shows self-awareness but could be more scalable"
  }
}

Focus on senior-level competencies, leadership skills, and business impact.
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

    // Parse the JSON response
    let analysis: StoryAnalysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback analysis if parsing fails
      analysis = {
        situationScore: 3,
        taskScore: 3,
        actionScore: 3,
        resultScore: 2,
        lessonScore: 2,
        valuesBonus: 1,
        totalStarScore: 14,
        tags: [
          { tag: story.theme.toLowerCase(), type: 'skill', confidence: 0.8 }
        ],
        qualityScore: 70,
        completenessScore: story.situation && story.task && story.action && story.result ? 85 : 60,
        starRating: 3,
        suggestions: ['Consider adding more specific details and measurable outcomes'],
        starBreakdown: {
          situation: 'Basic context provided',
          task: 'Role defined but could be clearer',
          action: 'Actions described but need more leadership focus',
          result: 'Results mentioned but need quantification',
          lesson: 'Limited reflection on growth and learning'
        }
      };
    }

    // Store analysis in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // Update story with analysis
    const updateStoryResponse = await fetch(`${supabaseUrl}/rest/v1/interview_stories?id=eq.${storyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        situation_score: analysis.situationScore || 0,
        task_score: analysis.taskScore || 0,
        action_score: analysis.actionScore || 0,
        result_score: analysis.resultScore || 0,
        lesson_score: analysis.lessonScore || 0,
        values_bonus: analysis.valuesBonus || 0,
        total_star_score: analysis.totalStarScore || 0,
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
      const insertTagResponse = await fetch(`${supabaseUrl}/rest/v1/story_tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          story_id: storyId,
          tag: tag.tag,
          tag_type: tag.type,
          confidence: tag.confidence,
        }),
      });

      if (!insertTagResponse.ok) {
        console.error('Failed to insert tag:', await insertTagResponse.text());
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});