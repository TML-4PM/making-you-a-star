import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  ChevronRight 
} from 'lucide-react';

interface StoryMatch {
  id: string;
  story_id: string;
  match_score: number;
  match_reasons: string[];
  is_recommended: boolean;
  ai_improvements?: string[];
  interview_stories: {
    id: string;
    theme: string;
    organisation: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface JobAnalysisResultsProps {
  matches: StoryMatch[];
  onViewStory?: (storyId: string) => void;
}

export const JobAnalysisResults: React.FC<JobAnalysisResultsProps> = ({
  matches,
  onViewStory
}) => {
  const recommendedMatches = matches.filter(m => m.is_recommended);
  const averageScore = matches.length > 0 
    ? Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.7) return CheckCircle;
    if (score >= 0.5) return AlertCircle;
    return AlertCircle;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {matches.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Stories Analyzed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendedMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Recommended
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {averageScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Match Score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Matches */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Story Matches</h3>
          <Badge variant="secondary">
            {matches.length} total
          </Badge>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No story matches found. Add some interview stories to get personalized recommendations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {matches
              .sort((a, b) => b.match_score - a.match_score)
              .map((match) => {
                const ScoreIcon = getScoreIcon(match.match_score);
                const scorePercentage = Math.round(match.match_score * 100);
                
                return (
                  <Card 
                    key={match.id} 
                    className={`transition-all hover:shadow-medium ${
                      match.is_recommended ? 'ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ScoreIcon className={`w-5 h-5 ${getScoreColor(match.match_score)}`} />
                            <h4 className="font-semibold">
                              {match.interview_stories.theme}
                            </h4>
                            {match.is_recommended && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {match.interview_stories.organisation}
                          </p>
                          <p className="text-sm line-clamp-2">
                            {match.interview_stories.situation}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-bold ${getScoreColor(match.match_score)}`}>
                            {scorePercentage}%
                          </div>
                          <div className="w-20">
                            <Progress 
                              value={scorePercentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      {match.match_reasons.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">Why it matches:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.match_reasons.map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Improvements */}
                      {match.ai_improvements && match.ai_improvements.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              AI Suggestions:
                            </span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {match.ai_improvements.map((improvement, index) => (
                              <li key={index}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Match Score: {scorePercentage}%
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewStory?.(match.story_id)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          View Story
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};