import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  CheckCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  Target,
  TrendingUp,
  Filter,
  Check,
  X
} from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useStorySuggestions, StorySuggestion } from '@/hooks/useStorySuggestions';

interface SuggestionManagerProps {
  storyId: string;
  onSuggestionsApplied: () => void;
}

export function SuggestionManager({ storyId, onSuggestionsApplied }: SuggestionManagerProps) {
  const { suggestions, loading, updateSuggestionStatus, applySelectedSuggestions } = useStorySuggestions(storyId);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [previewSuggestions, setPreviewSuggestions] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const appliedSuggestions = suggestions.filter(s => s.status === 'applied');
  const filteredSuggestions = pendingSuggestions.filter(s => 
    filter === 'all' || s.impact_level === filter
  );

  const totalExpectedImprovement = Array.from(selectedSuggestions)
    .reduce((total, id) => {
      const suggestion = suggestions.find(s => s.id === id);
      return total + (suggestion?.expected_improvement || 0);
    }, 0);

  const handleToggleSuggestion = (suggestionId: string, selected: boolean) => {
    const newSelected = new Set(selectedSuggestions);
    if (selected) {
      newSelected.add(suggestionId);
    } else {
      newSelected.delete(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleSelectAll = () => {
    const allPendingIds = new Set(pendingSuggestions.map(s => s.id));
    setSelectedSuggestions(allPendingIds);
  };

  const handleDeselectAll = () => {
    setSelectedSuggestions(new Set());
  };

  const handleTogglePreview = (suggestionId: string) => {
    const newPreview = new Set(previewSuggestions);
    if (newPreview.has(suggestionId)) {
      newPreview.delete(suggestionId);
    } else {
      newPreview.add(suggestionId);
    }
    setPreviewSuggestions(newPreview);
  };

  const handleApplySelected = async () => {
    if (selectedSuggestions.size === 0) return;
    
    setApplying(true);
    const success = await applySelectedSuggestions(Array.from(selectedSuggestions));
    if (success) {
      setSelectedSuggestions(new Set());
      onSuggestionsApplied();
    }
    setApplying(false);
  };

  const handleDismiss = async (suggestionId: string) => {
    await updateSuggestionStatus(suggestionId, 'dismissed');
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const groupedSuggestions = filteredSuggestions.reduce((groups, suggestion) => {
    const section = suggestion.section;
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(suggestion);
    return groups;
  }, {} as Record<string, StorySuggestion[]>);

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

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            No Suggestions Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Generate AI suggestions to see improvement recommendations for your story.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Story Suggestions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {pendingSuggestions.length} pending
              </Badge>
              {appliedSuggestions.length > 0 && (
                <Badge variant="secondary">
                  {appliedSuggestions.length} applied
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {pendingSuggestions.length > 0 && (
          <CardContent className="space-y-4">
            {/* Filter and Selection Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({pendingSuggestions.length})
                </Button>
                <Button
                  variant={filter === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('high')}
                >
                  High Impact ({pendingSuggestions.filter(s => s.impact_level === 'high').length})
                </Button>
                <Button
                  variant={filter === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('medium')}
                >
                  Medium ({pendingSuggestions.filter(s => s.impact_level === 'medium').length})
                </Button>
                <Button
                  variant={filter === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('low')}
                >
                  Low ({pendingSuggestions.filter(s => s.impact_level === 'low').length})
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredSuggestions.length === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedSuggestions.size === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedSuggestions.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {selectedSuggestions.size} suggestions selected
                  </span>
                  <Badge className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{totalExpectedImprovement} points
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleApplySelected}
                  disabled={applying}
                  className="flex items-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Apply Selected
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Suggestions by Section */}
      {Object.entries(groupedSuggestions).map(([section, sectionSuggestions]) => (
        <div key={section}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold capitalize">{section}</h3>
            <Badge variant="outline">{sectionSuggestions.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {sectionSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestions.has(suggestion.id)}
                onToggle={handleToggleSuggestion}
                onDismiss={handleDismiss}
                showPreview={previewSuggestions.has(suggestion.id)}
                onTogglePreview={() => handleTogglePreview(suggestion.id)}
              />
            ))}
          </div>
          
          {section !== Object.keys(groupedSuggestions)[Object.keys(groupedSuggestions).length - 1] && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
    </div>
  );
}