import React, { useState, useMemo, useEffect } from 'react';
import { Heart, BookOpen, Search, Target, Activity, Award, Lightbulb, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookmarks } from "@/hooks/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';

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

const BookmarksPage = () => {
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { bookmarks, toggleBookmark } = useBookmarks();

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
    } finally {
      setLoading(false);
    }
  };

  const bookmarkedStories = useMemo(() => {
    return data.filter(story => story.id && bookmarks.has(story.id));
  }, [data, bookmarks]);

  const filteredBookmarks = useMemo(() => {
    if (!searchTerm) return bookmarkedStories;
    
    return bookmarkedStories.filter(story =>
      Object.values(story).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [bookmarkedStories, searchTerm]);

  const getFramingColor = (framing: string) => {
    return framing === 'Positive' ? 'text-success' : 'text-warning';
  };

  const getFramingBg = (framing: string) => {
    return framing === 'Positive' ? 'bg-success-light border-success/20' : 'bg-warning-light border-warning/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Bookmarks</h2>
          <p className="text-muted-foreground">Fetching your bookmarked stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Bookmarked Stories</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {bookmarkedStories.length} bookmarked stories ready for study
          </p>
        </div>

        {bookmarkedStories.length > 0 && (
          <div className="bg-card rounded-xl shadow-medium border p-6 space-y-4 animate-slide-up">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search bookmarked stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 shadow-soft border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              <Link to="/study">
                <Button className="shadow-soft bg-primary hover:bg-primary/90">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study These Stories
                </Button>
              </Link>
            </div>
          </div>
        )}

        {filteredBookmarks.length > 0 ? (
          <div className="space-y-4">
            {filteredBookmarks.map((story) => (
              <div
                key={story.id}
                className={`bg-card rounded-xl shadow-medium border-2 transition-all duration-300 hover:shadow-large animate-fade-in ${getFramingBg(story.Framing)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{story.Theme}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <span className="text-muted-foreground">{story.Organisation}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFramingColor(story.Framing)}`}>
                        {story.Framing}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => story.id && toggleBookmark(story.id)}
                        variant="bookmark-active"
                        size="icon"
                        className="shadow-soft"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                      
                      <Button
                        onClick={() => setExpandedCard(expandedCard === story.id ? null : story.id || null)}
                        variant="outline"
                        size="sm"
                        className="shadow-soft"
                      >
                        {expandedCard === story.id ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                  </div>

                  {expandedCard === story.id && (
                    <div className="mt-6 space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Situation
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{story.Situation}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Task
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{story.Task}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Action
                        </h4>
                        <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{story.Action}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Award className="w-4 h-4 text-success" />
                          Result
                        </h4>
                        <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{story.Result}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warning" />
                          Lesson
                        </h4>
                        <p className="text-muted-foreground leading-relaxed italic bg-accent-light p-4 rounded-lg border-l-4 border-accent">{story.Lesson}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : bookmarkedStories.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-card rounded-xl shadow-medium border p-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-4">No Bookmarked Stories</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start bookmarking your favorite stories to build your personal study collection.
              </p>
              <Link to="/">
                <Button className="shadow-medium">
                  Browse Stories
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-muted-foreground text-xl mb-4">No bookmarked stories match your search</div>
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="shadow-medium"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;