import React, { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdf-parse';

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

  const isExcelFile = (file: File): boolean => {
    const excelMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    const excelExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    
    return excelMimeTypes.includes(file.type) || 
           excelExtensions.some(ext => fileName.endsWith(ext));
  };

  const isCsvFile = (file: File): boolean => {
    return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
  };

  const isPdfFile = (file: File): boolean => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  const processPdfFile = (file: File): Promise<Story[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const pdfData = await pdfjsLib(arrayBuffer);
          const text = pdfData.text;
          
          if (!text.trim()) {
            throw new Error("PDF contains no readable text");
          }

          // Try to parse STAR format from PDF text
          const stories = parseSTARFromText(text);
          
          if (stories.length === 0) {
            throw new Error("No STAR format stories found in PDF. Please ensure your PDF contains structured interview stories.");
          }
          
          resolve(stories);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseSTARFromText = (text: string): Story[] => {
    const stories: Story[] = [];
    
    // Look for numbered questions or story patterns
    const sections = text.split(/\n\s*\n|\d+\.\s*/).filter(section => section.trim());
    
    for (const section of sections) {
      const story = extractSTARFromSection(section);
      if (story) {
        stories.push(story);
      }
    }
    
    return stories;
  };

  const extractSTARFromSection = (text: string): Story | null => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let organisation = '';
    let theme = '';
    let framing = 'Positive';
    let situation = '';
    let task = '';
    let action = '';
    let result = '';
    let lesson = '';
    
    // Look for STAR pattern markers
    const situationMatch = text.match(/(?:S:|Situation:|S:)[^\n]*\n([\s\S]*?)(?=T:|Task:|A:|Action:|R:|Result:|L:|Lesson:|$)/i);
    const taskMatch = text.match(/(?:T:|Task:|T:)[^\n]*\n([\s\S]*?)(?=A:|Action:|R:|Result:|L:|Lesson:|$)/i);
    const actionMatch = text.match(/(?:A:|Action:|A:)[^\n]*\n([\s\S]*?)(?=R:|Result:|L:|Lesson:|$)/i);
    const resultMatch = text.match(/(?:R:|Result:|R:)[^\n]*\n([\s\S]*?)(?=L:|Lesson:|$)/i);
    const lessonMatch = text.match(/(?:L:|Lesson:|L:)[^\n]*\n([\s\S]*?)$/i);
    
    if (situationMatch) situation = situationMatch[1].trim();
    if (taskMatch) task = taskMatch[1].trim();
    if (actionMatch) action = actionMatch[1].trim();
    if (resultMatch) result = resultMatch[1].trim();
    if (lessonMatch) lesson = lessonMatch[1].trim();
    
    // Try to extract theme and organisation from the beginning
    const firstLines = lines.slice(0, 5);
    for (const line of firstLines) {
      if (line.toLowerCase().includes('theme') || line.toLowerCase().includes('category')) {
        theme = line.replace(/theme[:\s]*/i, '').replace(/category[:\s]*/i, '').trim();
      }
      if (line.toLowerCase().includes('organisation') || line.toLowerCase().includes('company')) {
        organisation = line.replace(/organisation[:\s]*/i, '').replace(/company[:\s]*/i, '').trim();
      }
    }
    
    // Set defaults if not found
    if (!organisation) organisation = 'Extracted from PDF';
    if (!theme) theme = 'General';
    
    // Check if we have at least situation, task, action, and result
    if (situation && task && action && result) {
      return {
        Organisation: organisation,
        Theme: theme,
        Framing: framing,
        Situation: situation,
        Task: task,
        Action: action,
        Result: result,
        Lesson: lesson || 'See analysis for insights'
      };
    }
    
    return null;
  };

  const processExcelFile = (file: File): Promise<Story[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error("Excel file must contain headers and at least one data row");
          }
          
          const headers = jsonData[0] as string[];
          const requiredColumns = ['Organisation', 'Theme', 'Framing', 'Situation', 'Task', 'Action', 'Result', 'Lesson'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }
          
          const stories = jsonData.slice(1).map((row: any) => {
            const story: any = {};
            headers.forEach((header, index) => {
              story[header] = row[index] || '';
            });
            return story;
          }).filter(row => {
            return Object.values(row).some(value => value && value.toString().trim());
          });
          
          resolve(stories);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const processCsvFile = (file: File): Promise<Story[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          
          if (!csv.trim()) {
            throw new Error("The CSV file contains no data");
          }

          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error("CSV file must contain headers and at least one data row");
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const requiredColumns = ['Organisation', 'Theme', 'Framing', 'Situation', 'Task', 'Action', 'Result', 'Lesson'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }
          
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
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read CSV file"));
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    event.target.value = '';
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV, Excel, or PDF file to upload",
        variant: "destructive"
      });
      return;
    }

    const isValidFile = isCsvFile(file) || isExcelFile(file) || isPdfFile(file);
    
    if (!isValidFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV (.csv), Excel (.xlsx, .xls), or PDF (.pdf) file",
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
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const startTime = Date.now();
    const fileType = isExcelFile(file) ? "Excel" : isPdfFile(file) ? "PDF" : "CSV";
    
    toast({
      title: `Processing ${fileType} file...`,
      description: "Reading and validating your file",
    });

    try {
      let parsedData: Story[];
      
      if (isExcelFile(file)) {
        parsedData = await processExcelFile(file);
      } else if (isPdfFile(file)) {
        parsedData = await processPdfFile(file);
      } else {
        parsedData = await processCsvFile(file);
      }

      if (parsedData.length === 0) {
        toast({
          title: "No valid data found",
          description: "All rows appear to be empty or invalid",
          variant: "destructive"
        });
        return;
      }

      const requiredColumns = ['Organisation', 'Theme', 'Framing', 'Situation', 'Task', 'Action', 'Result', 'Lesson'];
      const emptyRequiredFields = parsedData.filter(row => 
        requiredColumns.some(col => !row[col as keyof Story] || !row[col as keyof Story].toString().trim())
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
        title: `✅ ${fileType} uploaded successfully!`,
        description: `${parsedData.length} stories imported in ${processingTime}s.`,
      });
      
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process file",
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
              Import your interview stories from CSV, Excel, or PDF files
            </p>
          </div>

          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-xl shadow-medium border p-8">
              <div className="bg-card rounded-xl border-2 border-dashed border-border p-12 hover:border-primary/50 transition-all duration-300">
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <label className="cursor-pointer group block">
                  <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    Click to upload CSV, Excel, or PDF file
                  </span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
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
                  <li>• First row must contain column headers (CSV/Excel)</li>
                  <li>• Supports CSV (.csv), Excel (.xlsx, .xls), and PDF (.pdf) formats</li>
                  <li>• PDF files should contain STAR format stories with clear S:, T:, A:, R: markers</li>
                  <li>• Use quotes for text containing commas (CSV only)</li>
                  <li>• Framing must be "Positive" or "Negative"</li>
                  <li>• Empty rows will be skipped</li>
                  <li>• Stories are saved to your account</li>
                  <li>• Duplicates may be imported</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">File Format Examples</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">CSV/Excel Format:</h4>
                  <div className="bg-card rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-muted-foreground whitespace-nowrap">
                      Organisation,Theme,Framing,Situation,Task,Action,Result,Lesson<br/>
                      "Tech Corp","Leading Change","Positive","We needed to...","My task was...","I took action by...","The result was...","I learned that..."
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">PDF Format (STAR structure):</h4>
                  <div className="bg-card rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-muted-foreground whitespace-pre-line">
                      S: At Unisys, a major government client was 9 months behind...{'\n'}
                      T: I was brought in to salvage the program...{'\n'}
                      A: I ran a 5-day "reset" sprint...{'\n'}
                      R: We went from 3-month delays to 2-week iterations...
                    </code>
                  </div>
                </div>
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