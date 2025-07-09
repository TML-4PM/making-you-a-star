import React, { useMemo } from 'react';
import { BookOpen, Heart, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FlashcardSet } from "@/components/FlashcardSet";
import { useBookmarks } from "@/hooks/useBookmarks";
import { generateFlashcards } from "@/utils/flashcardGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from 'react';
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

const StudyPage = () => {
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const { bookmarks } = useBookmarks();

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

  const flashcards = useMemo(() => {
    return generateFlashcards(bookmarkedStories);
  }, [bookmarkedStories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Study Materials</h2>
          <p className="text-muted-foreground">Preparing your flashcards...</p>
        </div>
      </div>
    );
  }

  if (showFlashcards) {
    return (
      <FlashcardSet
        flashcards={flashcards}
        onClose={() => setShowFlashcards(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-8">
          <div className="animate-fade-in">
            <BookOpen className="w-24 h-24 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Study Mode
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Practice with flashcards generated from your bookmarked stories
            </p>
          </div>

          {bookmarkedStories.length > 0 ? (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-card rounded-xl shadow-medium border p-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">
                    {bookmarkedStories.length} Bookmarked Stories
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{flashcards.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Flashcards</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-success">{bookmarkedStories.length * 5}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">STAR Components</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-warning/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-warning">{bookmarkedStories.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Full Stories</p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowFlashcards(true)}
                  size="lg"
                  className="w-full max-w-md mx-auto shadow-soft bg-primary hover:bg-primary/90"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Study Session
                </Button>
              </div>

              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Study Tips</h3>
                <ul className="text-muted-foreground space-y-2 text-left max-w-2xl mx-auto">
                  <li>• Practice each STAR component individually</li>
                  <li>• Review full stories to see complete examples</li>
                  <li>• Focus on lessons learned for future applications</li>
                  <li>• Use the flip feature to test your memory</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-card rounded-xl shadow-medium border p-8">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-4">No Bookmarked Stories</h2>
                <p className="text-muted-foreground mb-6">
                  You need to bookmark some stories first to create flashcards for studying.
                </p>
                <Link to="/">
                  <Button variant="outline" className="shadow-soft">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Stories
                  </Button>
                </Link>
              </div>

              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">How to Get Started</h3>
                <ol className="text-muted-foreground space-y-2 text-left max-w-2xl mx-auto">
                  <li>1. Browse your interview stories</li>
                  <li>2. Click the bookmark icon on stories you want to study</li>
                  <li>3. Return here to practice with flashcards</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPage;