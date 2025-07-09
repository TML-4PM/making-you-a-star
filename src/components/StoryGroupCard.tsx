import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { StoryGroup } from '@/hooks/useStoryGroups';
import { StoryGroupDialog } from './StoryGroupDialog';
import { MoreHorizontal, Edit, Trash2, Eye, Folder, Users, Target, Award, Lightbulb, Building2 } from 'lucide-react';

interface StoryGroupCardProps {
  group: StoryGroup;
  onUpdate: (id: string, updates: Partial<StoryGroup>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onView: (group: StoryGroup) => void;
}

const ICON_MAP = {
  folder: Folder,
  users: Users,
  target: Target,
  award: Award,
  lightbulb: Lightbulb,
  building2: Building2,
};

export const StoryGroupCard: React.FC<StoryGroupCardProps> = ({
  group,
  onUpdate,
  onDelete,
  onView
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const IconComponent = ICON_MAP[group.icon as keyof typeof ICON_MAP] || Folder;

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await onDelete(group.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleUpdate = async (groupData: Omit<StoryGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await onUpdate(group.id, groupData);
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${group.color}20`, color: group.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {group.description}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(group)}>
                <Eye className="w-4 h-4 mr-2" />
                View Stories
              </DropdownMenuItem>
              <StoryGroupDialog
                group={group}
                onSave={handleUpdate}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Group
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem 
                onClick={handleDelete}
                className={showDeleteConfirm ? "text-destructive bg-destructive/10" : "text-destructive"}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete Group'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {group.story_count || 0} {group.story_count === 1 ? 'story' : 'stories'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(group)}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Created {new Date(group.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};