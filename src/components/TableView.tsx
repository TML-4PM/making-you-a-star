import React from 'react';
import { Building, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
            <TableHead>Theme</TableHead>
            <TableHead>Organisation</TableHead>
            <TableHead>Framing</TableHead>
            <TableHead>Situation</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center justify-center">
                  {getThemeIcon(item.Theme)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.Theme}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  {item.Organisation}
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFramingColor(item.Framing)}`}>
                  {item.Framing}
                </span>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="truncate text-sm text-muted-foreground">
                  {item.Situation}
                </p>
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