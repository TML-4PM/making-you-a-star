import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { JobDescription } from '@/hooks/useJobDescriptions';
import { MoreHorizontal, Trash2, Eye, Target, Building2, Calendar, Zap } from 'lucide-react';

interface JobDescriptionCardProps {
  jobDescription: JobDescription;
  onDelete: (id: string) => Promise<void>;
  onAnalyze: (jd: JobDescription) => void;
  matchCount?: number;
}

export const JobDescriptionCard: React.FC<JobDescriptionCardProps> = ({
  jobDescription,
  onDelete,
  onAnalyze,
  matchCount = 0
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await onDelete(jobDescription.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const themes = Array.isArray(jobDescription.extracted_themes) 
    ? jobDescription.extracted_themes 
    : [];
  
  const keywords = Array.isArray(jobDescription.extracted_keywords) 
    ? jobDescription.extracted_keywords.slice(0, 6)
    : [];

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {jobDescription.title}
              </CardTitle>
              {jobDescription.company && (
                <p className="text-sm text-muted-foreground mt-1">
                  {jobDescription.company}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(jobDescription.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAnalyze(jobDescription)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className={showDeleteConfirm ? "text-destructive bg-destructive/10" : "text-destructive"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Themes */}
        {themes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Key Themes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {themes.slice(0, 3).map((theme, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {themes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{themes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Keywords</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {keywords.join(' • ')}
              {jobDescription.extracted_keywords.length > 6 && ` • +${jobDescription.extracted_keywords.length - 6} more`}
            </div>
          </div>
        )}

        {/* Description Preview */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {jobDescription.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Badge variant={matchCount > 0 ? "default" : "secondary"} className="text-xs">
            {matchCount} story {matchCount === 1 ? 'match' : 'matches'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalyze(jobDescription)}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};