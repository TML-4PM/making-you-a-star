import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  Target, 
  CheckSquare, 
  Star, 
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Book
} from 'lucide-react';

interface StoryMatch {
  id: string;
  story_id: string;
  match_score: number;
  match_reasons: string[];
  is_recommended: boolean;
  ai_improvements?: string[];
  interview_stories: {
    id: string;
    theme: string;
    organisation: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface JobDescription {
  id: string;
  title: string;
  company?: string;
  description: string;
  extracted_themes: string[];
  extracted_keywords: string[];
}

interface InterviewPrepInsightsProps {
  jobDescription: JobDescription;
  matches: StoryMatch[];
  onViewStory?: (storyId: string) => void;
}

export const InterviewPrepInsights: React.FC<InterviewPrepInsightsProps> = ({
  jobDescription,
  matches,
  onViewStory
}) => {
  const recommendedMatches = matches.filter(m => m.is_recommended);
  const topMatches = matches
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  // Generate interview prep recommendations
  const themes = Array.isArray(jobDescription.extracted_themes) 
    ? jobDescription.extracted_themes 
    : [];

  const getThemeAdvice = (theme: string) => {
    const advice = {
      'Leading Change': 'Focus on transformation stories where you drove significant organizational or process changes.',
      'Handling Conflict or Resistance': 'Prepare stories about difficult conversations, managing pushback, or resolving team conflicts.',
      'Simplifying the Complex': 'Think of times you made complex ideas accessible to different audiences or stakeholders.',
      'Influencing Stakeholders': 'Highlight stories where you gained buy-in without direct authority or convinced resistant stakeholders.',
      'Failing and Recovering': 'Choose failure stories with strong learning outcomes and how you applied those lessons.',
      'Driving Innovation': 'Focus on creative solutions, new approaches, or breakthrough improvements you initiated.',
      'Cross-Functional Collaboration': 'Emphasize working across teams, departments, or with external partners.',
      'Customer Impact': 'Quantify customer benefits, satisfaction improvements, or user experience enhancements.'
    };
    return advice[theme] || `Prepare stories that demonstrate ${theme.toLowerCase()} through specific examples.`;
  };

  return (
    <div className="space-y-6">
      {/* Interview Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Interview Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-800">Top Stories</div>
              <div className="text-sm text-blue-600">
                Lead with your {topMatches.length} strongest matches
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Theme Coverage</div>
              <div className="text-sm text-green-600">
                {themes.length} key themes to address
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-800">Prep Time</div>
              <div className="text-sm text-purple-600">
                ~45 mins recommended
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommended Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Strongest Stories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These stories best align with the job requirements. Practice these first.
          </p>
        </CardHeader>
        <CardContent>
          {recommendedMatches.length === 0 ? (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No recommended story matches yet. Add more interview stories or re-analyze this job description.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedMatches.slice(0, 3).map((match, index) => (
                <div key={match.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          #{index + 1} Priority
                        </Badge>
                        <span className="font-semibold">{match.interview_stories.theme}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(match.match_score * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {match.interview_stories.organisation}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {match.interview_stories.situation}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewStory?.(match.story_id)}
                      className="ml-4"
                    >
                      Practice
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme-Based Preparation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Theme-Based Prep Guide
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Specific advice for each key theme identified in this role.
          </p>
        </CardHeader>
        <CardContent>
          {themes.length === 0 ? (
            <p className="text-muted-foreground">
              No themes extracted yet. Re-analyze the job description to get personalized advice.
            </p>
          ) : (
            <div className="space-y-4">
              {themes.map((theme, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-2">{theme}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getThemeAdvice(theme)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Preparation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            Pre-Interview Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Review and practice your top 3 recommended stories</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Prepare specific examples for each key theme</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Research the company culture and recent news</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Prepare thoughtful questions about the role and team</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Practice your stories out loud with STAR method</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Review any technical requirements or case study prep</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Interview Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-foreground">During the Interview</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use the STAR method for behavioral questions</li>
                <li>• Quantify your impact with specific metrics</li>
                <li>• Connect your stories to their challenges</li>
                <li>• Ask clarifying questions if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Story Selection</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Choose recent examples (within 2-3 years)</li>
                <li>• Vary your examples across different contexts</li>
                <li>• Prepare backup stories for follow-up questions</li>
                <li>• Practice transitions between story components</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};