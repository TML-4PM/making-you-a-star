import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Loader2,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useStorySuggestions } from '@/hooks/useStorySuggestions';
import { useToast } from '@/hooks/use-toast';

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
}

interface BulkApplyEditorProps {
  story: Story;
  onStoryUpdated: () => void;
}

export function BulkApplyEditor({ story, onStoryUpdated }: BulkApplyEditorProps) {
  const { suggestions, loading, applySelectedSuggestions } = useStorySuggestions(story.id);
  const { toast } = useToast();
  
  const [editedStory, setEditedStory] = useState<Story>(story);
  const [appliedSuggestions, setAppliedSuggestions] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const totalExpectedImprovement = pendingSuggestions.reduce((total, s) => total + s.expected_improvement, 0);

  const handleBulkApply = async () => {
    if (pendingSuggestions.length === 0) return;
    
    setApplying(true);
    try {
      // Apply all suggestions to get the improved story content
      const suggestionIds = pendingSuggestions.map(s => s.id);
      const success = await applySelectedSuggestions(suggestionIds);
      
      if (success) {
        // Update the edited story with all suggestions applied
        const improvedStory = { ...story };
        pendingSuggestions.forEach(suggestion => {
          if (suggestion.section in improvedStory) {
            (improvedStory as any)[suggestion.section] = suggestion.suggested_content;
          }
        });
        
        setEditedStory(improvedStory);
        setAppliedSuggestions(true);
        
        toast({
          title: "All Suggestions Applied!",
          description: `${suggestionIds.length} improvements applied. You can now manually edit any section.`,
        });
      }
    } catch (error) {
      console.error('Error applying suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to apply suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const handleSectionChange = (section: keyof Story, value: string) => {
    setEditedStory(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
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
        .eq('id', story.id);

      if (error) throw error;

      toast({
        title: "Story Saved!",
        description: "Your manual edits have been saved successfully.",
      });
      
      onStoryUpdated();
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditedStory(story);
    setAppliedSuggestions(false);
  };

  const hasChanges = JSON.stringify(editedStory) !== JSON.stringify(story);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <CardTitle>Loading Suggestions...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Apply Section */}
      {pendingSuggestions.length > 0 && !appliedSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Bulk Apply Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {pendingSuggestions.length} AI suggestions ready to apply
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Expected improvement: +{totalExpectedImprovement} quality points</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBulkApply}
                disabled={applying}
                size="lg"
                className="flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Apply All Suggestions
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              This will apply all AI suggestions at once, then you can manually edit any section to fine-tune the results.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Manual Story Editor
              {appliedSuggestions && (
                <Badge variant="secondary" className="ml-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Suggestions Applied
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
              
              <Button
                onClick={handleSaveChanges}
                disabled={!hasChanges || saving}
                size="sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Theme and Organisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <Textarea
                value={editedStory.theme}
                onChange={(e) => handleSectionChange('theme', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Organisation</label>
              <Textarea
                value={editedStory.organisation}
                onChange={(e) => handleSectionChange('organisation', e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* STAR+L Sections */}
          {[
            { key: 'situation' as keyof Story, label: 'Situation', icon: '🏢' },
            { key: 'task' as keyof Story, label: 'Task', icon: '🎯' },
            { key: 'action' as keyof Story, label: 'Action', icon: '⚡' },
            { key: 'result' as keyof Story, label: 'Result', icon: '📊' },
            { key: 'lesson' as keyof Story, label: 'Lesson', icon: '💡' }
          ].map(({ key, label, icon }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <span>{icon}</span>
                {label}
                {appliedSuggestions && pendingSuggestions.some(s => s.section === key) && (
                  <Badge variant="outline" className="text-xs">
                    AI Enhanced
                  </Badge>
                )}
              </label>
              <Textarea
                value={editedStory[key]}
                onChange={(e) => handleSectionChange(key, e.target.value)}
                rows={4}
                className="resize-none"
                placeholder={`Enter the ${label.toLowerCase()} of your story...`}
              />
            </div>
          ))}

          <Separator />

          {/* Framing */}
          <div>
            <label className="text-sm font-medium mb-2 block">Framing</label>
            <Textarea
              value={editedStory.framing}
              onChange={(e) => handleSectionChange('framing', e.target.value)}
              rows={3}
              className="resize-none"
              placeholder="How would you frame this story for different contexts?"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}