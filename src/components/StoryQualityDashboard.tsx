import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Star,
  Zap,
  Brain,
  Target,
  Users,
  Building,
  Loader2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StoryMetrics {
  id: string;
  theme: string;
  organisation: string;
  quality_score: number;
  completeness_score: number;
  star_rating: number;
  ai_suggestions: string[];
  last_analyzed_at: string | null;
  tags: Array<{
    tag: string;
    tag_type: string;
    confidence: number;
  }>;
}

interface DashboardStats {
  totalStories: number;
  analyzedStories: number;
  avgQuality: number;
  avgCompleteness: number;
  avgStarRating: number;
  commonSuggestions: Array<{ suggestion: string; count: number }>;
  tagsByType: Record<string, Array<{ tag: string; count: number }>>;
  themeDistribution: Array<{ theme: string; count: number; avgQuality: number }>;
  organizationCoverage: Array<{ org: string; count: number; avgQuality: number }>;
}

export function StoryQualityDashboard() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryMetrics[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ processed: 0, total: 0 });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stories with their tags
      const { data: storiesData, error } = await supabase
        .from('interview_stories')
        .select(`
          id,
          theme,
          organisation,
          quality_score,
          completeness_score,
          star_rating,
          ai_suggestions,
          last_analyzed_at,
          story_tags (
            tag,
            tag_type,
            confidence
          )
        `)
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('quality_score', { ascending: false });

      if (error) throw error;

      const transformedStories = storiesData?.map(story => ({
        ...story,
        ai_suggestions: Array.isArray(story.ai_suggestions) ? story.ai_suggestions.map(String) : [],
        tags: story.story_tags || []
      })) || [];

      setStories(transformedStories);
      calculateStats(transformedStories);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (stories: StoryMetrics[]) => {
    const analyzedStories = stories.filter(s => s.quality_score > 0);
    
    // Calculate averages
    const avgQuality = analyzedStories.length > 0 
      ? analyzedStories.reduce((sum, s) => sum + s.quality_score, 0) / analyzedStories.length 
      : 0;
    
    const avgCompleteness = analyzedStories.length > 0
      ? analyzedStories.reduce((sum, s) => sum + s.completeness_score, 0) / analyzedStories.length
      : 0;
    
    const avgStarRating = analyzedStories.length > 0
      ? analyzedStories.reduce((sum, s) => sum + s.star_rating, 0) / analyzedStories.length
      : 0;

    // Common suggestions
    const suggestionCounts: Record<string, number> = {};
    analyzedStories.forEach(story => {
      if (Array.isArray(story.ai_suggestions)) {
        story.ai_suggestions.forEach(suggestion => {
          suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
        });
      }
    });

    const commonSuggestions = Object.entries(suggestionCounts)
      .map(([suggestion, count]) => ({ suggestion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Tags by type
    const tagsByType: Record<string, Record<string, number>> = {};
    stories.forEach(story => {
      story.tags.forEach(tag => {
        if (!tagsByType[tag.tag_type]) {
          tagsByType[tag.tag_type] = {};
        }
        tagsByType[tag.tag_type][tag.tag] = (tagsByType[tag.tag_type][tag.tag] || 0) + 1;
      });
    });

    const formattedTagsByType: Record<string, Array<{ tag: string; count: number }>> = {};
    Object.entries(tagsByType).forEach(([type, tags]) => {
      formattedTagsByType[type] = Object.entries(tags)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    });

    // Theme distribution
    const themeStats: Record<string, { count: number; totalQuality: number }> = {};
    stories.forEach(story => {
      if (!themeStats[story.theme]) {
        themeStats[story.theme] = { count: 0, totalQuality: 0 };
      }
      themeStats[story.theme].count++;
      themeStats[story.theme].totalQuality += story.quality_score || 0;
    });

    const themeDistribution = Object.entries(themeStats)
      .map(([theme, stats]) => ({
        theme,
        count: stats.count,
        avgQuality: stats.count > 0 ? stats.totalQuality / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Organization coverage
    const orgStats: Record<string, { count: number; totalQuality: number }> = {};
    stories.forEach(story => {
      if (!orgStats[story.organisation]) {
        orgStats[story.organisation] = { count: 0, totalQuality: 0 };
      }
      orgStats[story.organisation].count++;
      orgStats[story.organisation].totalQuality += story.quality_score || 0;
    });

    const organizationCoverage = Object.entries(orgStats)
      .map(([org, stats]) => ({
        org,
        count: stats.count,
        avgQuality: stats.count > 0 ? stats.totalQuality / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count);

    setStats({
      totalStories: stories.length,
      analyzedStories: analyzedStories.length,
      avgQuality,
      avgCompleteness,
      avgStarRating,
      commonSuggestions,
      tagsByType: formattedTagsByType,
      themeDistribution,
      organizationCoverage
    });
  };

  const runBulkAnalysis = async () => {
    if (!user) return;

    setAnalyzing(true);
    setBulkProgress({ processed: 0, total: stats?.totalStories || 0 });

    try {
      const batchSize = 5; // Process 5 stories at a time
      const unanalyzedCount = (stats?.totalStories || 0) - (stats?.analyzedStories || 0);
      
      if (unanalyzedCount === 0) {
        toast({
          title: "All Stories Analyzed",
          description: "All your stories have already been analyzed!",
        });
        return;
      }

      let processed = 0;
      const total = unanalyzedCount;
      setBulkProgress({ processed, total });

      while (processed < total) {
        const { data, error } = await supabase.functions.invoke('bulk-analyze-stories', {
          body: {
            userId: user.id,
            batchSize: Math.min(batchSize, total - processed)
          },
        });

        if (error) throw error;

        processed += data.processed || 0;
        setBulkProgress({ processed, total });

        // Brief pause to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Bulk Analysis Complete!",
        description: `Successfully analyzed ${processed} stories`,
      });

      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Bulk analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to complete bulk analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setBulkProgress({ processed: 0, total: 0 });
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p>Failed to load dashboard data</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Bulk Analysis */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Story Quality Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Analyze your stories and track improvement opportunities
          </p>
        </div>
        <Button 
          onClick={runBulkAnalysis}
          disabled={analyzing}
          size="lg"
          className="flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing... ({bulkProgress.processed}/{bulkProgress.total})
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run Bulk Analysis ({stats.totalStories - stats.analyzedStories} remaining)
            </>
          )}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.analyzedStories} analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getQualityColor(stats.avgQuality)}`}>
              {Math.round(stats.avgQuality)}%
            </div>
            <Progress value={stats.avgQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completeness</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getQualityColor(stats.avgCompleteness)}`}>
              {Math.round(stats.avgCompleteness)}%
            </div>
            <Progress value={stats.avgCompleteness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Ready</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.avgStarRating.toFixed(1)}
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.analyzedStories / stats.totalStories) * 100)}%
            </div>
            <Progress value={(stats.analyzedStories / stats.totalStories) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Distribution & Quality</CardTitle>
              <CardDescription>
                How your stories are distributed across themes and their average quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.themeDistribution.map((theme, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{theme.theme}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{theme.count} stories</Badge>
                          <Badge variant={getQualityBadgeVariant(theme.avgQuality)}>
                            {Math.round(theme.avgQuality)}% avg
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(theme.count / stats.totalStories) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.tagsByType).map(([type, tags]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize">{type}s</CardTitle>
                  <CardDescription>
                    Most frequently identified {type}s in your stories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tags.slice(0, 8).map((tag, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{tag.tag}</span>
                        <Badge variant="secondary">{tag.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Improvement Suggestions</CardTitle>
              <CardDescription>
                Most frequent AI recommendations across your stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.commonSuggestions.slice(0, 10).map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{suggestion.suggestion}</p>
                    </div>
                    <Badge variant="outline">{suggestion.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Coverage</CardTitle>
              <CardDescription>
                Distribution of stories across organizations and their quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.organizationCoverage.map((org, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{org.org}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{org.count} stories</Badge>
                          <Badge variant={getQualityBadgeVariant(org.avgQuality)}>
                            {Math.round(org.avgQuality)}% avg
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(org.count / stats.totalStories) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}