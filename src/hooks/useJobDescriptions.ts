import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  description: string;
  requirements_json: any;
  extracted_keywords: any;
  extracted_themes: any;
  created_at: string;
  updated_at: string;
}

export interface JDStoryMatch {
  id: string;
  jd_id: string;
  story_id: string;
  match_score: number;
  match_reasons: string[];
  is_recommended: boolean;
  created_at: string;
}

export const useJobDescriptions = () => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadJobDescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobDescriptions(data || []);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load job descriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createJobDescription = async (jdData: {
    title: string;
    company?: string;
    description: string;
  }) => {
    try {
      // Extract basic keywords and themes
      const { keywords, themes, requirements } = await analyzeJobDescription(jdData.description);
      
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert([{
          ...jdData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          extracted_keywords: keywords,
          extracted_themes: themes,
          requirements_json: requirements
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job description created and analyzed successfully"
      });

      await loadJobDescriptions();
    } catch (error) {
      console.error('Error creating job description:', error);
      toast({
        title: "Error",
        description: "Failed to create job description",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJobDescription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_descriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job description deleted successfully"
      });

      await loadJobDescriptions();
    } catch (error) {
      console.error('Error deleting job description:', error);
      toast({
        title: "Error",
        description: "Failed to delete job description",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getStoryMatches = async (jdId: string) => {
    try {
      const { data, error } = await supabase
        .from('jd_story_matches')
        .select(`
          *,
          interview_stories (*)
        `)
        .eq('jd_id', jdId)
        .order('match_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting story matches:', error);
      return [];
    }
  };

  const generateStoryMatches = async (jdId: string) => {
    try {
      // Get the job description
      const { data: jd, error: jdError } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('id', jdId)
        .single();

      if (jdError) throw jdError;

      // Get all user's stories
      const { data: stories, error: storiesError } = await supabase
        .from('interview_stories')
        .select('*');

      if (storiesError) throw storiesError;

      // Calculate matches
      const matches = stories?.map(story => {
        const score = calculateMatchScore(jd, story);
        const reasons = getMatchReasons(jd, story);
        
        return {
          jd_id: jdId,
          story_id: story.id,
          match_score: score,
          match_reasons: reasons,
          is_recommended: score >= 0.6
        };
      }).filter(match => match.match_score > 0.2) || [];

      // Save matches to database
      if (matches.length > 0) {
        const { error } = await supabase
          .from('jd_story_matches')
          .upsert(matches, { 
            onConflict: 'jd_id,story_id',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Generated ${matches.length} story matches`
      });

      return matches;
    } catch (error) {
      console.error('Error generating matches:', error);
      toast({
        title: "Error",
        description: "Failed to generate story matches",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  return {
    jobDescriptions,
    loading,
    createJobDescription,
    deleteJobDescription,
    getStoryMatches,
    generateStoryMatches,
    refreshJobDescriptions: loadJobDescriptions
  };
};

// Helper function to analyze job description text
const analyzeJobDescription = async (description: string) => {
  const text = description.toLowerCase();
  
  // Common interview themes and keywords
  const themeKeywords = {
    'Leading Change': ['lead', 'leadership', 'change', 'transform', 'innovation', 'vision', 'strategy'],
    'Handling Conflict or Resistance': ['conflict', 'resistance', 'difficult', 'challenge', 'persuade', 'negotiate'],
    'Simplifying the Complex': ['complex', 'simplify', 'explain', 'communicate', 'clarity', 'understanding'],
    'Influencing Stakeholders': ['stakeholder', 'influence', 'persuade', 'collaborate', 'partnership'],
    'Failing and Recovering': ['failure', 'mistake', 'learn', 'recover', 'resilience', 'adapt'],
    'Driving Innovation': ['innovation', 'creative', 'new', 'improve', 'optimize', 'efficiency'],
    'Cross-Functional Collaboration': ['collaboration', 'team', 'cross-functional', 'coordinate', 'partnership'],
    'Customer Impact': ['customer', 'user', 'client', 'satisfaction', 'experience', 'impact']
  };

  const extractedThemes: string[] = [];
  const extractedKeywords: string[] = [];
  const requirements: string[] = [];

  // Extract themes
  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const matches = keywords.filter(keyword => text.includes(keyword));
    if (matches.length >= 2) {
      extractedThemes.push(theme);
      extractedKeywords.push(...matches);
    }
  });

  // Extract requirements (simplified)
  const requirementPatterns = [
    /(\d+\+?\s*years?\s*(?:of\s*)?experience)/gi,
    /(bachelor'?s|master'?s|phd|degree)/gi,
    /(required|must\s+have|essential):\s*([^.]+)/gi,
    /(skills?|experience|knowledge)\s*(?:in|with|of)?\s*:?\s*([^.]+)/gi
  ];

  requirementPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      requirements.push(...matches.map(match => match.trim()));
    }
  });

  return {
    keywords: [...new Set(extractedKeywords)],
    themes: extractedThemes,
    requirements: [...new Set(requirements)].slice(0, 10) // Limit to 10
  };
};

// Calculate match score between job description and story
const calculateMatchScore = (jd: JobDescription, story: any): number => {
  let score = 0;
  let maxScore = 0;

  // Theme matching (40% of score)
  if (jd.extracted_themes.includes(story.theme)) {
    score += 0.4;
  }
  maxScore += 0.4;

  // Keyword matching in story content (30% of score)
  const storyText = `${story.situation} ${story.task} ${story.action} ${story.result} ${story.lesson}`.toLowerCase();
  const keywordMatches = jd.extracted_keywords.filter(keyword => 
    storyText.includes(keyword.toLowerCase())
  ).length;
  
  if (jd.extracted_keywords.length > 0) {
    score += (keywordMatches / jd.extracted_keywords.length) * 0.3;
  }
  maxScore += 0.3;

  // Organization matching (10% of score)
  if (jd.company && story.organisation.toLowerCase().includes(jd.company.toLowerCase())) {
    score += 0.1;
  }
  maxScore += 0.1;

  // Framing preference (20% of score) - prefer positive stories
  if (story.framing === 'Positive') {
    score += 0.2;
  }
  maxScore += 0.2;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) / 100 : 0;
};

// Get reasons for the match
const getMatchReasons = (jd: JobDescription, story: any): string[] => {
  const reasons: string[] = [];

  if (jd.extracted_themes.includes(story.theme)) {
    reasons.push(`Theme match: ${story.theme}`);
  }

  const storyText = `${story.situation} ${story.task} ${story.action} ${story.result} ${story.lesson}`.toLowerCase();
  const matchedKeywords = jd.extracted_keywords.filter(keyword => 
    storyText.includes(keyword.toLowerCase())
  );

  if (matchedKeywords.length > 0) {
    reasons.push(`Keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }

  if (jd.company && story.organisation.toLowerCase().includes(jd.company.toLowerCase())) {
    reasons.push('Company match');
  }

  if (story.framing === 'Positive') {
    reasons.push('Positive outcome');
  }

  return reasons;
};