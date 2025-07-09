import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Save, X, Edit3, Loader2, Plus, Undo2 } from 'lucide-react';

interface Story {
  id: string;
  theme: string;
  organisation: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lesson: string;
  framing: string;
  quality_score: number;
  star_rating: number;
  ai_suggestions: string[];
}

interface ParsedSuggestion {
  text: string;
  section: string;
  originalIndex: number;
}

interface UndoAction {
  field: keyof Story;
  previousValue: string;
  suggestionText: string;
}

interface SimpleStoryEditorProps {
  stories: Story[];
  currentStoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onStoryUpdated: () => void;
  onNavigate: (storyId: string) => void;
}

export function SimpleStoryEditor({ 
  stories, 
  currentStoryId, 
  isOpen, 
  onClose, 
  onStoryUpdated,
  onNavigate 
}: SimpleStoryEditorProps) {
  const { toast } = useToast();
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [editedStory, setEditedStory] = useState<Partial<Story>>({});
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [parsedSuggestions, setParsedSuggestions] = useState<ParsedSuggestion[]>([]);

  const currentIndex = stories.findIndex(s => s.id === currentStoryId);

  // Parse AI suggestions to determine which section they apply to
  const parseAISuggestions = (suggestions: string[]): ParsedSuggestion[] => {
    const sectionKeywords = {
      situation: ['situation', 'context', 'background', 'setting', 'circumstances'],
      task: ['task', 'challenge', 'objective', 'goal', 'problem', 'assignment'],
      action: ['action', 'steps', 'approach', 'method', 'strategy', 'implementation'],
      result: ['result', 'outcome', 'achievement', 'impact', 'success', 'conclusion'],
      lesson: ['lesson', 'learning', 'insight', 'takeaway', 'reflection', 'growth'],
      framing: ['framing', 'introduction', 'opening', 'positioning', 'context'],
      theme: ['theme', 'title', 'focus', 'main point'],
      organisation: ['organisation', 'company', 'team', 'department']
    };

    return suggestions.map((suggestion, index) => {
      const lowerSuggestion = suggestion.toLowerCase();
      let bestSection = 'general';
      let maxMatches = 0;

      Object.entries(sectionKeywords).forEach(([section, keywords]) => {
        const matches = keywords.filter(keyword => lowerSuggestion.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestSection = section;
        }
      });

      return {
        text: suggestion,
        section: bestSection,
        originalIndex: index
      };
    });
  };

  useEffect(() => {
    const story = stories.find(s => s.id === currentStoryId);
    if (story) {
      setCurrentStory(story);
      setEditedStory({
        theme: story.theme,
        organisation: story.organisation,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        lesson: story.lesson,
        framing: story.framing
      });
      setHasUnsavedChanges(false);
      setUndoStack([]);
      
      // Parse AI suggestions when story changes
      if (story.ai_suggestions && story.ai_suggestions.length > 0) {
        setParsedSuggestions(parseAISuggestions(story.ai_suggestions));
      } else {
        setParsedSuggestions([]);
      }
    }
  }, [currentStoryId, stories]);

  const handleFieldChange = (field: keyof Story, value: string) => {
    setEditedStory(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const applySuggestion = (suggestion: ParsedSuggestion) => {
    const field = suggestion.section as keyof Story;
    if (!field || !editedStory.hasOwnProperty(field)) return;

    const currentValue = editedStory[field] as string || '';
    const previousValue = currentValue;
    
    let newValue: string;
    if (currentValue.trim() === '') {
      // If section is empty, just insert the suggestion
      newValue = suggestion.text;
    } else {
      // If section has content, append the suggestion intelligently
      const needsSpace = !currentValue.endsWith('.') && !currentValue.endsWith('!') && !currentValue.endsWith('?');
      const separator = needsSpace ? '. ' : ' ';
      newValue = currentValue + separator + suggestion.text;
    }

    // Store undo action
    setUndoStack(prev => [...prev, {
      field,
      previousValue,
      suggestionText: suggestion.text
    }]);

    setEditedStory(prev => ({ ...prev, [field]: newValue }));
    setHasUnsavedChanges(true);

    toast({
      title: "Suggestion Applied",
      description: `Added suggestion to ${field} section`,
    });
  };

  const undoLastAction = () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setEditedStory(prev => ({ ...prev, [lastAction.field]: lastAction.previousValue }));
    setUndoStack(prev => prev.slice(0, -1));
    setHasUnsavedChanges(true);

    toast({
      title: "Action Undone",
      description: `Reverted changes to ${lastAction.field} section`,
    });
  };

  const saveStory = async () => {
    if (!currentStory) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('interview_stories')
        .update({
          theme: editedStory.theme,
          organisation: editedStory.organisation,
          situation: editedStory.situation,
          task: editedStory.task,
          action: editedStory.action,
          result: editedStory.result,
          lesson: editedStory.lesson,
          framing: editedStory.framing,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStory.id);

      if (error) throw error;

      setHasUnsavedChanges(false);
      onStoryUpdated();
      
      toast({
        title: "Story Saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      const previousStory = stories[currentIndex - 1];
      onNavigate(previousStory.id);
    }
  };

  const navigateNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      onNavigate(nextStory.id);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onClose();
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Quick Story Editor
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Story {currentIndex + 1} of {stories.length}
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={navigatePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-center">
              <div className="font-semibold">{currentStory.theme}</div>
              <div className="text-sm text-muted-foreground">{currentStory.organisation}</div>
            </div>
            
            <Button
              onClick={navigateNext}
              disabled={currentIndex === stories.length - 1}
              variant="outline"
              size="sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Story Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Textarea
                  id="theme"
                  value={editedStory.theme || ''}
                  onChange={(e) => handleFieldChange('theme', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="organisation">Organisation</Label>
                <Textarea
                  id="organisation"
                  value={editedStory.organisation || ''}
                  onChange={(e) => handleFieldChange('organisation', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="situation">Situation</Label>
                <Textarea
                  id="situation"
                  value={editedStory.situation || ''}
                  onChange={(e) => handleFieldChange('situation', e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Describe the context and circumstances..."
                />
              </div>

              <div>
                <Label htmlFor="task">Task</Label>
                <Textarea
                  id="task"
                  value={editedStory.task || ''}
                  onChange={(e) => handleFieldChange('task', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="What specific challenge or objective were you given..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="action">Action</Label>
                <Textarea
                  id="action"
                  value={editedStory.action || ''}
                  onChange={(e) => handleFieldChange('action', e.target.value)}
                  className="mt-1"
                  rows={5}
                  placeholder="What specific steps did you take..."
                />
              </div>

              <div>
                <Label htmlFor="result">Result</Label>
                <Textarea
                  id="result"
                  value={editedStory.result || ''}
                  onChange={(e) => handleFieldChange('result', e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="What was the outcome..."
                />
              </div>

              <div>
                <Label htmlFor="lesson">Lesson</Label>
                <Textarea
                  id="lesson"
                  value={editedStory.lesson || ''}
                  onChange={(e) => handleFieldChange('lesson', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="What did you learn from this experience..."
                />
              </div>

              <div>
                <Label htmlFor="framing">Framing</Label>
                <Textarea
                  id="framing"
                  value={editedStory.framing || ''}
                  onChange={(e) => handleFieldChange('framing', e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="How you would introduce this story..."
                />
              </div>
            </div>
          </div>

          {/* AI Suggestions with Apply Buttons */}
          {parsedSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  AI Suggestions - Click to Apply
                  {undoStack.length > 0 && (
                    <Button
                      onClick={undoLastAction}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Undo2 className="w-3 h-3 mr-1" />
                      Undo Last
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Group suggestions by section */}
                  {Object.entries(
                    parsedSuggestions.reduce((acc, suggestion) => {
                      if (!acc[suggestion.section]) acc[suggestion.section] = [];
                      acc[suggestion.section].push(suggestion);
                      return acc;
                    }, {} as Record<string, ParsedSuggestion[]>)
                  ).map(([section, suggestions]) => (
                    <div key={section} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {section === 'general' ? 'General' : section}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {suggestions.map((suggestion, index) => (
                        <div key={suggestion.originalIndex} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <div className="flex-1 text-xs leading-relaxed">
                            {suggestion.text}
                          </div>
                          <Button
                            onClick={() => applySuggestion(suggestion)}
                            size="sm"
                            variant="outline"
                            className="shrink-0 h-6 text-xs px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Actions */}
          <Separator />
          <div className="flex items-center justify-between">
            <Button
              onClick={handleClose}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            
            <Button
              onClick={saveStory}
              disabled={saving || !hasUnsavedChanges}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}