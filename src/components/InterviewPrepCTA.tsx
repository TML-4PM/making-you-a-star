
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Star, TrendingUp } from 'lucide-react';

interface InterviewPrepCTAProps {
  onNavigate?: () => void;
}

export const InterviewPrepCTA: React.FC<InterviewPrepCTAProps> = ({ onNavigate }) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // For embedding on troy-latter.lovable.app
      window.open('/interview-prep', '_blank');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Target className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Practice STAR-L Stories
          <Star className="w-5 h-5 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Master behavioral interviews with AI-powered story analysis and practice tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">60+</div>
            <div className="text-xs text-muted-foreground">Example Stories</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">AI</div>
            <div className="text-xs text-muted-foreground">Story Analysis</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">STAR-L</div>
            <div className="text-xs text-muted-foreground">Framework</div>
          </div>
        </div>
        
        <Button onClick={handleClick} className="w-full" size="lg">
          <TrendingUp className="w-4 h-4 mr-2" />
          Start Interview Prep
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Build your story database • Practice with AI • Ace your interviews
        </p>
      </CardContent>
    </Card>
  );
};
