import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Folder, Users, Target, Award, Lightbulb, Building2 } from 'lucide-react';
import { StoryGroup } from '@/hooks/useStoryGroups';

interface StoryGroupDialogProps {
  group?: StoryGroup;
  onSave: (groupData: Omit<StoryGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  trigger?: React.ReactNode;
}

const ICON_OPTIONS = [
  { icon: Folder, name: 'folder', label: 'Folder' },
  { icon: Users, name: 'users', label: 'Team' },
  { icon: Target, name: 'target', label: 'Goals' },
  { icon: Award, name: 'award', label: 'Achievement' },
  { icon: Lightbulb, name: 'lightbulb', label: 'Ideas' },
  { icon: Building2, name: 'building2', label: 'Company' },
];

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

export const StoryGroupDialog: React.FC<StoryGroupDialogProps> = ({
  group,
  onSave,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(group?.icon || 'folder');
  const [selectedColor, setSelectedColor] = useState(group?.color || '#3B82F6');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor
      });
      setOpen(false);
      if (!group) {
        // Reset form for new group
        setName('');
        setDescription('');
        setSelectedIcon('folder');
        setSelectedColor('#3B82F6');
      }
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create Group
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Story Group' : 'Create Story Group'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Leadership Stories"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what stories belong in this group..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {ICON_OPTIONS.map(({ icon: Icon, name, label }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedIcon === name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  title={label}
                >
                  <Icon className="w-5 h-5 mx-auto" style={{ color: selectedColor }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? 'border-foreground'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || loading}>
              {loading ? 'Saving...' : group ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};