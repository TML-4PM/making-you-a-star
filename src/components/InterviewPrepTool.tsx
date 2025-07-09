import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Building, 
  FileText, 
  Brain, 
  Target, 
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';

interface JobAnalysis {
  requirements: string[];
  keywords: string[];
  themes: string[];
  skills: string[];
  competencies: string[];
}

interface AnalysisResult {
  jobId: string;
  analysis: JobAnalysis;
  message: string;
}

export function InterviewPrepTool() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!user || !formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-job-description', {
        body: {
          title: formData.title,
          company: formData.company,
          description: formData.description,
          userId: user.id
        }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete!",
        description: "Job description analyzed and stories matched"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze job description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFormData({ title: '', company: '', description: '' });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-primary/10 rounded-full p-3">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Interview Prep Tool</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Analyze job descriptions and get personalized story recommendations
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Briefcase className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Job Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description *</label>
            <Textarea
              placeholder="Paste the full job description here..."
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing || !formData.title || !formData.description}
            className="flex-1"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Job & Match Stories
              </>
            )}
          </Button>
          {result && (
            <Button variant="outline" onClick={handleReset}>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Analysis Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h4 className="font-medium">Key Requirements</h4>
              </div>
              <div className="space-y-2">
                {result.analysis.requirements.slice(0, 5).map((req, index) => (
                  <div key={index} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    • {req}
                  </div>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="font-medium">Key Themes</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.analysis.themes.map((theme, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.analysis.skills.slice(0, 8).map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.analysis.keywords.slice(0, 8).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              ✨ Your stories have been analyzed and matched to this job. 
              Check your <strong>Job Descriptions</strong> page to see recommendations!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}