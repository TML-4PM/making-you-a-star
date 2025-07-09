import React, { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';

interface Story {
  Organisation: string;
  Theme: string;
  Framing: string;
  Situation: string;
  Task: string;
  Action: string;
  Result: string;
  Lesson: string;
}

const UploadPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  const saveToDatabase = async (stories: Story[]) => {
    try {
      const dbStories = stories.map(story => ({
        organisation: story.Organisation,
        theme: story.Theme,
        framing: story.Framing,
        situation: story.Situation,
        task: story.Task,
        action: story.Action,
        result: story.Result,
        lesson: story.Lesson
      }));

      const { error } = await supabase
        .from('interview_stories')
        .insert(dbStories);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${stories.length} stories saved to database`,
      });
    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Error",
        description: "Failed to save stories to database",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    event.target.value = '';
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive"
      });
      return;
    }

    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file (.csv extension required)",
        variant: "destructive"
      });
      return;
    }

    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "The selected file appears to be empty",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a CSV file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const startTime = Date.now();
    
    toast({
      title: "Processing CSV...",
      description: "Reading and validating your file",
    });

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csv = e.target?.result as string;
          
          if (!csv.trim()) {
            toast({
              title: "Empty CSV file",
              description: "The CSV file contains no data",
              variant: "destructive"
            });
            return;
          }

          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            toast({
              title: "Insufficient data",
              description: "CSV file must contain headers and at least one data row",
              variant: "destructive"
            });
            return;
          }

          toast({
            title: "Validating CSV structure...",
            description: `Found ${lines.length - 1} potential records`,
          });

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const requiredColumns = ['Organisation', 'Theme', 'Framing', 'Situation', 'Task', 'Action', 'Result', 'Lesson'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            toast({
              title: "Missing required columns",
              description: `Missing: ${missingColumns.join(', ')}. Please check your CSV format.`,
              variant: "destructive"
            });
            return;
          }

          toast({
            title: "Processing records...",
            description: "Parsing and validating data",
          });
          
          const parsedData = lines.slice(1).map((line, index) => {
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim().replace(/^"|"$/g, ''));
            
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          }).filter(row => {
            return Object.values(row).some(value => value && value.toString().trim());
          });

          if (parsedData.length === 0) {
            toast({
              title: "No valid data found",
              description: "All rows appear to be empty or invalid",
              variant: "destructive"
            });
            return;
          }

          const emptyRequiredFields = parsedData.filter(row => 
            requiredColumns.some(col => !row[col] || !row[col].toString().trim())
          ).length;

          if (emptyRequiredFields > 0) {
            toast({
              title: "Data quality warning",
              description: `${emptyRequiredFields} records have empty required fields but will still be imported`,
            });
          }

          toast({
            title: "Saving to database...",
            description: `Uploading ${parsedData.length} stories`,
          });
          
          await saveToDatabase(parsedData);
          
          const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
          
          toast({
            title: "✅ CSV uploaded successfully!",
            description: `${parsedData.length} stories imported in ${processingTime}s.`,
          });
          
          setShowUploadDialog(false);
        } catch (error) {
          console.error('Error processing CSV:', error);
          toast({
            title: "Processing failed",
            description: error instanceof Error ? error.message : "Failed to process CSV file",
            variant: "destructive"
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "File read error",
          description: "Failed to read the selected file",
          variant: "destructive"
        });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred while uploading",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-8">
          <div className="animate-fade-in">
            <Upload className="w-24 h-24 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Upload Stories
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Import your interview stories from a CSV file
            </p>
          </div>

          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-xl shadow-medium border p-8">
              <div className="bg-card rounded-xl border-2 border-dashed border-border p-12 hover:border-primary/50 transition-all duration-300">
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <label className="cursor-pointer group block">
                  <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    Click to upload CSV file
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl shadow-medium border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Required Columns</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Organisation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Theme
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Framing (Positive/Negative)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Situation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Task
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Action
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Result
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Lesson
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl shadow-medium border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-warning" />
                  <h3 className="text-lg font-semibold text-foreground">Important Notes</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• First row must contain column headers</li>
                  <li>• Use quotes for text containing commas</li>
                  <li>• Framing must be "Positive" or "Negative"</li>
                  <li>• Empty rows will be skipped</li>
                  <li>• Stories are saved to your account</li>
                  <li>• Duplicates may be imported</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">CSV Format Example</h3>
              <div className="bg-card rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-muted-foreground whitespace-nowrap">
                  Organisation,Theme,Framing,Situation,Task,Action,Result,Lesson<br/>
                  "Tech Corp","Leading Change","Positive","We needed to...","My task was...","I took action by...","The result was...","I learned that..."
                </code>
              </div>
            </div>

            <div className="flex justify-center">
              <Link to="/">
                <Button variant="outline" className="shadow-soft">
                  Back to Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;