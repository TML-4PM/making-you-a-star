import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, EyeOff, X, Database, Save, Bookmark, BookmarkCheck, Clock, Target, Activity, Award, Building, Users, Lightbulb, AlertCircle, CheckCircle, RotateCcw, Star, Sparkles, FolderPlus, FileText, Filter, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ViewToggle } from "@/components/ViewToggle";
import { StoryPagination } from "@/components/StoryPagination";
import { TableView } from "@/components/TableView";
import { CompactCard } from "@/components/CompactCard";
import { ExpandedContent } from "@/components/ExpandedContent";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { StoryAnalytics } from "@/components/StoryAnalytics";
import { useBookmarks } from "@/hooks/useBookmarks";
import { QuestionSubmission } from "@/components/QuestionSubmission";

interface Story {
  id?: string;
  Organisation: string;
  Theme: string;
  Framing: string;
  Situation: string;
  Task: string;
  Action: string;
  Result: string;
  Lesson: string;
  quality_score?: number;
  completeness_score?: number;
  star_rating?: number;
  ai_suggestions?: string[];
  last_analyzed_at?: string;
}

interface SearchFilters {
  themes: string[];
  organisations: string[];
  qualityRange: [number, number];
  hasAISuggestions: boolean;
  minStarRating: number;
}

const StoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    themes: [],
    organisations: [],
    qualityRange: [0, 100],
    hasAISuggestions: false,
    minStarRating: 0
  });
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'compact' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const itemsPerPage = 15;
  const { toast } = useToast();
  const { user } = useAuth();
  const { bookmarks, loading: bookmarksLoading, toggleBookmark } = useBookmarks();

  // Load data from database on component mount
  useEffect(() => {
    loadStoriesFromDatabase();
  }, [user]);

  const loadStoriesFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: stories, error } = await supabase
        .from('interview_stories')
        .select(`
          *,
          story_tags (
            tag,
            tag_type,
            confidence
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to component format
      const transformedStories = stories?.map(story => ({
        id: story.id,
        Organisation: story.organisation,
        Theme: story.theme,
        Framing: story.framing,
        Situation: story.situation,
        Task: story.task,
        Action: story.action,
        Result: story.result,
        Lesson: story.lesson,
        quality_score: story.quality_score || 0,
        completeness_score: story.completeness_score || 0,
        star_rating: story.star_rating || 0,
        ai_suggestions: Array.isArray(story.ai_suggestions) ? story.ai_suggestions.map(String) : [],
        last_analyzed_at: story.last_analyzed_at
      })) || [];

      setData(transformedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (query: string, filters: SearchFilters) => {
    setSearchTerm(query);
    setSearchFilters(filters);
    setCurrentPage(1);

    if (!user) return;

    try {
      let queryBuilder = supabase
        .from('interview_stories')
        .select(`
          *,
          story_tags (
            tag,
            tag_type,
            confidence
          )
        `)
        .eq('user_id', user.id);

      // Apply full-text search if query provided
      if (query.trim()) {
        queryBuilder = queryBuilder.textSearch('search_vector', query.trim().replace(/\s+/g, ' | '));
      }

      // Apply filters
      if (filters.themes.length > 0) {
        queryBuilder = queryBuilder.in('theme', filters.themes);
      }

      if (filters.organisations.length > 0) {
        queryBuilder = queryBuilder.in('organisation', filters.organisations);
      }

      if (filters.minStarRating > 0) {
        queryBuilder = queryBuilder.gte('star_rating', filters.minStarRating);
      }

      if (filters.hasAISuggestions) {
        queryBuilder = queryBuilder.not('ai_suggestions', 'is', null);
      }

      const { data: stories, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;

      const transformedStories = stories?.map(story => ({
        id: story.id,
        Organisation: story.organisation,
        Theme: story.theme,
        Framing: story.framing,
        Situation: story.situation,
        Task: story.task,
        Action: story.action,
        Result: story.result,
        Lesson: story.lesson,
        quality_score: story.quality_score || 0,
        completeness_score: story.completeness_score || 0,
        star_rating: story.star_rating || 0,
        ai_suggestions: Array.isArray(story.ai_suggestions) ? story.ai_suggestions.map(String) : [],
        last_analyzed_at: story.last_analyzed_at
      })) || [];

      setData(transformedStories);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search stories",
        variant: "destructive"
      });
    }
  };

  const handleToggleBookmark = (index: number) => {
    const story = filteredData[index];
    if (story.id) {
      toggleBookmark(story.id);
    }
  };

  const filteredData = useMemo(() => {
    if (useAdvancedSearch) {
      return data; // Already filtered by advanced search
    }

    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some((value: any) => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return matchesSearch;
    });
  }, [data, searchTerm, useAdvancedSearch]);

  const displayedData = useMemo(() => {
    let result = filteredData;
    if (showBookmarkedOnly) {
      result = filteredData.filter(story => story.id && bookmarks.has(story.id));
    }
    return result;
  }, [filteredData, showBookmarkedOnly, bookmarks]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedData.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(displayedData.length / itemsPerPage);
  const themes = [...new Set(data.map(item => item.Theme))];
  const organisations = [...new Set(data.map(item => item.Organisation))];

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'Leading Change': return <Target className="w-4 h-4" />;
      case 'Handling Conflict or Resistance': return <AlertCircle className="w-4 h-4" />;
      case 'Simplifying the Complex': return <Lightbulb className="w-4 h-4" />;
      case 'Influencing Stakeholders': return <Users className="w-4 h-4" />;
      case 'Failing and Recovering': return <RotateCcw className="w-4 h-4" />;
      case 'Driving Innovation': return <Star className="w-4 h-4" />;
      case 'Cross-Functional Collaboration': return <Activity className="w-4 h-4" />;
      case 'Customer Impact': return <Award className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getFramingColor = (framing: string) => {
    return framing === 'Positive' ? 'text-success' : 'text-warning';
  };

  const getFramingBg = (framing: string) => {
    return framing === 'Positive' ? 'bg-success-light border-success/20' : 'bg-warning-light border-warning/20';
  };

  const collapseAll = () => {
    setExpandedCard(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Stories</h2>
          <p className="text-muted-foreground">Fetching your interview stories from the database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header with Instructions */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Interview Stories & Questions</h1>
            <Star className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Browse and search through interview stories using the STAR method. Use filters to find specific themes, 
            bookmark your favorites, and submit your own questions for future reference.
          </p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Browse Stories
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Story Collection</h2>
                  <p className="text-muted-foreground mt-1">
                    {data.length} stories loaded • {displayedData.length} showing • Page {currentPage} of {totalPages}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setUseAdvancedSearch(!useAdvancedSearch)}
                  variant={useAdvancedSearch ? "default" : "outline"}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {useAdvancedSearch ? 'Simple Search' : 'Advanced Search'}
                </Button>
                <Button
                  onClick={loadStoriesFromDatabase}
                  variant="outline"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-card rounded-xl shadow-medium border p-6 space-y-4 animate-slide-up sticky top-20 z-10">
              {useAdvancedSearch ? (
                <AdvancedSearch 
                  onSearch={handleAdvancedSearch}
                  availableThemes={themes}
                  availableOrganisations={organisations}
                />
              ) : (
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search stories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                    variant={showBookmarkedOnly ? "default" : "outline"}
                  >
                    {showBookmarkedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    Bookmarked ({bookmarks.size})
                  </Button>
                  <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                </div>
              )}
            </div>

            {/* Stories Display */}
        {currentView === 'table' ? (
          <TableView
            data={paginatedData}
            bookmarked={bookmarks}
            onToggleBookmark={(index) => {
              const story = paginatedData[index];
              if (story.id) {
                toggleBookmark(story.id);
              }
            }}
            getThemeIcon={getThemeIcon}
            getFramingColor={getFramingColor}
          />
        ) : (
          <div className={currentView === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-3'}>
            {paginatedData.map((item, index) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              
              if (currentView === 'compact') {
                return (
                  <CompactCard
                    key={actualIndex}
                    item={item}
                    index={actualIndex}
                    isExpanded={expandedCard === actualIndex}
                    isBookmarked={item.id ? bookmarks.has(item.id) : false}
                    onToggleExpanded={() => setExpandedCard(expandedCard === actualIndex ? null : actualIndex)}
                    onToggleBookmark={() => handleToggleBookmark(index)}
                    getThemeIcon={getThemeIcon}
                    getFramingColor={getFramingColor}
                    getFramingBg={getFramingBg}
                  >
                    <ExpandedContent item={item} />
                  </CompactCard>
                );
              }
              
              return (
                <div 
                  key={actualIndex} 
                  className={`bg-card rounded-xl shadow-medium border-2 transition-all duration-300 hover:shadow-large animate-fade-in ${getFramingBg(item.Framing)}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getThemeIcon(item.Theme)}
                          <span className="font-semibold text-foreground">{item.Theme}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.Organisation}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getFramingColor(item.Framing)}`}>
                          {item.Framing === 'Positive' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {item.Framing}
                        </div>
                        {/* Quality Indicators */}
                        {item.star_rating > 0 && (
                          <div className="flex items-center gap-1">
                            {[...Array(item.star_rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleToggleBookmark(index)}
                          variant={item.id && bookmarks.has(item.id) ? "default" : "outline"}
                          size="icon"
                        >
                          {item.id && bookmarks.has(item.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          onClick={() => setExpandedCard(expandedCard === actualIndex ? null : actualIndex)}
                          variant="outline"
                          size="icon"
                        >
                          {expandedCard === actualIndex ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {expandedCard === actualIndex && (
                      <div className="mt-6 space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              Situation
                            </h4>
                            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Situation}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              Task
                            </h4>
                            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Task}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Action
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Action}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Award className="w-4 h-4 text-success" />
                            Result
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Result}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-warning" />
                            Lesson
                          </h4>
                          <p className="text-muted-foreground leading-relaxed italic bg-accent-light p-4 rounded-lg border-l-4 border-accent">{item.Lesson}</p>
                        </div>

                        {/* Story Analytics */}
                        {item.id && (
                          <StoryAnalytics 
                            story={{
                              id: item.id,
                              theme: item.Theme,
                              organisation: item.Organisation,
                              situation: item.Situation,
                              task: item.Task,
                              action: item.Action,
                              result: item.Result,
                              lesson: item.Lesson,
                              quality_score: item.quality_score || 0,
                              completeness_score: item.completeness_score || 0,
                              star_rating: item.star_rating || 0,
                              ai_suggestions: item.ai_suggestions || [],
                              last_analyzed_at: item.last_analyzed_at || null,
                              tags: []
                            }}
                            onUpdate={loadStoriesFromDatabase}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <StoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {displayedData.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-muted-foreground text-xl mb-4">No stories match your current criteria</div>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSearchFilters({
                  themes: [],
                  organisations: [],
                  qualityRange: [0, 100],
                  hasAISuggestions: false,
                  minStarRating: 0
                });
                setShowBookmarkedOnly(false);
                setCurrentPage(1);
                loadStoriesFromDatabase();
              }}
            >
              Clear Filters & Reload
            </Button>
          </div>
        )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <QuestionSubmission />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoriesPage;