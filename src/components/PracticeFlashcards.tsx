import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from '@/components/Flashcard';
import { supabase } from '@/integrations/supabase/client';
import { Play, RotateCcw, CheckCircle, XCircle, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Story {
  id: string;
  theme: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  organisation: string;
}

interface PracticeFlashcardsProps {
  onSessionComplete?: () => void;
}

export function PracticeFlashcards({ onSessionComplete }: PracticeFlashcardsProps) {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [responses, setResponses] = useState<Record<string, { correct: boolean; confidence: number; timeSpent: number }>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [cardStartTime, setCardStartTime] = useState<Date | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('interview_stories')
      .select('*')
      .eq('user_id', user.id)
      .limit(10);

    if (data) {
      setStories(data);
    }
  };

  const startSession = async () => {
    if (!user || stories.length === 0) return;

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        session_type: 'flashcard',
        total_items: stories.length
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error starting session", description: error.message, variant: "destructive" });
      return;
    }

    setSessionId(data.id);
    setSessionStarted(true);
    setStartTime(new Date());
    setCardStartTime(new Date());
    setCurrentIndex(0);
    setResponses({});
    setIsSessionComplete(false);
  };

  const recordResponse = async (correct: boolean, confidence: number) => {
    if (!sessionId || !cardStartTime) return;

    const timeSpent = Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000);
    const currentStory = stories[currentIndex];

    // Record the practice item
    const { error } = await supabase
      .from('practice_items')
      .insert({
        session_id: sessionId,
        story_id: currentStory.id,
        question_text: `Theme: ${currentStory.theme}`,
        is_correct: correct,
        confidence_level: confidence,
        time_spent_seconds: timeSpent
      });

    if (error) {
      console.error('Error recording response:', error);
    }

    // Update local responses
    setResponses(prev => ({
      ...prev,
      [currentStory.id]: { correct, confidence, timeSpent }
    }));

    // Move to next card or complete session
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardStartTime(new Date());
    } else {
      await completeSession();
    }
  };

  const completeSession = async () => {
    if (!sessionId || !startTime) return;

    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 60000); // minutes
    const correctCount = Object.values(responses).filter(r => r.correct).length;

    const { error } = await supabase
      .from('practice_sessions')
      .update({
        completed_at: new Date().toISOString(),
        duration_minutes: duration,
        correct_items: correctCount
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing session:', error);
    }

    setIsSessionComplete(true);
    setSessionStarted(false);
    onSessionComplete?.();
    
    toast({
      title: "Session Complete!",
      description: `You answered ${correctCount}/${stories.length} correctly`,
    });
  };

  const resetSession = () => {
    setSessionStarted(false);
    setSessionId(null);
    setCurrentIndex(0);
    setResponses({});
    setIsSessionComplete(false);
    setStartTime(null);
    setCardStartTime(null);
  };

  if (stories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No Stories Available</h3>
        <p className="text-muted-foreground mb-4">
          You need to create some interview stories before you can practice.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Create Stories
        </Button>
      </Card>
    );
  }

  if (isSessionComplete) {
    const correctCount = Object.values(responses).filter(r => r.correct).length;
    const accuracy = Math.round((correctCount / stories.length) * 100);

    return (
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
          <p className="text-muted-foreground">Great job practicing your interview stories</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={resetSession}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/practice'}>
            View Analytics
          </Button>
        </div>
      </Card>
    );
  }

  if (!sessionStarted) {
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <Target className="h-16 w-16 text-primary" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-2">Ready to Practice?</h3>
          <p className="text-muted-foreground">
            Test your knowledge with {stories.length} flashcards from your interview stories
          </p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {stories.slice(0, 5).map(story => (
            <Badge key={story.id} variant="outline">
              {story.theme}
            </Badge>
          ))}
          {stories.length > 5 && (
            <Badge variant="outline">+{stories.length - 5} more</Badge>
          )}
        </div>

        <Button onClick={startSession} size="lg">
          <Play className="w-4 h-4 mr-2" />
          Start Practice Session
        </Button>
      </Card>
    );
  }

  const currentStory = stories[currentIndex];
  const progress = ((currentIndex) / stories.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentIndex + 1} of {stories.length}
          </span>
          <span className="text-sm text-muted-foreground">
            Theme: {currentStory.theme}
          </span>
        </div>
        <Progress value={progress} />
      </Card>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Flashcard
            front={`Tell me about a time when you demonstrated ${currentStory.theme} at ${currentStory.organisation}`}
            back={`**Situation:** ${currentStory.situation}\n\n**Task:** ${currentStory.task}\n\n**Action:** ${currentStory.action}\n\n**Result:** ${currentStory.result}`}
          />
        </div>
      </div>

      {/* Response Buttons */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 text-center">How confident are you with this story?</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            variant="outline"
            className="h-16"
            onClick={() => recordResponse(false, 2)}
          >
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
            Need More Practice
          </Button>
          <Button
            variant="outline"
            className="h-16"
            onClick={() => recordResponse(true, 4)}
          >
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Confident
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="ghost" onClick={() => recordResponse(false, 1)}>
            Low (1)
          </Button>
          <Button size="sm" variant="ghost" onClick={() => recordResponse(true, 3)}>
            Medium (3)
          </Button>
          <Button size="sm" variant="ghost" onClick={() => recordResponse(true, 5)}>
            High (5)
          </Button>
        </div>
      </Card>
    </div>
  );
}