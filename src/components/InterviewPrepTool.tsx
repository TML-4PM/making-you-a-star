import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, EyeOff, Clock, Target, Activity, Award, Building, Users, Lightbulb, AlertCircle, CheckCircle, RotateCcw, Star, Bookmark, BookmarkCheck, Upload, X, Database, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ViewToggle } from "./ViewToggle";
import { StoryPagination } from "./StoryPagination";
import { TableView } from "./TableView";
import { CompactCard } from "./CompactCard";
import { ExpandedContent } from "./ExpandedContent";

interface Story {
  id?: string;
  Organisation: string;
  Theme: string;
  Framing: string;
  Situation: string;
  Task: string;
  Action: string;
  Result: string;
  Lesson: string;
}

const InterviewPrepTool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedFraming, setSelectedFraming] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showOnlyPositive, setShowOnlyPositive] = useState(false);
  const [bookmarked, setBookmarked] = useState(new Set<number>());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [data, setData] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'compact' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const itemsPerPage = 15;
  const { toast } = useToast();

  // Load data from database on component mount
  useEffect(() => {
    loadStoriesFromDatabase();
  }, []);

  const loadStoriesFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: stories, error } = await supabase
        .from('interview_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to component format
      const transformedStories = stories?.map(story => ({
        id: story.id,
        Organisation: story.organisation,
        Theme: story.theme,
        Framing: story.framing,
        Situation: story.situation,
        Task: story.task,
        Action: story.action,
        Result: story.result,
        Lesson: story.lesson
      })) || [];

      setData(transformedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async (stories: Story[]) => {
    try {
      // Transform component format to database format
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

      // Reload data from database
      await loadStoriesFromDatabase();
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
    
    // Reset file input
    event.target.value = '';
    
    // File validation
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

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a CSV file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const startTime = Date.now();
    
    // Show initial loading toast
    const loadingToast = toast({
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

          // Update loading message
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

          // Update loading message
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
            // Filter out completely empty rows
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

          // Validate data quality
          const emptyRequiredFields = parsedData.filter(row => 
            requiredColumns.some(col => !row[col] || !row[col].toString().trim())
          ).length;

          if (emptyRequiredFields > 0) {
            toast({
              title: "Data quality warning",
              description: `${emptyRequiredFields} records have empty required fields but will still be imported`,
            });
          }

          // Update loading message
          toast({
            title: "Saving to database...",
            description: `Uploading ${parsedData.length} stories`,
          });
          
          // Save to database
          await saveToDatabase(parsedData);
          
          const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
          
          // Success toast with details
          toast({
            title: "✅ CSV uploaded successfully!",
            description: `${parsedData.length} stories imported in ${processingTime}s. Data refreshed automatically.`,
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

  const toggleBookmark = (index: number) => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(index)) {
      newBookmarked.delete(index);
    } else {
      newBookmarked.add(index);
    }
    setBookmarked(newBookmarked);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some((value: any) => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesTheme = !selectedTheme || item.Theme === selectedTheme;
      const matchesOrg = !selectedOrg || item.Organisation === selectedOrg;
      const matchesFraming = !selectedFraming || item.Framing === selectedFraming;
      const matchesPositive = !showOnlyPositive || item.Framing === 'Positive';
      
      return matchesSearch && matchesTheme && matchesOrg && matchesFraming && matchesPositive;
    });
  }, [data, searchTerm, selectedTheme, selectedOrg, selectedFraming, showOnlyPositive]);

  const displayedData = useMemo(() => {
    let result = filteredData;
    if (showBookmarkedOnly) {
      result = filteredData.filter((_, index) => bookmarked.has(index));
    }
    return result;
  }, [filteredData, showBookmarkedOnly, bookmarked]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedData.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(displayedData.length / itemsPerPage);

  const themes = [...new Set(data.map(item => item.Theme))];
  const organisations = [...new Set(data.map(item => item.Organisation))];
  const framings = [...new Set(data.map(item => item.Framing))];

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'Leading Change': return <Target className="w-4 h-4" />;
      case 'Handling Conflict or Resistance': return <AlertCircle className="w-4 h-4" />;
      case 'Simplifying the Complex': return <Lightbulb className="w-4 h-4" />;
      case 'Influencing Stakeholders': return <Users className="w-4 h-4" />;
      case 'Failing and Recovering': return <RotateCcw className="w-4 h-4" />;
      case 'Driving Innovation': return <Star className="w-4 h-4" />;
      case 'Cross-Functional Collaboration': return <Activity className="w-4 h-4" />;
      case 'Customer Impact': return <Award className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getFramingColor = (framing: string) => {
    return framing === 'Positive' ? 'text-success' : 'text-warning';
  };

  const getFramingBg = (framing: string) => {
    return framing === 'Positive' ? 'bg-success-light border-success/20' : 'bg-warning-light border-warning/20';
  };

  const collapseAll = () => {
    setExpandedCard(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Stories</h2>
          <p className="text-muted-foreground">Fetching your interview stories from the database...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Make me a STAR
              </h1>
              <p className="text-muted-foreground text-lg">instant behavioural question helper - Upload a CSV file to get started with your interview preparation</p>
            </div>
            
            <div className="bg-card rounded-xl shadow-soft border-2 border-dashed border-border p-12 hover:border-primary/50 transition-all duration-300 animate-slide-up">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <label className="cursor-pointer group">
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
                Expected columns: Organisation, Theme, Framing, Situation, Task, Action, Result, Lesson
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Make me a STAR
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {data.length} stories loaded • {displayedData.length} showing • Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUploadDialog(true)}
              variant="outline"
              className="shadow-soft"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => {
                setData([]);
                loadStoriesFromDatabase();
              }}
              variant="outline"
              className="shadow-soft"
            >
              <Database className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-medium border p-6 space-y-4 animate-slide-up sticky top-4 z-10">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 shadow-soft border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Themes</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>

            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Organisations</option>
              {organisations.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              value={selectedFraming}
              onChange={(e) => setSelectedFraming(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-soft"
            >
              <option value="">All Framing</option>
              {framings.map(framing => (
                <option key={framing} value={framing}>{framing}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowOnlyPositive(!showOnlyPositive)}
                variant={showOnlyPositive ? "filter-active" : "filter"}
                className="shadow-soft"
              >
                {showOnlyPositive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Show Only Positive
              </Button>

              <Button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                variant={showBookmarkedOnly ? "bookmark-active" : "bookmark"}
                className="shadow-soft"
              >
                {showBookmarkedOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                Show Bookmarked ({bookmarked.size})
              </Button>

              {expandedCard !== null && (
                <Button
                  onClick={collapseAll}
                  variant="outline"
                  className="shadow-soft"
                >
                  <X className="w-4 h-4" />
                  Collapse All
                </Button>
              )}
            </div>

            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {currentView === 'table' ? (
          <TableView
            data={paginatedData}
            bookmarked={bookmarked}
            onToggleBookmark={toggleBookmark}
            getThemeIcon={getThemeIcon}
            getFramingColor={getFramingColor}
          />
        ) : (
          <div className={currentView === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-3'}>
            {paginatedData.map((item, index) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + index;
              
              if (currentView === 'compact') {
                return (
                  <CompactCard
                    key={actualIndex}
                    item={item}
                    index={actualIndex}
                    isExpanded={expandedCard === actualIndex}
                    isBookmarked={bookmarked.has(actualIndex)}
                    onToggleExpanded={() => setExpandedCard(expandedCard === actualIndex ? null : actualIndex)}
                    onToggleBookmark={() => toggleBookmark(actualIndex)}
                    getThemeIcon={getThemeIcon}
                    getFramingColor={getFramingColor}
                    getFramingBg={getFramingBg}
                  >
                    <ExpandedContent item={item} />
                  </CompactCard>
                );
              }
              
              return (
                <div 
                  key={actualIndex} 
                  className={`bg-card rounded-xl shadow-medium border-2 transition-all duration-300 hover:shadow-large animate-fade-in ${getFramingBg(item.Framing)}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getThemeIcon(item.Theme)}
                          <span className="font-semibold text-foreground">{item.Theme}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.Organisation}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getFramingColor(item.Framing)}`}>
                          {item.Framing === 'Positive' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {item.Framing}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => toggleBookmark(actualIndex)}
                          variant={bookmarked.has(actualIndex) ? "bookmark-active" : "bookmark"}
                          size="icon"
                          className="shadow-soft"
                        >
                          {bookmarked.has(actualIndex) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          onClick={() => setExpandedCard(expandedCard === actualIndex ? null : actualIndex)}
                          variant="outline"
                          size="icon"
                          className="shadow-soft"
                        >
                          {expandedCard === actualIndex ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {expandedCard === actualIndex && (
                      <div className="mt-6 space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              Situation
                            </h4>
                            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Situation}</p>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              Task
                            </h4>
                            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Task}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Action
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Action}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Award className="w-4 h-4 text-success" />
                            Result
                          </h4>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{item.Result}</p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-warning" />
                            Lesson
                          </h4>
                          <p className="text-muted-foreground leading-relaxed italic bg-accent-light p-4 rounded-lg border-l-4 border-accent">{item.Lesson}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <StoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {displayedData.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-muted-foreground text-xl mb-4">No stories match your current filters</div>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedTheme('');
                setSelectedOrg('');
                setSelectedFraming('');
                setShowOnlyPositive(false);
                setShowBookmarkedOnly(false);
                setCurrentPage(1);
              }}
              className="shadow-medium"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 shadow-large">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Import CSV File</h3>
                <Button
                  onClick={() => setShowUploadDialog(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-card rounded-xl border-2 border-dashed border-border p-8 hover:border-primary/50 transition-all duration-300">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <label className="cursor-pointer group block text-center">
                    <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                      Click to upload CSV file
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Expected columns:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Organisation</li>
                    <li>Theme</li>
                    <li>Framing (Positive/Negative)</li>
                    <li>Situation</li>
                    <li>Task</li>
                    <li>Action</li>
                    <li>Result</li>
                    <li>Lesson</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrepTool;