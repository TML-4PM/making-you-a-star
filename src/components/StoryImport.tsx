
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

interface StoryImportProps {
  onImportComplete?: (stats: {imported: number; updated: number}) => void;
}

export const StoryImport: React.FC<StoryImportProps> = ({ onImportComplete }) => {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse headers from first line
    const headerLine = lines[0];
    const headers = parseCSVRow(headerLine);
    
    // Parse data rows
    const rows = lines.slice(1);
    return rows.map(row => {
      const values = parseCSVRow(row);
      const story: any = {};
      
      headers.forEach((header, index) => {
        story[header] = values[index] || '';
      });
      
      return story;
    });
  };

  // Quote-aware CSV parser that handles commas inside quoted fields
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // Handle escaped quotes ("")
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const mapCSVToStory = (csvRow: any) => {
    // Extract year from ranges like "2019–2021" or single years
    const parseYear = (yearStr: string): number | null => {
      if (!yearStr) return null;
      const match = yearStr.match(/(\d{4})/);
      return match ? parseInt(match[1]) : null;
    };

    // Parse numeric fields safely
    const parseNumber = (str: string): number | null => {
      if (!str || str.trim() === '') return null;
      const num = parseInt(str.trim());
      return isNaN(num) ? null : num;
    };

    // Map CSV fields to database fields
    const story = {
      star_l_id: csvRow['STAR-L ID']?.trim() || null,
      role: csvRow['Role']?.trim() || null,
      organisation: csvRow['Company']?.trim() || null,
      year: parseYear(csvRow['Year']),
      situation: csvRow['Situation']?.trim() || null,
      task: csvRow['Task']?.trim() || null,
      action: csvRow['Action']?.trim() || null,
      result: csvRow['Result']?.trim() || null,
      lesson: csvRow['Learning']?.trim() || null,
      tier: parseNumber(csvRow['Tier']) || 1,
      external_docs_url: csvRow['Link to Project Docs']?.trim() || null,
      score: parseNumber(csvRow['Score']),
      theme: csvRow['Role']?.trim() || 'Professional', // Use role as theme
      framing: 'Professional', // Default framing
      user_id: user?.id || null
    };

    // Parse tags, handling semicolon-separated values
    const tagsStr = csvRow['Tags']?.trim();
    const tags = tagsStr ? tagsStr.split(';').map((t: string) => t.trim()).filter(Boolean) : [];
    
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

          // Upsert story - handle dev mode with null user_id
          let query = supabase
            .from('interview_stories')
            .select('id')
            .eq('star_l_id', story.star_l_id);
          
          if (story.user_id) {
            query = query.eq('user_id', story.user_id);
          } else {
            query = query.is('user_id', null);
          }
          
          const { data: existingStory, error: fetchError } = await query.maybeSingle();

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

          // Handle tags - gracefully handle RLS failures
          if (tags.length > 0) {
            try {
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

              const { error: tagsError } = await supabase
                .from('story_tags')
                .insert(tagInserts);

              if (tagsError) {
                // Fallback: store tags in ai_suggestions as JSON
                await supabase
                  .from('interview_stories')
                  .update({ 
                    ai_suggestions: { tags: tags, _fallback_reason: 'RLS_blocked_tags' }
                  })
                  .eq('id', storyId);
              }
            } catch (tagError) {
              // Silent fallback - tags will be stored in ai_suggestions
              await supabase
                .from('interview_stories')
                .update({ 
                  ai_suggestions: { tags: tags, _fallback_reason: 'tags_insert_failed' }
                })
                .eq('id', storyId);
            }
          }

        } catch (error) {
          stats.errors.push(`Error processing row: ${error}`);
        }
      }

      setImportStats(stats);
      
      // Notify parent component
      onImportComplete?.({
        imported: stats.imported,
        updated: stats.updated
      });
      
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
