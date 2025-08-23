
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Save } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface QuickScoringProps {
  stories: any[];
  onScoreUpdate?: () => void;
}

export const QuickScoring: React.FC<QuickScoringProps> = ({ stories, onScoreUpdate }) => {
  const [targetRole, setTargetRole] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>(Array(10).fill(''));
  const [scoredStories, setScoredStories] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const calculateScore = (story: any) => {
    // Combine all text fields for searching
    const combinedText = [
      story.role,
      story.organisation,
      story.situation,
      story.task,
      story.action,
      story.result,
      story.lesson,
      story.tags?.map((t: any) => t.tag).join(' ')
    ].filter(Boolean).join(' ').toLowerCase();

    // Count keyword matches
    let score = 0;
    keywords.forEach(keyword => {
      if (keyword.trim() && combinedText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    // Role boost
    if (targetRole && story.tags?.some((t: any) => t.tag.toLowerCase().includes(targetRole.toLowerCase()))) {
      score += 2;
    }

    return score;
  };

  const computeScores = () => {
    const scored = stories.map(story => ({
      ...story,
      computedScore: calculateScore(story)
    })).sort((a, b) => b.computedScore - a.computedScore);
    
    setScoredStories(scored);
  };

  const saveScores = async () => {
    if (scoredStories.length === 0) return;

    setIsSaving(true);
    try {
      const updates = scoredStories.map(story => ({
        id: story.id,
        score: story.computedScore
      }));

      for (const update of updates) {
        await supabase
          .from('interview_stories')
          .update({ score: update.score })
          .eq('id', update.id);
      }

      toast({
        title: "Scores Saved",
        description: `Updated scores for ${updates.length} stories`,
      });

      onScoreUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scores",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Quick Scoring
          </CardTitle>
          <CardDescription>
            Score your stories based on job keywords and target role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="target-role">Target Role</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CTO">CTO</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {keywords.map((keyword, index) => (
              <div key={index}>
                <Label htmlFor={`keyword-${index}`}>Keyword {index + 1}</Label>
                <Input
                  id={`keyword-${index}`}
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  placeholder="Enter keyword..."
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={computeScores} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Scores
            </Button>
            {scoredStories.length > 0 && (
              <Button 
                onClick={saveScores} 
                disabled={isSaving}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Scores'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {scoredStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scored Stories</CardTitle>
            <CardDescription>
              Stories ranked by relevance score (sorted highest to lowest)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scoredStories.slice(0, 20).map((story, index) => (
                <div key={story.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {story.star_l_id && `${story.star_l_id}: `}
                      {story.role} at {story.organisation}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {story.situation}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Score: {story.computedScore}</span>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
