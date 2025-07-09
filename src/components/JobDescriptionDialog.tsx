import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Upload } from 'lucide-react';

interface JobDescriptionDialogProps {
  onSave: (jdData: { title: string; company?: string; description: string; }) => Promise<void>;
  trigger?: React.ReactNode;
}

export const JobDescriptionDialog: React.FC<JobDescriptionDialogProps> = ({
  onSave,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        company: company.trim() || undefined,
        description: description.trim()
      });
      setOpen(false);
      // Reset form
      setTitle('');
      setCompany('');
      setDescription('');
    } catch (error) {
      console.error('Error saving job description:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setDescription(text);
      
      // Try to extract title from filename
      if (!title) {
        const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTitle(filename.replace(/[-_]/g, ' '));
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add Job Description
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Description</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Product Manager"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Google"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the job description here or upload a file..."
                    className="min-h-[200px] resize-y"
                    rows={8}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Or upload a file:</span>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <span>
                      <Upload className="w-3 h-3 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Extract key themes and requirements automatically</li>
              <li>• Analyze against your existing interview stories</li>
              <li>• Generate match scores and recommendations</li>
              <li>• Suggest story groups for this role</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !description.trim() || loading}
            >
              {loading ? 'Analyzing...' : 'Analyze & Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};