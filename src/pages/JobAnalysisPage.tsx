import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobDescriptions } from '@/hooks/useJobDescriptions';
import { JobAnalysisResults } from '@/components/JobAnalysisResults';
import { InterviewPrepInsights } from '@/components/InterviewPrepInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  Brain, 
  TrendingUp,
  RefreshCw,
  Clock
} from 'lucide-react';

export const JobAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobDescriptions, getStoryMatches, generateStoryMatches } = useJobDescriptions();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const jobDescription = jobDescriptions.find(jd => jd.id === id);

  useEffect(() => {
    if (id) {
      loadMatches();
    }
  }, [id]);

  const loadMatches = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const matchData = await getStoryMatches(id);
      setMatches(matchData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      await generateStoryMatches(id);
      await loadMatches();
    } catch (error) {
      console.error('Error reanalyzing:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewStory = (storyId: string) => {
    navigate(`/stories/${storyId}`);
  };

  if (!jobDescription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Job Description Not Found</h2>
          <p className="text-muted-foreground mb-6">The job description you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/job-descriptions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Descriptions
          </Button>
        </div>
      </div>
    );
  }

  const themes = Array.isArray(jobDescription.extracted_themes) 
    ? jobDescription.extracted_themes 
    : [];
  
  const keywords = Array.isArray(jobDescription.extracted_keywords) 
    ? jobDescription.extracted_keywords 
    : [];

  const recommendedMatches = matches.filter(m => m.is_recommended);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/job-descriptions')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {jobDescription.title}
              </h1>
              {jobDescription.company && (
                <p className="text-lg text-muted-foreground mt-1">
                  {jobDescription.company}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Created {new Date(jobDescription.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Re-analyze with AI'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{themes.length}</div>
              <div className="text-sm text-muted-foreground">Key Themes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{keywords.length}</div>
              <div className="text-sm text-muted-foreground">Keywords</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{matches.length}</div>
              <div className="text-sm text-muted-foreground">Story Matches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{recommendedMatches.length}</div>
              <div className="text-sm text-muted-foreground">Recommended</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="matches">Story Matches</TabsTrigger>
            <TabsTrigger value="prep">Interview Prep</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{jobDescription.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Themes and Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {themes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {themes.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No themes extracted yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Important Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No keywords extracted yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading story matches...</p>
                </CardContent>
              </Card>
            ) : (
              <JobAnalysisResults 
                matches={matches}
                onViewStory={handleViewStory}
              />
            )}
          </TabsContent>

          <TabsContent value="prep">
            <InterviewPrepInsights
              jobDescription={jobDescription}
              matches={matches}
              onViewStory={handleViewStory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};