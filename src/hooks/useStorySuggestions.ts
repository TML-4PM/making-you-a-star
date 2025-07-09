import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorySuggestion {
  id: string;
  story_id: string;
  section: 'situation' | 'task' | 'action' | 'result' | 'lesson';
  suggestion_text: string;
  suggestion_type: 'quantification' | 'leadership' | 'impact' | 'clarity' | 'structure';
  impact_level: 'high' | 'medium' | 'low';
  expected_improvement: number;
  status: 'pending' | 'selected' | 'applied' | 'dismissed';
  original_content: string;
  suggested_content: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export function useStorySuggestions(storyId: string | null) {
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSuggestions = async () => {
    if (!storyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('story_suggestions')
        .select('*')
        .eq('story_id', storyId)
        .order('impact_level', { ascending: false })
        .order('expected_improvement', { ascending: false });

      if (error) throw error;
      setSuggestions((data || []) as StorySuggestion[]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: StorySuggestion['status']) => {
    try {
      const { error } = await supabase
        .from('story_suggestions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(prev => 
        prev.map(s => s.id === suggestionId ? { ...s, status } : s)
      );
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive"
      });
    }
  };

  const applySelectedSuggestions = async (selectedSuggestionIds: string[]) => {
    if (selectedSuggestionIds.length === 0) return;

    try {
      const selectedSuggestions = suggestions.filter(s => 
        selectedSuggestionIds.includes(s.id)
      );

      // Group suggestions by section and apply changes
      const sectionUpdates: Record<string, string> = {};
      
      for (const suggestion of selectedSuggestions) {
        sectionUpdates[suggestion.section] = suggestion.suggested_content;
      }

      // Update the story with new content
      const { error: storyError } = await supabase
        .from('interview_stories')
        .update({
          ...sectionUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId);

      if (storyError) throw storyError;

      // Mark suggestions as applied and create application records
      for (const suggestionId of selectedSuggestionIds) {
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (!suggestion) continue;

        // Update suggestion status
        await supabase
          .from('story_suggestions')
          .update({ status: 'applied' })
          .eq('id', suggestionId);

        // Create application record
        await supabase
          .from('story_suggestion_applications')
          .insert({
            suggestion_id: suggestionId,
            applied_by: (await supabase.auth.getUser()).data.user?.id,
            previous_content: suggestion.original_content,
            new_content: suggestion.suggested_content,
            quality_impact: suggestion.expected_improvement
          });
      }

      // Get updated story data for re-analysis
      const { data: updatedStory, error: fetchError } = await supabase
        .from('interview_stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      // Trigger re-analysis to update quality scores
      await supabase.functions.invoke('analyze-story', {
        body: {
          story: {
            theme: updatedStory.theme,
            organisation: updatedStory.organisation,
            situation: updatedStory.situation,
            task: updatedStory.task,
            action: updatedStory.action,
            result: updatedStory.result,
            lesson: updatedStory.lesson,
          },
          storyId: storyId,
          mode: 'analyze'
        },
      });

      // Update local state
      setSuggestions(prev =>
        prev.map(s =>
          selectedSuggestionIds.includes(s.id)
            ? { ...s, status: 'applied' as const }
            : s
        )
      );

      toast({
        title: "Suggestions Applied",
        description: `${selectedSuggestionIds.length} suggestions applied and story re-analyzed`,
      });

      return true;
    } catch (error) {
      console.error('Error applying suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to apply suggestions",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [storyId]);

  return {
    suggestions,
    loading,
    loadSuggestions,
    updateSuggestionStatus,
    applySelectedSuggestions
  };
}