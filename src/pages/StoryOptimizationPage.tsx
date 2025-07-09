import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SuggestionManager } from '@/components/SuggestionManager';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Target,
  Star,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Zap,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Story {
  id: string;
  theme: string;
  organisation: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lesson: string;
  framing: string;
  quality_score: number;
  completeness_score: number;
  star_rating: number;
  situation_score: number;
  task_score: number;
  action_score: number;
  result_score: number;
  lesson_score: number;
  values_bonus: number;
  total_star_score: number;
  ai_suggestions: string[];
  last_analyzed_at: string | null;
}


export default function StoryOptimizationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [story, setStory] = useState<Story | null>(null);
  
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'suggestions'>('current');

  useEffect(() => {
    loadAllStories();
  }, [user]);

  useEffect(() => {
    if (id && allStories.length > 0) {
      const index = allStories.findIndex(s => s.id === id);
      if (index !== -1) {
        setCurrentIndex(index);
        setStory(allStories[index]);
      }
    }
  }, [id, allStories]);

  const loadAllStories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_stories')
        .select('*')
        .eq('user_id', user.id)
        .order('quality_score', { ascending: true }); // Lowest quality first for review

      if (error) throw error;

      const transformedStories = data?.map(story => ({
        id: story.id,
        theme: story.theme,
        organisation: story.organisation,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        lesson: story.lesson,
        framing: story.framing,
        quality_score: story.quality_score || 0,
        completeness_score: story.completeness_score || 0,
        star_rating: story.star_rating || 0,
        situation_score: story.situation_score || 0,
        task_score: story.task_score || 0,
        action_score: story.action_score || 0,
        result_score: story.result_score || 0,
        lesson_score: story.lesson_score || 0,
        values_bonus: story.values_bonus || 0,
        total_star_score: story.total_star_score || 0,
        ai_suggestions: Array.isArray(story.ai_suggestions) ? story.ai_suggestions.map(String) : [],
        last_analyzed_at: story.last_analyzed_at
      })) || [];

      setAllStories(transformedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!story) return;
    
    setOptimizing(true);
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
          mode: 'suggestions'
        },
      });

      if (error) throw error;

      setActiveTab('suggestions');
      
      toast({
        title: "Suggestions Generated!",
        description: "AI has created improvement recommendations for your story",
      });
    } catch (error) {
      console.error('Suggestion generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };


  const navigateToStory = (index: number) => {
    if (index >= 0 && index < allStories.length) {
      const newStory = allStories[index];
      navigate(`/stories/${newStory.id}/optimize`);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Stories</h2>
          <p className="text-muted-foreground">Preparing optimization workspace...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Story Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested story could not be found.</p>
          <Link to="/stories">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/stories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                Story Optimization
              </h1>
              <p className="text-muted-foreground">
                Story {currentIndex + 1} of {allStories.length} • Reviewing: {story.theme}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigateToStory(currentIndex - 1)}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={() => navigateToStory(currentIndex + 1)}
              disabled={currentIndex === allStories.length - 1}
              variant="outline"
              size="sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Review Progress</CardTitle>
              <Badge variant="secondary">{Math.round(((currentIndex + 1) / allStories.length) * 100)}% Complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={((currentIndex + 1) / allStories.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Current Story Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Story Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getQualityColor(story.quality_score)}`}>
                  {story.quality_score}/100
                </div>
                <div className="text-sm text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {renderStars(story.star_rating)}
                </div>
                <div className="text-sm text-muted-foreground">Interview Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {story.total_star_score}/28
                </div>
                <div className="text-sm text-muted-foreground">STAR+L Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  +{story.values_bonus}
                </div>
                <div className="text-sm text-muted-foreground">Values Bonus</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'current' | 'suggestions')} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">Current Story</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button
                onClick={generateSuggestions}
                disabled={optimizing}
                variant="default"
              >
                {optimizing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {optimizing ? 'Generating...' : 'Generate Suggestions'}
              </Button>
            </div>
          </div>

          <TabsContent value="current" className="space-y-6">
            <StoryDisplay story={story} title="Current Story" />
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <SuggestionManager 
              storyId={story.id} 
              onSuggestionsApplied={() => {
                loadAllStories();
                setActiveTab('current');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component for displaying current story
function StoryDisplay({ story, title }: { story: Story; title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Theme: {story.theme}</span>
          <span>•</span>
          <span>Organisation: {story.organisation}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Situation</h4>
          <p className="text-muted-foreground">{story.situation}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold text-foreground mb-2">Task</h4>
          <p className="text-muted-foreground">{story.task}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold text-foreground mb-2">Action</h4>
          <p className="text-muted-foreground">{story.action}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold text-foreground mb-2">Result</h4>
          <p className="text-muted-foreground">{story.result}</p>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold text-foreground mb-2">Lesson</h4>
          <p className="text-muted-foreground">{story.lesson}</p>
        </div>
      </CardContent>
    </Card>
  );
}
