import React, { useState } from 'react';
import { useStoryGroups, StoryGroup } from '@/hooks/useStoryGroups';
import { StoryGroupDialog } from '@/components/StoryGroupDialog';
import { StoryGroupCard } from '@/components/StoryGroupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FolderPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GroupsPage = () => {
  const navigate = useNavigate();
  const { groups, loading, createGroup, updateGroup, deleteGroup } = useStoryGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewGroup = (group: StoryGroup) => {
    navigate(`/groups/${group.id}`, { state: { group } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FolderPlus className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Groups</h2>
          <p className="text-muted-foreground">Fetching your story groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Story Groups
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize your interview stories into collections
              </p>
            </div>
          </div>
          
          <StoryGroupDialog onSave={createGroup} />
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl shadow-medium border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredGroups.length} of {groups.length} groups
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            {groups.length === 0 ? (
              <div className="space-y-4">
                <FolderPlus className="w-20 h-20 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Story Groups Yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first story group to organize your interview stories by theme, 
                    company, or any other criteria that helps you prepare.
                  </p>
                  <StoryGroupDialog 
                    onSave={createGroup}
                    trigger={
                      <Button size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Group
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Search className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Groups Found
                  </h3>
                  <p className="text-muted-foreground">
                    No groups match your search criteria. Try a different search term.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <StoryGroupCard
                key={group.id}
                group={group}
                onUpdate={updateGroup}
                onDelete={deleteGroup}
                onView={handleViewGroup}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {groups.length > 0 && (
          <div className="bg-card rounded-xl shadow-medium border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {groups.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Groups
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {groups.reduce((sum, group) => sum + (group.story_count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Stories Organized
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {groups.filter(group => (group.story_count || 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Groups
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};