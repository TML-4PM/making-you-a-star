import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Target, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  FileText,
  Users,
  Lightbulb
} from 'lucide-react';

interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements_json: any;
  extracted_keywords: any;
  extracted_themes: any;
  created_at: string;
}

interface StoryMatch {
  id: string;
  match_score: number;
  match_reasons: any;
  is_recommended: boolean;
  story: {
    id: string;
    theme: string;
    organisation: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    lesson: string;
    star_rating?: number;
  };
}

export function JobAnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDescription | null>(null);
  const [matches, setMatches] = useState<StoryMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJobAndMatches();
    }
  }, [id]);

  const fetchJobAndMatches = async () => {
    try {
      // Fetch job description
      const { data: jobData, error: jobError } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch story matches
      const { data: matchData, error: matchError } = await supabase
        .from('jd_story_matches')
        .select(`
          *,
          story:interview_stories(*)
        `)
        .eq('jd_id', id)
        .order('match_score', { ascending: false });

      if (matchError) throw matchError;
      setMatches(matchData || []);
    } catch (error) {
      console.error('Error fetching job analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  const recommendedStories = matches.filter(m => m.is_recommended);
  const averageScore = matches.length > 0 
    ? Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Analysis</h2>
          <p className="text-muted-foreground">Preparing your job match results...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested job analysis could not be found.</p>
          <Link to="/job-descriptions">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Descriptions
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
        <div className="flex items-center gap-4">
          <Link to="/job-descriptions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            {job.company && (
              <p className="text-lg text-muted-foreground">{job.company}</p>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{averageScore}%</div>
            <div className="text-sm text-muted-foreground">Average Match</div>
          </Card>
          <Card className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{recommendedStories.length}</div>
            <div className="text-sm text-muted-foreground">Recommended</div>
          </Card>
          <Card className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{matches.length}</div>
            <div className="text-sm text-muted-foreground">Total Stories</div>
          </Card>
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{job.extracted_themes?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Key Themes</div>
          </Card>
        </div>

        {/* Job Details */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Job Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Key Themes</h3>
              <div className="flex flex-wrap gap-2">
                {job.extracted_themes?.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Important Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {job.extracted_keywords?.slice(0, 8).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Key Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {job.requirements_json?.slice(0, 6).map((req, index) => (
                <div key={index} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                  • {req}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Story Matches */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Story Matches</h2>
          </div>

          {recommendedStories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recommended Stories
              </h3>
              {recommendedStories.map((match) => (
                <Card key={match.id} className="p-6 border-l-4 border-l-yellow-500">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{match.story.theme}</h4>
                        <p className="text-muted-foreground">{match.story.organisation}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(match.match_score)}`}>
                          {match.match_score}%
                        </div>
                        <div className={`text-sm ${getScoreColor(match.match_score)}`}>
                          {getScoreLabel(match.match_score)}
                        </div>
                      </div>
                    </div>

                    <Progress value={match.match_score} className="h-2" />

                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Why This Story Matches
                      </h5>
                      <div className="space-y-1">
                        {match.match_reasons?.map((reason, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Situation:</span>
                        <p className="text-muted-foreground mt-1">{match.story.situation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Result:</span>
                        <p className="text-muted-foreground mt-1">{match.story.result}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {matches.filter(m => !m.is_recommended).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Other Potential Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.filter(m => !m.is_recommended).slice(0, 6).map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{match.story.theme}</h4>
                          <p className="text-sm text-muted-foreground">{match.story.organisation}</p>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(match.match_score)}`}>
                          {match.match_score}%
                        </div>
                      </div>
                      <Progress value={match.match_score} className="h-1" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {match.story.situation}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {matches.length === 0 && (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Stories Found</h3>
              <p className="text-muted-foreground mb-4">
                No interview stories were found to match against this job. Add some stories first!
              </p>
              <Link to="/upload">
                <Button>Add Stories</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}