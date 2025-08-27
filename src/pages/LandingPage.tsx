import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Sparkles, 
  Target, 
  Brain, 
  BookOpen, 
  Briefcase, 
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  Lightbulb
} from 'lucide-react';

const LandingPage = () => {
  const heroImageUrl = "https://lzfgigiyqpuuxslsygjt.supabase.co/storage/v1/object/public/images/Screenshot%202025-07-11%20at%209.07.28%20am.png";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0">
          <img 
            src={heroImageUrl} 
            alt="Make me a STAR hero image" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <Star className="w-16 h-16 text-white animate-pulse" />
              <Sparkles className="w-12 h-12 text-white/80" />
              <Star className="w-14 h-14 text-white/90" />
            </div>
          </div>
          <div className="text-center text-white space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Make me a <span className="bg-white/20 px-6 py-3 rounded-lg">STAR</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Master behavioral interviews with the STAR method. Upload your stories, analyze job descriptions, and get AI-powered insights to land your dream job.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/stories">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View My Stories
                </Button>
              </Link>
              <Link to="/interview-prep">
                <Button size="lg" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Analyze Job Description
                </Button>
              </Link>
              <Link to="/embed-instructions">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Embed Tool
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* STAR Method Explanation */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">What is the STAR Method?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The STAR method is a structured approach to answering behavioral interview questions by describing the Situation, Task, Action, and Result.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Situation</h3>
              <p className="text-muted-foreground">
                Set the scene and provide context for your story. Describe the background and circumstances.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Task</h3>
              <p className="text-muted-foreground">
                Explain the challenge or responsibility you needed to address. What was your role?
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Action</h3>
              <p className="text-muted-foreground">
                Detail the specific steps you took to address the task. Focus on your contributions.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Result</h3>
              <p className="text-muted-foreground">
                Share the outcomes of your actions. Quantify the impact when possible.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features to Ace Your Interviews</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform helps you craft, organize, and perfect your interview stories using the proven STAR method.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Story Management</h3>
              <p className="text-muted-foreground mb-4">
                Upload, organize, and search through your professional stories. Track themes, organizations, and outcomes.
              </p>
              <Link to="/stories">
                <Button variant="outline" className="w-full">
                  View Stories <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Get intelligent insights on story quality, completeness, and suggestions for improvement.
              </p>
              <Link to="/study">
                <Button variant="outline" className="w-full">
                  Study Mode <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Job Description Matching</h3>
              <p className="text-muted-foreground mb-4">
                Analyze job descriptions and get personalized story recommendations that match the requirements.
              </p>
              <Link to="/interview-prep">
                <Button variant="outline" className="w-full">
                  Analyze Jobs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Practice Sessions</h3>
              <p className="text-muted-foreground mb-4">
                Practice telling your stories with timed sessions and track your improvement over time.
              </p>
              <Link to="/practice">
                <Button variant="outline" className="w-full">
                  Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Story Groups</h3>
              <p className="text-muted-foreground mb-4">
                Organize your stories into themed groups for different types of interviews and roles.
              </p>
              <Link to="/groups">
                <Button variant="outline" className="w-full">
                  Manage Groups <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Quality Scoring</h3>
              <p className="text-muted-foreground mb-4">
                Get AI-powered quality scores for your stories and actionable feedback for improvement.
              </p>
              <Link to="/study">
                <Button variant="outline" className="w-full">
                  Improve Stories <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-white space-y-8">
            <h2 className="text-4xl font-bold">Ready to Become a STAR?</h2>
            <p className="text-xl text-white/90">
              Join thousands of professionals who have mastered the STAR method and landed their dream jobs.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/upload">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Upload Your First Story
                </Button>
              </Link>
              <Link to="/interview-prep">
                <Button size="lg" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Analyze a Job Description
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;