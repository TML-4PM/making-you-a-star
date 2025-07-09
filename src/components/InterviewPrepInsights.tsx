import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  BookOpen,
  Users,
  Award,
  Lightbulb
} from 'lucide-react';

interface PrepInsights {
  totalStories: number;
  analyzedStories: number;
  averageQuality: number;
  topThemes: Array<{ theme: string; count: number; avgRating: number }>;
  gapAreas: string[];
  recommendations: string[];
  readinessScore: number;
}

export function InterviewPrepInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PrepInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    try {
      // Fetch user's stories
      const { data: stories, error: storiesError } = await supabase
        .from('interview_stories')
        .select('*')
        .eq('user_id', user?.id);

      if (storiesError) throw storiesError;

      // Fetch story tags for gap analysis
      const { data: tags, error: tagsError } = await supabase
        .from('story_tags')
        .select('*, story:interview_stories!inner(user_id)')
        .eq('story.user_id', user?.id);

      if (tagsError) throw tagsError;

      // Calculate insights
      const totalStories = stories?.length || 0;
      const analyzedStories = stories?.filter(s => s.quality_score > 0).length || 0;
      const averageQuality = analyzedStories > 0 
        ? Math.round(stories!.filter(s => s.quality_score > 0).reduce((sum, s) => sum + s.quality_score, 0) / analyzedStories)
        : 0;

      // Theme analysis
      const themeCount: Record<string, { count: number; totalRating: number }> = {};
      stories?.forEach(story => {
        if (!themeCount[story.theme]) {
          themeCount[story.theme] = { count: 0, totalRating: 0 };
        }
        themeCount[story.theme].count++;
        themeCount[story.theme].totalRating += story.star_rating || 0;
      });

      const topThemes = Object.entries(themeCount)
        .map(([theme, data]) => ({
          theme,
          count: data.count,
          avgRating: data.count > 0 ? Math.round(data.totalRating / data.count) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Gap analysis based on common interview themes
      const commonThemes = [
        'Leadership', 'Teamwork', 'Problem Solving', 'Communication', 
        'Conflict Resolution', 'Innovation', 'Adaptability', 'Decision Making',
        'Customer Focus', 'Time Management'
      ];
      
      const userThemes = topThemes.map(t => t.theme.toLowerCase());
      const gapAreas = commonThemes.filter(theme => 
        !userThemes.some(userTheme => 
          userTheme.includes(theme.toLowerCase()) || theme.toLowerCase().includes(userTheme)
        )
      ).slice(0, 3);

      // Generate recommendations
      const recommendations = [];
      if (analyzedStories < totalStories) {
        recommendations.push("Analyze more stories with AI to get better insights");
      }
      if (averageQuality < 70) {
        recommendations.push("Focus on improving story structure using STAR method");
      }
      if (gapAreas.length > 0) {
        recommendations.push(`Add stories about: ${gapAreas.slice(0, 2).join(', ')}`);
      }
      if (totalStories < 5) {
        recommendations.push("Add more stories to have better interview coverage");
      }
      if (recommendations.length === 0) {
        recommendations.push("Great job! Keep practicing and refining your stories");
      }

      // Calculate readiness score
      const storyScore = Math.min((totalStories / 10) * 30, 30);
      const qualityScore = (averageQuality / 100) * 40;
      const coverageScore = Math.min(((10 - gapAreas.length) / 10) * 30, 30);
      const readinessScore = Math.round(storyScore + qualityScore + coverageScore);

      setInsights({
        totalStories,
        analyzedStories,
        averageQuality,
        topThemes,
        gapAreas,
        recommendations,
        readinessScore
      });
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return "Interview Ready";
    if (score >= 60) return "Good Progress";
    if (score >= 40) return "Building Foundation";
    return "Getting Started";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-16 h-8 bg-muted rounded"></div>
                <div className="w-20 h-4 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Unable to generate insights. Please try again.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-primary/10 rounded-full p-3">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Interview Prep Insights</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          AI-powered analysis of your interview readiness
        </p>
      </div>

      {/* Readiness Score */}
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Interview Readiness</h3>
          </div>
          <div className={`text-6xl font-bold ${getReadinessColor(insights.readinessScore)}`}>
            {insights.readinessScore}%
          </div>
          <div className={`text-lg font-medium ${getReadinessColor(insights.readinessScore)}`}>
            {getReadinessLabel(insights.readinessScore)}
          </div>
          <Progress value={insights.readinessScore} className="h-3 max-w-md mx-auto" />
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{insights.totalStories}</div>
          <div className="text-sm text-muted-foreground">Total Stories</div>
        </Card>
        <Card className="p-4 text-center">
          <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{insights.analyzedStories}</div>
          <div className="text-sm text-muted-foreground">AI Analyzed</div>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{insights.averageQuality}%</div>
          <div className="text-sm text-muted-foreground">Avg Quality</div>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{insights.gapAreas.length}</div>
          <div className="text-sm text-muted-foreground">Gap Areas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Themes */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Your Story Themes</h3>
          </div>
          <div className="space-y-3">
            {insights.topThemes.map((theme, index) => (
              <div key={theme.theme} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{theme.theme}</div>
                    <div className="text-sm text-muted-foreground">{theme.count} stories</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < theme.avgRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Gap Areas & Recommendations */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
          </div>
          
          {insights.gapAreas.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Missing Themes:</h4>
              <div className="flex flex-wrap gap-2">
                {insights.gapAreas.map((gap) => (
                  <Badge key={gap} variant="outline" className="text-orange-600 border-orange-600">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Action Items:</h4>
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Next Steps</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Add More Stories</h4>
            <p className="text-sm text-muted-foreground">Build a comprehensive library of examples</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Analyze with AI</h4>
            <p className="text-sm text-muted-foreground">Get detailed feedback and improvements</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Practice & Refine</h4>
            <p className="text-sm text-muted-foreground">Use flashcards and mock interviews</p>
          </div>
        </div>
      </Card>
    </div>
  );
}