import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface StoryGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  story_count?: number;
}

export interface StoryGroupItem {
  id: string;
  group_id: string;
  story_id: string;
  added_at: string;
}

export const useStoryGroups = () => {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadGroups = async () => {
    try {
      setLoading(true);
      
      // Get groups with story counts
      const { data: groupsData, error: groupsError } = await supabase
        .from('story_groups')
        .select(`
          *,
          story_group_items(count)
        `)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Transform data to include story counts
      const groupsWithCounts = groupsData?.map(group => ({
        ...group,
        story_count: group.story_group_items?.[0]?.count || 0
      })) || [];

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load story groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: Omit<StoryGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user?.id) {
        throw new Error('User must be authenticated to create story groups');
      }

      const { data, error } = await supabase
        .from('story_groups')
        .insert([{ ...groupData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story group created successfully"
      });

      await loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create story group",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateGroup = async (id: string, updates: Partial<StoryGroup>) => {
    try {
      const { error } = await supabase
        .from('story_groups')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story group updated successfully"
      });

      await loadGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update story group",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('story_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story group deleted successfully"
      });

      await loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete story group",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addStoryToGroup = async (groupId: string, storyId: string) => {
    try {
      const { error } = await supabase
        .from('story_group_items')
        .insert([{ group_id: groupId, story_id: storyId }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story added to group"
      });

      await loadGroups();
    } catch (error) {
      console.error('Error adding story to group:', error);
      toast({
        title: "Error",
        description: "Failed to add story to group",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeStoryFromGroup = async (groupId: string, storyId: string) => {
    try {
      const { error } = await supabase
        .from('story_group_items')
        .delete()
        .eq('group_id', groupId)
        .eq('story_id', storyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story removed from group"
      });

      await loadGroups();
    } catch (error) {
      console.error('Error removing story from group:', error);
      toast({
        title: "Error",
        description: "Failed to remove story from group",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getGroupStories = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('story_group_items')
        .select(`
          story_id,
          interview_stories (*)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      return data?.map(item => item.interview_stories).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting group stories:', error);
      toast({
        title: "Error",
        description: "Failed to load group stories",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addStoryToGroup,
    removeStoryFromGroup,
    getGroupStories,
    refreshGroups: loadGroups
  };
};