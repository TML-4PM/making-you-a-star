import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewPrepTool } from '@/components/InterviewPrepTool';
import { InterviewPrepInsights } from '@/components/InterviewPrepInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Building, 
  ExternalLink,
  FileText,
  BarChart3
} from 'lucide-react';

interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  extracted_themes: any;
  created_at: string;
}

const JobDescriptionsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Interview Preparation Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Analyze job descriptions, match stories, and get AI-powered insights
          </p>
        </div>

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Analyze Job
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job History
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Prep Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <InterviewPrepTool />
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Analyzed Jobs</h2>
                <p className="text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? 's' : ''} analyzed</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="w-3/4 h-6 bg-muted rounded"></div>
                        <div className="w-1/2 h-4 bg-muted rounded"></div>
                        <div className="w-full h-3 bg-muted rounded"></div>
                        <div className="flex gap-2">
                          <div className="w-16 h-6 bg-muted rounded-full"></div>
                          <div className="w-20 h-6 bg-muted rounded-full"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                            {job.title}
                          </h3>
                          {job.company && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span className="text-sm">{job.company}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        {job.extracted_themes && job.extracted_themes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.extracted_themes.slice(0, 3).map((theme, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                            {job.extracted_themes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.extracted_themes.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          <Link to={`/job-descriptions/${job.id}`}>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Analysis
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Analyzed Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by analyzing a job description to get personalized story recommendations.
                  </p>
                  <Button onClick={() => setLoading(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Analyze Your First Job
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <InterviewPrepInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobDescriptionsPage;