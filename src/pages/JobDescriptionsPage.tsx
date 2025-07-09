import React, { useState } from 'react';
import { useJobDescriptions } from '@/hooks/useJobDescriptions';
import { JobDescriptionDialog } from '@/components/JobDescriptionDialog';
import { JobDescriptionCard } from '@/components/JobDescriptionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, ArrowLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const JobDescriptionsPage = () => {
  const navigate = useNavigate();
  const { jobDescriptions, loading, createJobDescription, deleteJobDescription } = useJobDescriptions();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJDs = jobDescriptions.filter(jd =>
    jd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyzeJD = (jd: any) => {
    navigate(`/job-descriptions/${jd.id}`, { state: { jobDescription: jd } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Job Descriptions</h2>
          <p className="text-muted-foreground">Fetching your job descriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Job Descriptions
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze job descriptions and match them with your stories
              </p>
            </div>
          </div>
          
          <JobDescriptionDialog onSave={createJobDescription} />
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl shadow-medium border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search job descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredJDs.length} of {jobDescriptions.length} job descriptions
            </div>
          </div>
        </div>

        {/* Job Descriptions Grid */}
        {filteredJDs.length === 0 ? (
          <div className="text-center py-16">
            {jobDescriptions.length === 0 ? (
              <div className="space-y-4">
                <FileText className="w-20 h-20 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Job Descriptions Yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add your first job description to get started with automatic story matching 
                    and personalized interview preparation.
                  </p>
                  <JobDescriptionDialog 
                    onSave={createJobDescription}
                    trigger={
                      <Button size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Job Description
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Search className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Job Descriptions Found
                  </h3>
                  <p className="text-muted-foreground">
                    No job descriptions match your search criteria. Try a different search term.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJDs.map((jd) => (
              <JobDescriptionCard
                key={jd.id}
                jobDescription={jd}
                onDelete={deleteJobDescription}
                onAnalyze={handleAnalyzeJD}
                matchCount={0} // TODO: Add actual match count
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {jobDescriptions.length > 0 && (
          <div className="bg-card rounded-xl shadow-medium border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {jobDescriptions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Job Descriptions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {jobDescriptions.reduce((sum, jd) => sum + (jd.extracted_themes?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Themes Identified
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {jobDescriptions.filter(jd => (jd.extracted_themes?.length || 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Analyzed Jobs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Info */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border">
          <div className="flex items-start gap-4">
            <Target className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Smart Analysis & Matching
              </h3>
              <p className="text-muted-foreground mb-4">
                Our system automatically analyzes job descriptions to extract key themes, 
                requirements, and skills, then matches them with your existing interview stories.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Extract themes like "Leadership", "Customer Impact", "Innovation"</li>
                <li>• Identify key skills and requirements</li>
                <li>• Match stories based on relevance and themes</li>
                <li>• Generate study recommendations for each role</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};