
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryImport } from './StoryImport';
import { QuickScoring } from './QuickScoring';
import { StoryFilters, FilterState } from './StoryFilters';
import { Import, Calculator, Filter } from 'lucide-react';

interface StoryManagementProps {
  stories: any[];
  onRefresh: () => void;
  onImportComplete?: (stats: {imported: number; updated: number}) => void;
}

export const StoryManagement: React.FC<StoryManagementProps> = ({ stories, onRefresh, onImportComplete }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tier: 'all',
    role: 'all',
    tags: [],
    yearFrom: '',
    yearTo: '',
    view: 'all'
  });

  // Extract unique values for filter options
  const availableRoles = [...new Set(stories.map(s => s.role).filter(Boolean))];
  const availableTags = [...new Set(stories.flatMap(s => s.tags?.map((t: any) => t.tag) || []))];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Views
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Quick Scoring
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Import className="w-4 h-4" />
            Import Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <StoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableRoles={availableRoles}
            availableTags={availableTags}
          />
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <QuickScoring stories={stories} onScoreUpdate={onRefresh} />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <StoryImport onImportComplete={onImportComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
