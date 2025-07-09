import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Lightbulb, Send } from 'lucide-react';

const STORY_THEMES = [
  'Leading Change',
  'Handling Conflict or Resistance', 
  'Simplifying the Complex',
  'Influencing Stakeholders',
  'Failing and Recovering',
  'Driving Innovation',
  'Cross-Functional Collaboration',
  'Customer Impact',
  'Other'
];

export const QuestionSubmission = () => {
  const [questionType, setQuestionType] = useState<'question' | 'prompt'>('question');
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit questions",
        variant: "destructive"
      });
      return;
    }

    if (!questionText.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question or prompt",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_questions')
        .insert({
          user_id: user.id,
          question_text: questionText.trim(),
          question_type: questionType,
          category: category || null
        });

      if (error) throw error;

      toast({
        title: "Question Submitted",
        description: "Your question has been saved successfully"
      });

      // Reset form
      setQuestionText('');
      setCategory('');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxLength = questionType === 'prompt' ? 200 : 1000;

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Ask Your Questions
          </CardTitle>
          <CardDescription>
            Sign in to submit your own interview questions and prompts
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Ask Your Questions
        </CardTitle>
        <CardDescription>
          Submit your own interview questions or practice prompts for future reference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Question Type</Label>
            <RadioGroup 
              value={questionType} 
              onValueChange={(value: 'question' | 'prompt') => setQuestionType(value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="question" id="question" />
                <Label htmlFor="question" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                  Detailed Question
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prompt" id="prompt" />
                <Label htmlFor="prompt" className="flex items-center gap-2 cursor-pointer">
                  <Lightbulb className="w-4 h-4" />
                  Quick Prompt
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText" className="text-sm font-medium">
              {questionType === 'prompt' ? 'Your Prompt' : 'Your Question'}
            </Label>
            {questionType === 'prompt' ? (
              <Input
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g., Tell me about a time you had to influence a difficult stakeholder"
                maxLength={maxLength}
                className="w-full"
              />
            ) : (
              <Textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Describe your interview question in detail. What specific scenario or competency are you looking to explore?"
                maxLength={maxLength}
                rows={4}
                className="w-full resize-none"
              />
            )}
            <div className="text-xs text-muted-foreground text-right">
              {questionText.length}/{maxLength} characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category (Optional)
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {STORY_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !questionText.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};