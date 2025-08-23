import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load bookmarks from localStorage for now (no auth required)
  const loadBookmarks = async () => {
    try {
      const stored = localStorage.getItem('story-bookmarks');
      if (stored) {
        const bookmarkArray = JSON.parse(stored);
        setBookmarks(new Set(bookmarkArray));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (storyId: string) => {
    try {
      const isBookmarked = bookmarks.has(storyId);
      
      let newBookmarks: Set<string>;
      if (isBookmarked) {
        newBookmarks = new Set(bookmarks);
        newBookmarks.delete(storyId);
      } else {
        newBookmarks = new Set([...bookmarks, storyId]);
      }
      
      setBookmarks(newBookmarks);
      localStorage.setItem('story-bookmarks', JSON.stringify(Array.from(newBookmarks)));
      
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? "Story removed from bookmarks" : "Story added to bookmarks"
      });
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