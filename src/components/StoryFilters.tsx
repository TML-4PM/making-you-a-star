
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter } from 'lucide-react';

export interface FilterState {
  search: string;
  tier: string;
  role: string;
  tags: string[];
  yearFrom: string;
  yearTo: string;
  view: 'all' | 'concise' | 'detailed';
}

interface StoryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableRoles: string[];
  availableTags: string[];
}

export const StoryFilters: React.FC<StoryFiltersProps> = ({
  filters,
  onFiltersChange,
  availableRoles,
  availableTags
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tier: 'all',
      role: 'all',
      tags: [],
      yearFrom: '',
      yearTo: '',
      view: 'all'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Quick View Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.view === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('view', 'all')}
            >
              All Stories
            </Button>
            <Button
              variant={filters.view === 'concise' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('view', 'concise')}
            >
              Concise CV (Tier 1)
            </Button>
            <Button
              variant={filters.view === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('view', 'detailed')}
            >
              Detailed CV (Tier 1-2)
            </Button>
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search stories..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tier</Label>
              <Select value={filters.tier} onValueChange={(value) => updateFilter('tier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="1">Tier 1</SelectItem>
                  <SelectItem value="2">Tier 2</SelectItem>
                  <SelectItem value="3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Year</Label>
              <Input
                type="number"
                placeholder="2020"
                value={filters.yearFrom}
                onChange={(e) => updateFilter('yearFrom', e.target.value)}
              />
            </div>
            <div>
              <Label>To Year</Label>
              <Input
                type="number"
                placeholder="2024"
                value={filters.yearTo}
                onChange={(e) => updateFilter('yearTo', e.target.value)}
              />
            </div>
          </div>

          {/* Tag Selection */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <Select onValueChange={addTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Add tag filter..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTags
                    .filter(tag => !filters.tags.includes(tag))
                    .map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              <Filter className="w-4 h-4 inline mr-1" />
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) ? 'Filters active' : 'No filters'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
