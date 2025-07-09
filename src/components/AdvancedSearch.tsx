import { useState } from 'react';
import { Search, X, Filter, Tag, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchFilters {
  themes: string[];
  organisations: string[];
  qualityRange: [number, number];
  hasAISuggestions: boolean;
  minStarRating: number;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableThemes: string[];
  availableOrganisations: string[];
}

export function AdvancedSearch({ onSearch, availableThemes, availableOrganisations }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    themes: [],
    organisations: [],
    qualityRange: [0, 100],
    hasAISuggestions: false,
    minStarRating: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, filters);
  };

  const clearFilters = () => {
    setFilters({
      themes: [],
      organisations: [],
      qualityRange: [0, 100],
      hasAISuggestions: false,
      minStarRating: 0
    });
    setSearchQuery('');
    onSearch('', {
      themes: [],
      organisations: [],
      qualityRange: [0, 100],
      hasAISuggestions: false,
      minStarRating: 0
    });
  };

  const toggleTheme = (theme: string) => {
    setFilters(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const toggleOrganisation = (org: string) => {
    setFilters(prev => ({
      ...prev,
      organisations: prev.organisations.includes(org)
        ? prev.organisations.filter(o => o !== org)
        : [...prev.organisations, org]
    }));
  };

  const activeFiltersCount = 
    filters.themes.length + 
    filters.organisations.length + 
    (filters.hasAISuggestions ? 1 : 0) + 
    (filters.minStarRating > 0 ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories by keywords, themes, situations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Search Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>

              {/* Themes Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Themes</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableThemes.map(theme => (
                    <div key={theme} className="flex items-center space-x-2">
                      <Checkbox
                        id={theme}
                        checked={filters.themes.includes(theme)}
                        onCheckedChange={() => toggleTheme(theme)}
                      />
                      <label htmlFor={theme} className="text-sm">{theme}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organisations Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Organisations</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableOrganisations.map(org => (
                    <div key={org} className="flex items-center space-x-2">
                      <Checkbox
                        id={org}
                        checked={filters.organisations.includes(org)}
                        onCheckedChange={() => toggleOrganisation(org)}
                      />
                      <label htmlFor={org} className="text-sm">{org}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Star Rating</label>
                <Select
                  value={filters.minStarRating.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minStarRating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Suggestions Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-suggestions"
                  checked={filters.hasAISuggestions}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, hasAISuggestions: !!checked }))
                  }
                />
                <label htmlFor="ai-suggestions" className="text-sm">
                  Has AI Improvement Suggestions
                </label>
              </div>

              <Button 
                onClick={() => { handleSearch(); setShowFilters(false); }} 
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => { setSearchQuery(''); handleSearch(); }}
              />
            </Badge>
          )}
          
          {filters.themes.map(theme => (
            <Badge key={theme} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {theme}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleTheme(theme)}
              />
            </Badge>
          ))}

          {filters.organisations.map(org => (
            <Badge key={org} variant="outline" className="flex items-center gap-1">
              {org}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleOrganisation(org)}
              />
            </Badge>
          ))}

          {filters.minStarRating > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {filters.minStarRating}+ Stars
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setFilters(prev => ({ ...prev, minStarRating: 0 }))}
              />
            </Badge>
          )}

          {filters.hasAISuggestions && (
            <Badge variant="outline" className="flex items-center gap-1">
              Has AI Suggestions
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setFilters(prev => ({ ...prev, hasAISuggestions: false }))}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}