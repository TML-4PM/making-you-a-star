import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Brain, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StoryWithMetrics {
  id: string;
  theme: string;
  organisation: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lesson: string;
  quality_score: number;
  completeness_score: number;
  star_rating: number;
  ai_suggestions: string[];
  last_analyzed_at: string | null;
  situation_score: number;
  task_score: number;
  action_score: number;
  result_score: number;
  lesson_score: number;
  values_bonus: number;
  total_star_score: number;
  tags: Array<{
    tag: string;
    tag_type: string;
    confidence: number;
  }>;
}

interface StoryAnalyticsProps {
  story: StoryWithMetrics;
  onUpdate?: () => void;
}

export function StoryAnalytics({ story, onUpdate }: StoryAnalyticsProps) {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [tags, setTags] = useState<Array<{tag: string, tag_type: string, confidence: number}>>([]);

  useEffect(() => {
    fetchTags();
  }, [story.id]);

  const fetchTags = async () => {
    const { data } = await supabase
      .from('story_tags')
      .select('tag, tag_type, confidence')
      .eq('story_id', story.id);

    if (data) {
      setTags(data);
    }
  };

  const analyzeStory = async () => {
    if (!user) return;
    
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-story', {
        body: {
          story: {
            theme: story.theme,
            organisation: story.organisation,
            situation: story.situation,
            task: story.task,
            action: story.action,
            result: story.result,
            lesson: story.lesson,
          },
          storyId: story.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Story Analyzed!",
        description: "AI analysis complete with tags and suggestions",
      });

      fetchTags();
      onUpdate?.();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const tagTypeColors = {
    skill: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    competency: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    industry: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    level: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Story Analysis
        </h3>
        <Button
          onClick={analyzeStory}
          disabled={analyzing}
          variant="outline"
          size="sm"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          {analyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {/* STAR Detailed Scoring */}
      <div className="space-y-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" />
          STAR+L Breakdown ({story.total_star_score}/25 + {story.values_bonus} bonus)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Situation</span>
              <span className={`text-sm font-bold ${getQualityColor(story.situation_score * 20)}`}>
                {story.situation_score}/5
              </span>
            </div>
            <Progress value={story.situation_score * 20} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Task</span>
              <span className={`text-sm font-bold ${getQualityColor(story.task_score * 20)}`}>
                {story.task_score}/5
              </span>
            </div>
            <Progress value={story.task_score * 20} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Action</span>
              <span className={`text-sm font-bold ${getQualityColor(story.action_score * 20)}`}>
                {story.action_score}/5
              </span>
            </div>
            <Progress value={story.action_score * 20} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Result</span>
              <span className={`text-sm font-bold ${getQualityColor(story.result_score * 20)}`}>
                {story.result_score}/5
              </span>
            </div>
            <Progress value={story.result_score * 20} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lesson</span>
              <span className={`text-sm font-bold ${getQualityColor(story.lesson_score * 20)}`}>
                {story.lesson_score}/5
              </span>
            </div>
            <Progress value={story.lesson_score * 20} className="h-2" />
          </div>
        </div>

        {story.values_bonus > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Values Alignment Bonus: +{story.values_bonus} points
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quality Score</span>
            <span className={`text-sm font-bold ${getQualityColor(story.quality_score)}`}>
              {story.quality_score}/100
            </span>
          </div>
          <Progress value={story.quality_score} className="h-2" />
          <span className={`text-xs ${getQualityColor(story.quality_score)}`}>
            {getQualityLabel(story.quality_score)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">STAR Completeness</span>
            <span className={`text-sm font-bold ${getQualityColor(story.completeness_score)}`}>
              {story.completeness_score}/100
            </span>
          </div>
          <Progress value={story.completeness_score} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Interview Ready</span>
            <div className="flex gap-1">
              {renderStars(story.star_rating)}
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {story.star_rating}/5 stars
          </span>
        </div>
      </div>

      <Separator />

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Identified Skills & Competencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`${tagTypeColors[tag.tag_type as keyof typeof tagTypeColors] || 'bg-gray-100 text-gray-800'}`}
              >
                {tag.tag}
                <span className="ml-1 text-xs opacity-75">
                  ({Math.round(tag.confidence * 100)}%)
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {story.ai_suggestions && story.ai_suggestions.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Improvement Suggestions
          </h4>
          <div className="space-y-2">
            {story.ai_suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {story.last_analyzed_at ? (
            <>Analyzed {new Date(story.last_analyzed_at).toLocaleDateString()}</>
          ) : (
            'Never analyzed'
          )}
        </span>
        {story.quality_score > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            AI Enhanced
          </div>
        )}
      </div>
    </Card>
  );
}