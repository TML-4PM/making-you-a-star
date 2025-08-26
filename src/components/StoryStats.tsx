import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Hash, 
  Trophy, 
  Star, 
  ExternalLink,
  TrendingUp 
} from 'lucide-react';

interface StoryStatsProps {
  stories: any[];
  lastImportStats?: { imported: number; updated: number } | null;
}

export const StoryStats: React.FC<StoryStatsProps> = ({ stories, lastImportStats }) => {
  const totalStories = stories.length;
  const withStarlId = stories.filter(s => s.star_l_id).length;
  const withoutTier = stories.filter(s => !s.tier || s.tier === null).length;
  const withoutScore = stories.filter(s => !s.score || s.score === null).length;
  const withoutDocs = stories.filter(s => !s.external_docs_url).length;
  const expandedStories = stories.filter(s => s.star_l_id || s.tier || s.score).length;

  const stats = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Total Stories",
      value: totalStories,
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Hash className="w-4 h-4" />,
      label: "With STAR‑L ID",
      value: withStarlId,
      color: "bg-green-100 text-green-800"
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      label: "Without Tier",
      value: withoutTier,
      color: "bg-orange-100 text-orange-800"
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "Without Score",
      value: withoutScore,
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      icon: <ExternalLink className="w-4 h-4" />,
      label: "Without Docs",
      value: withoutDocs,
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Expanded",
      value: expandedStories,
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {stats.map((stat, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`flex items-center gap-2 px-3 py-2 ${stat.color}`}
            >
              {stat.icon}
              <span className="font-medium">{stat.label}</span>
              <span className="font-bold">{stat.value}</span>
            </Badge>
          ))}
          
          {lastImportStats && (
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
              <span className="text-xs">Last import:</span>
              <span className="font-medium text-green-600">+{lastImportStats.imported}</span>
              <span className="font-medium text-blue-600">~{lastImportStats.updated}</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};