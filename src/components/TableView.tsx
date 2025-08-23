
import React from 'react';
import { Building, Bookmark, BookmarkCheck, Calendar, Star, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableViewProps {
  data: any[];
  bookmarked: Set<string>;
  onToggleBookmark: (index: number) => void;
  getThemeIcon: (theme: string) => React.ReactNode;
  getFramingColor: (framing: string) => string;
}

export const TableView: React.FC<TableViewProps> = ({
  data,
  bookmarked,
  onToggleBookmark,
  getThemeIcon,
  getFramingColor,
}) => {
  return (
    <div className="bg-card rounded-xl shadow-medium border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organisation</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Framing</TableHead>
            <TableHead>Situation</TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center justify-center">
                  {getThemeIcon(item.theme)}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {item.star_l_id && (
                  <Badge variant="outline" className="text-xs">
                    {item.star_l_id}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.role || item.theme}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  {item.organisation}
                </div>
              </TableCell>
              <TableCell>
                {item.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {item.year}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {item.tier && (
                  <Badge variant="secondary" className="text-xs">
                    T{item.tier}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {item.score !== null && item.score !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-muted-foreground" />
                    {item.score}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFramingColor(item.framing)}`}>
                  {item.framing}
                </span>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="truncate text-sm text-muted-foreground">
                  {item.situation}
                </p>
              </TableCell>
              <TableCell>
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
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => onToggleBookmark(index)}
                  variant={item.id && bookmarked.has(item.id) ? "bookmark-active" : "bookmark"}
                  size="icon"
                  className="h-8 w-8"
                >
                  {item.id && bookmarked.has(item.id) ? 
                    <BookmarkCheck className="w-3 h-3" /> : 
                    <Bookmark className="w-3 h-3" />
                  }
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
