import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, jdId, stories } = await req.json();

    // Analyze JD with AI for better extraction
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing job descriptions for interview preparation. Extract key themes, skills, and requirements that would be relevant for STAR method interview stories.

Focus on identifying:
1. Leadership themes (leading teams, driving change, influencing others)
2. Problem-solving scenarios (complex challenges, innovation, troubleshooting)
3. Collaboration themes (cross-functional work, stakeholder management)
4. Impact themes (customer impact, business results, efficiency improvements)
5. Technical skills and domain expertise
6. Soft skills and behavioral competencies

Return a JSON object with:
- themes: Array of main themes (max 8)
- keywords: Array of important keywords/skills (max 15)
- requirements: Array of key requirements (max 10)
- level: "entry", "mid", "senior", or "executive"
- focusAreas: Array of 3-5 main focus areas for interview prep`
          },
          {
            role: 'user',
            content: `Analyze this job description:\n\n${description}`
          }
        ],
        temperature: 0.3
      }),
    });

    const analysisData = await analysisResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    // Generate story matches with AI scoring
    const matchingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach. Score how well each STAR story matches a job description for interview preparation.

Consider:
- Theme alignment (does the story theme match JD requirements?)
- Skill demonstration (does the story show relevant skills?)
- Level appropriateness (is the story scope right for the role level?)
- Impact relevance (does the result matter for this type of role?)
- Behavioral competencies shown

For each story, return:
- score: 0-100 (whole numbers only)
- reasons: Array of 2-4 specific reasons for the match
- isRecommended: boolean (score >= 60)
- improvements: 1-2 brief suggestions to make the story more relevant

Return a JSON array of match objects.`
          },
          {
            role: 'user',
            content: `Job Description Analysis:
Themes: ${analysis.themes.join(', ')}
Keywords: ${analysis.keywords.join(', ')}
Level: ${analysis.level}
Focus Areas: ${analysis.focusAreas.join(', ')}

Stories to match:
${stories.map((story: any, index: number) => `
Story ${index + 1}:
Theme: ${story.theme}
Organization: ${story.organisation}
Situation: ${story.situation.substring(0, 200)}...
Task: ${story.task.substring(0, 200)}...
Action: ${story.action.substring(0, 200)}...
Result: ${story.result.substring(0, 200)}...
`).join('\n')}`
          }
        ],
        temperature: 0.2
      }),
    });

    const matchingData = await matchingResponse.json();
    const matches = JSON.parse(matchingData.choices[0].message.content);

    // Save matches to database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const matchRecords = matches.map((match: any, index: number) => ({
      jd_id: jdId,
      story_id: stories[index].id,
      match_score: match.score / 100, // Convert to decimal
      match_reasons: match.reasons,
      is_recommended: match.isRecommended,
      ai_improvements: match.improvements
    }));

    // Clear existing matches and insert new ones
    await supabase
      .from('jd_story_matches')
      .delete()
      .eq('jd_id', jdId);

    await supabase
      .from('jd_story_matches')
      .insert(matchRecords);

    return new Response(JSON.stringify({
      analysis,
      matches: matchRecords
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-job-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});