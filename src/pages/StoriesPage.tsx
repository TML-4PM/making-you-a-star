
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, LayoutGrid, List, Search, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompactCard } from "@/components/CompactCard";
import { ExpandedContent } from "@/components/ExpandedContent";
import { TableView } from "@/components/TableView";
import { ViewToggle } from "@/components/ViewToggle";
import { StoryPagination } from "@/components/StoryPagination";
import { StoryManagement } from "@/components/StoryManagement";
import { FilterState } from "@/components/StoryFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { 
  Building, 
  Users, 
  Target, 
  Activity, 
  Award, 
  Lightbulb,
  TrendingUp,
  ShoppingCart,
  Code
} from 'lucide-react';

export const StoriesPage = () => {
  const { user } = useAuth();
  const { bookmarked, toggleBookmark } = useBookmarks();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'table'>('compact');
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showManagement, setShowManagement] = useState(false);
  const itemsPerPage = 10;

  // Fetch stories with tags
  const { data: stories = [], isLoading, refetch } = useQuery({
    queryKey: ['interview_stories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_stories')
        .select(`
          *,
          tags:story_tags(tag, tag_type, confidence)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Apply search and filters
  const filteredStories = useMemo(() => {
    if (!stories) return [];
    
    return stories.filter(story => {
      const searchFields = [
        story.theme,
        story.organisation,
        story.situation,
        story.task,
        story.action,
        story.result,
        story.lesson,
        story.framing,
        story.role,
        ...(story.tags?.map(t => t.tag) || [])
      ].filter(Boolean).join(' ').toLowerCase();

      return searchFields.includes(searchTerm.toLowerCase());
    });
  }, [stories, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage);
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getThemeIcon = (theme: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Leadership': <Users className="w-4 h-4 text-blue-500" />,
      'Technical': <Code className="w-4 h-4 text-green-500" />,
      'Sales': <ShoppingCart className="w-4 h-4 text-purple-500" />,
      'Consulting': <Target className="w-4 h-4 text-orange-500" />,
      'Management': <Building className="w-4 h-4 text-red-500" />,
      'Strategy': <TrendingUp className="w-4 h-4 text-indigo-500" />
    };
    return iconMap[theme] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getFramingColor = (framing: string) => {
    const colorMap: { [key: string]: string } = {
      'Challenge': 'bg-red-100 text-red-800',
      'Achievement': 'bg-green-100 text-green-800',
      'Growth': 'bg-blue-100 text-blue-800',
      'Innovation': 'bg-purple-100 text-purple-800',
      'Professional': 'bg-gray-100 text-gray-800'
    };
    return colorMap[framing] || 'bg-gray-100 text-gray-800';
  };

  const getFramingBg = (framing: string) => {
    const bgMap: { [key: string]: string } = {
      'Challenge': 'border-l-4 border-l-red-500',
      'Achievement': 'border-l-4 border-l-green-500',
      'Growth': 'border-l-4 border-l-blue-500',
      'Innovation': 'border-l-4 border-l-purple-500',
      'Professional': 'border-l-4 border-l-gray-500'
    };
    return bgMap[framing] || 'border-l-4 border-l-gray-500';
  };

  const handleToggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStories(newExpanded);
  };

  const handleToggleBookmark = (index: number) => {
    const story = paginatedStories[index];
    if (story?.id) {
      toggleBookmark(story.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Interview Stories
            </h1>
            <p className="text-muted-foreground">
              {filteredStories.length} stories • Manage your STAR-L database
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={showManagement ? "default" : "outline"}
              onClick={() => setShowManagement(!showManagement)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showManagement ? 'Hide Tools' : 'Show Tools'}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </div>
        </div>

        {/* Management Tools */}
        {showManagement && (
          <StoryManagement stories={stories} onRefresh={refetch} />
        )}

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Stories Display */}
        {viewMode === 'table' ? (
          <TableView
            data={paginatedStories}
            bookmarked={bookmarked}
            onToggleBookmark={handleToggleBookmark}
            getThemeIcon={getThemeIcon}
            getFramingColor={getFramingColor}
          />
        ) : (
          <div className="space-y-4">
            {paginatedStories.map((story, index) => (
              <CompactCard
                key={story.id}
                item={story}
                index={index}
                isExpanded={expandedStories.has(index)}
                isBookmarked={story.id ? bookmarked.has(story.id) : false}
                onToggleExpanded={() => handleToggleExpanded(index)}
                onToggleBookmark={() => handleToggleBookmark(index)}
                getThemeIcon={getThemeIcon}
                getFramingColor={getFramingColor}
                getFramingBg={getFramingBg}
              >
                <ExpandedContent item={story} />
              </CompactCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <StoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};
