import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Lightbulb, 
  Building2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { StorySuggestion } from '@/hooks/useStorySuggestions';

interface SuggestionCardProps {
  suggestion: StorySuggestion;
  isSelected: boolean;
  onToggle: (suggestionId: string, selected: boolean) => void;
  onDismiss: (suggestionId: string) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const getTypeIcon = (type: StorySuggestion['suggestion_type']) => {
  switch (type) {
    case 'quantification': return TrendingUp;
    case 'leadership': return Target;
    case 'impact': return Building2;
    case 'clarity': return Lightbulb;
    case 'structure': return Brain;
    default: return Lightbulb;
  }
};

const getImpactColor = (level: StorySuggestion['impact_level']) => {
  switch (level) {
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSectionBadgeColor = (section: StorySuggestion['section']) => {
  switch (section) {
    case 'situation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'task': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'action': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'result': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'lesson': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function SuggestionCard({
  suggestion,
  isSelected,
  onToggle,
  onDismiss,
  showPreview,
  onTogglePreview
}: SuggestionCardProps) {
  const TypeIcon = getTypeIcon(suggestion.suggestion_type);
  const isApplied = suggestion.status === 'applied';
  const isDismissed = suggestion.status === 'dismissed';

  return (
    <Card className={`transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary border-primary' : ''
    } ${isApplied ? 'opacity-60 bg-green-50 dark:bg-green-950' : ''} ${
      isDismissed ? 'opacity-40' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={getSectionBadgeColor(suggestion.section)}>
              {suggestion.section.toUpperCase()}
            </Badge>
            <Badge className={getImpactColor(suggestion.impact_level)}>
              {suggestion.impact_level} impact
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {suggestion.suggestion_type}
            </Badge>
          </div>
          
          {!isApplied && !isDismissed && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                className="p-1 h-8 w-8"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(suggestion.id)}
                className="p-1 h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {suggestion.suggestion_text}
            </p>
            {!isApplied && !isDismissed && (
              <Switch
                checked={isSelected}
                onCheckedChange={(checked) => onToggle(suggestion.id, checked)}
                disabled={isApplied || isDismissed}
              />
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{suggestion.expected_improvement} points
            </span>
            <span>
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>

          {showPreview && (
            <div className="mt-4 p-3 border rounded-md bg-muted/50">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Current:</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.original_content}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Suggested:</p>
                  <p className="text-sm text-foreground">
                    {suggestion.suggested_content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isApplied && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Applied
            </div>
          )}

          {isDismissed && (
            <div className="text-xs text-muted-foreground">
              Dismissed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}