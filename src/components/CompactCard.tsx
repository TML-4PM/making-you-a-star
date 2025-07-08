import React from 'react';
import { Building, Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
    <div className={`bg-card rounded-lg border transition-all duration-300 hover:shadow-medium ${getFramingBg(item.Framing)}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              {getThemeIcon(item.Theme)}
              <span className="font-medium text-foreground text-sm">{item.Theme}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Building className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{item.Organisation}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getFramingColor(item.Framing)}`}>
              {item.Framing}
            </div>
            <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">
              {item.Situation}
            </p>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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