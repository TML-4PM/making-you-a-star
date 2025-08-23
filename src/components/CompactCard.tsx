
import React from 'react';
import { Building, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Calendar, Star, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompactCardProps {
  item: any;
  index: number;
  isExpanded: boolean;
  isBookmarked: boolean;
  onToggleExpanded: () => void;
  onToggleBookmark: () => void;
  getThemeIcon: (theme: string) => React.ReactNode;
  getFramingColor: (framing: string) => string;
  getFramingBg: (framing: string) => string;
  children?: React.ReactNode;
}

export const CompactCard: React.FC<CompactCardProps> = ({
  item,
  index,
  isExpanded,
  isBookmarked,
  onToggleExpanded,
  onToggleBookmark,
  getThemeIcon,
  getFramingColor,
  getFramingBg,
  children,
}) => {
  return (
    <div className={`bg-card rounded-lg border transition-all duration-300 hover:shadow-medium ${getFramingBg(item.framing)}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Left side - Icon and main content */}
            <div className="flex-shrink-0 mt-1">
              {getThemeIcon(item.theme)}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap">
                {item.star_l_id && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {item.star_l_id}
                  </Badge>
                )}
                <span className="font-medium text-foreground text-sm">
                  {item.role || item.theme}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Building className="w-3 h-3" />
                  <span>{item.organisation}</span>
                </div>
                {item.year && (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{item.year}</span>
                  </div>
                )}
              </div>

              {/* Second row - Framing and tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getFramingColor(item.framing)}`}>
                  {item.framing}
                </div>
                {item.tier && (
                  <Badge variant="secondary" className="text-xs">
                    Tier {item.tier}
                  </Badge>
                )}
                {item.score !== null && item.score !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    <span>{item.score}</span>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.slice(0, 3).map((tag: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag.tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Third row - Situation */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.situation}
              </p>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-start gap-1 flex-shrink-0 ml-2">
            {item.external_docs_url && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <a 
                  href={item.external_docs_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View project docs"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
            
            <Button
              onClick={onToggleBookmark}
              variant={isBookmarked ? "bookmark-active" : "bookmark"}
              size="icon"
              className="h-8 w-8"
            >
              {isBookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            </Button>
            
            <Button
              onClick={onToggleExpanded}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {isExpanded && children}
      </div>
    </div>
  );
};
