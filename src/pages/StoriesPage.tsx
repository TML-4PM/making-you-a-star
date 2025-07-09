import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, EyeOff, X, Database, Save, Bookmark, BookmarkCheck, Clock, Target, Activity, Award, Building, Users, Lightbulb, AlertCircle, CheckCircle, RotateCcw, Star, Sparkles, FolderPlus, FileText } from 'lucide-react';
import heroImage from '@/assets/hero-star-image.jpg';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ViewToggle } from "@/components/ViewToggle";
import { StoryPagination } from "@/components/StoryPagination";
import { TableView } from "@/components/TableView";
import { CompactCard } from "@/components/CompactCard";
import { ExpandedContent } from "@/components/ExpandedContent";
import { useBookmarks } from "@/hooks/useBookmarks";

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
}

const StoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedFraming, setSelectedFraming] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showOnlyPositive, setShowOnlyPositive] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'compact' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();
  const { bookmarks, loading: bookmarksLoading, toggleBookmark } = useBookmarks();

  // Load data from database on component mount
  useEffect(() => {
    loadStoriesFromDatabase();
  }, []);

  const loadStoriesFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: stories, error } = await supabase
        .from('interview_stories')
        .select('*')
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
        Lesson: story.lesson
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

  const handleToggleBookmark = (index: number) => {
    const story = filteredData[index];
    if (story.id) {
      toggleBookmark(story.id);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some((value: any) => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesTheme = !selectedTheme || item.Theme === selectedTheme;
      const matchesOrg = !selectedOrg || item.Organisation === selectedOrg;
      const matchesFraming = !selectedFraming || item.Framing === selectedFraming;
      const matchesPositive = !showOnlyPositive || item.Framing === 'Positive';
      
      return matchesSearch && matchesTheme && matchesOrg && matchesFraming && matchesPositive;
    });
  }, [data, searchTerm, selectedTheme, selectedOrg, selectedFraming, showOnlyPositive]);

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
  const framings = [...new Set(data.map(item => item.Framing))];

  // Icon and color functions from original component
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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="STAR Method Interview Preparation" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-12 h-12 text-white animate-pulse" />
              <Sparkles className="w-8 h-8 text-white/80" />
              <Star className="w-10 h-10 text-white/90" />
            </div>
          </div>
          <div className="text-center text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Make me a <span className="bg-white/20 px-4 py-2 rounded-lg">STAR</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Master the STAR method with your interview stories. Situation, Task, Action, Result - 
              practice and perfect your responses for interview success.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span>Structured Practice</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Target className="w-5 h-5" />
                <span>Focused Learning</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="w-5 h-5" />
                <span>Interview Success</span>
              </div>
            </div>
          </div>
        </div>
        {/* Floating Stars */}
        <div className="absolute top-10 left-10 animate-bounce">
          <Star className="w-6 h-6 text-white/40" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse">
          <Star className="w-4 h-4 text-white/30" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-500">
          <Star className="w-5 h-5 text-white/50" />
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse delay-700">
          <Star className="w-7 h-7 text-white/40" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Interview Stories</h2>
              <p className="text-muted-foreground mt-1">
                {data.length} stories loaded • {displayedData.length} showing • Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.href = '/job-descriptions'}
              variant="outline"
              className="shadow-soft"
            >
              <FileText className="w-4 h-4 mr-2" />
              Job Analysis
            </Button>
            <Button
              onClick={() => window.location.href = '/groups'}
              variant="outline"
              className="shadow-soft"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Manage Groups
            </Button>
            <Button
              onClick={() => {
                setData([]);
                loadStoriesFromDatabase();
              }}
              variant="outline"
              className="shadow-soft"
            >
              <Database className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-medium border p-6 space-y-4 animate-slide-up sticky top-20 z-10">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 shadow-soft border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Themes</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>

            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Organisations</option>
              {organisations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              value={selectedFraming}
              onChange={(e) => setSelectedFraming(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Framing</option>
              {framings.map(framing => (
                <option key={framing} value={framing}>{framing}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowOnlyPositive(!showOnlyPositive)}
                variant={showOnlyPositive ? "filter-active" : "filter"}
                className="shadow-soft"
              >
                {showOnlyPositive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Show Only Positive
              </Button>

              <Button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                variant={showBookmarkedOnly ? "bookmark-active" : "bookmark"}
                className="shadow-soft"
              >
                {showBookmarkedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                Show Bookmarked ({bookmarks.size})
              </Button>

              {expandedCard !== null && (
                <Button
                  onClick={collapseAll}
                  variant="outline"
                  className="shadow-soft"
                >
                  <X className="w-4 h-4" />
                  Collapse All
                </Button>
              )}
            </div>

            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

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
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleToggleBookmark(index)}
                          variant={item.id && bookmarks.has(item.id) ? "bookmark-active" : "bookmark"}
                          size="icon"
                          className="shadow-soft"
                        >
                          {item.id && bookmarks.has(item.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          onClick={() => setExpandedCard(expandedCard === actualIndex ? null : actualIndex)}
                          variant="outline"
                          size="icon"
                          className="shadow-soft"
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
            <div className="text-muted-foreground text-xl mb-4">No stories match your current filters</div>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedTheme('');
                setSelectedOrg('');
                setSelectedFraming('');
                setShowOnlyPositive(false);
                setShowBookmarkedOnly(false);
                setCurrentPage(1);
              }}
              className="shadow-medium"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
