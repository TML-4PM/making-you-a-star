
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

interface ImportStats {
  imported: number;
  updated: number;
  errors: string[];
}

export const StoryImport: React.FC = () => {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
      const story: any = {};
      
      headers.forEach((header, index) => {
        story[header] = values[index] || '';
      });
      
      return story;
    });
  };

  const mapCSVToStory = (csvRow: any) => {
    // Map CSV fields to database fields
    const story = {
      star_l_id: csvRow['STAR-L ID'],
      role: csvRow['Role'],
      organisation: csvRow['Company'],
      year: csvRow['Year'] ? parseInt(csvRow['Year'].split('–')[0]) : null,
      situation: csvRow['Situation'],
      task: csvRow['Task'],
      action: csvRow['Action'],
      result: csvRow['Result'],
      lesson: csvRow['Learning'],
      tier: csvRow['Tier'] ? parseInt(csvRow['Tier']) : 1,
      external_docs_url: csvRow['Link to Project Docs'],
      score: csvRow['Score'] ? parseInt(csvRow['Score']) : null,
      theme: csvRow['Role'], // Use role as theme for now
      framing: 'Professional', // Default framing
      user_id: user?.id || null
    };

    // Parse tags
    const tags = csvRow['Tags'] ? csvRow['Tags'].split(';').map((t: string) => t.trim()) : [];
    
    return { story, tags };
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV data to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    const stats: ImportStats = { imported: 0, updated: 0, errors: [] };

    try {
      const csvRows = parseCSV(csvData);
      
      for (const csvRow of csvRows) {
        try {
          const { story, tags } = mapCSVToStory(csvRow);
          
          if (!story.star_l_id) {
            stats.errors.push(`Missing STAR-L ID for story: ${story.situation?.substring(0, 50)}...`);
            continue;
          }

          // Upsert story
          const { data: existingStory, error: fetchError } = await supabase
            .from('interview_stories')
            .select('id')
            .eq('star_l_id', story.star_l_id)
            .eq('user_id', story.user_id || '00000000-0000-0000-0000-000000000000')
            .maybeSingle();

          if (fetchError) {
            stats.errors.push(`Error checking existing story ${story.star_l_id}: ${fetchError.message}`);
            continue;
          }

          let storyId: string;
          
          if (existingStory) {
            // Update existing story
            const { data: updatedStory, error: updateError } = await supabase
              .from('interview_stories')
              .update(story)
              .eq('id', existingStory.id)
              .select('id')
              .single();

            if (updateError) {
              stats.errors.push(`Error updating story ${story.star_l_id}: ${updateError.message}`);
              continue;
            }
            
            storyId = updatedStory.id;
            stats.updated++;
          } else {
            // Insert new story
            const { data: newStory, error: insertError } = await supabase
              .from('interview_stories')
              .insert(story)
              .select('id')
              .single();

            if (insertError) {
              stats.errors.push(`Error inserting story ${story.star_l_id}: ${insertError.message}`);
              continue;
            }
            
            storyId = newStory.id;
            stats.imported++;
          }

          // Handle tags
          if (tags.length > 0) {
            // Delete existing tags for this story
            await supabase
              .from('story_tags')
              .delete()
              .eq('story_id', storyId);

            // Insert new tags
            const tagInserts = tags.map(tag => ({
              story_id: storyId,
              tag: tag,
              tag_type: 'label'
            }));

            await supabase
              .from('story_tags')
              .insert(tagInserts);
          }

        } catch (error) {
          stats.errors.push(`Error processing row: ${error}`);
        }
      }

      setImportStats(stats);
      
      toast({
        title: "Import Complete",
        description: `Imported ${stats.imported} new stories, updated ${stats.updated} existing stories`,
      });

    } catch (error) {
      toast({
        title: "Import Failed",
        description: `Error: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import STAR-L Stories
        </CardTitle>
        <CardDescription>
          Paste CSV data to import or update your STAR-L stories. Format: STAR-L ID,Role,Company,Year,Situation,Task,Action,Result,Learning,Tags,Tier,Link to Project Docs,Score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">CSV Data</label>
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        
        <Button 
          onClick={handleImport} 
          disabled={isImporting || !csvData.trim()}
          className="w-full"
        >
          {isImporting ? (
            <>
              <FileText className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Stories
            </>
          )}
        </Button>

        {importStats && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Import Complete:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Imported: {importStats.imported} new stories</li>
                  <li>Updated: {importStats.updated} existing stories</li>
                  {importStats.errors.length > 0 && (
                    <li>Errors: {importStats.errors.length}</li>
                  )}
                </ul>
                {importStats.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Errors</summary>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {importStats.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
