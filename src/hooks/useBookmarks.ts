import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load bookmarks from database
  const loadBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('story_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const bookmarkSet = new Set(data?.map(bookmark => bookmark.story_id) || []);
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (storyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to bookmark stories",
          variant: "destructive"
        });
        return;
      }

      const isBookmarked = bookmarks.has(storyId);

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId);

        if (error) throw error;

        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            story_id: storyId
          });

        if (error) throw error;

        setBookmarks(prev => new Set([...prev, storyId]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  return {
    bookmarks,
    loading,
    toggleBookmark,
    refetchBookmarks: loadBookmarks
  };
};