import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, RotateCcw, Target } from 'lucide-react';
import { Flashcard } from './Flashcard';

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  storyId: string;
  category: 'situation' | 'task' | 'action' | 'result' | 'lesson' | 'full-story';
}

interface FlashcardSetProps {
  flashcards: FlashcardData[];
  onClose: () => void;
}

export const FlashcardSet = ({ flashcards, onClose }: FlashcardSetProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyStats, setStudyStats] = useState({
    reviewed: 0,
    total: flashcards.length
  });

  const currentCard = flashcards[currentIndex];

  const goToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStudyStats(prev => ({ ...prev, reviewed: Math.max(prev.reviewed, currentIndex + 2) }));
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const shuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    // This would require updating the parent component to handle shuffled cards
    setCurrentIndex(0);
  };

  const restart = () => {
    setCurrentIndex(0);
    setStudyStats({ reviewed: 1, total: flashcards.length });
  };

  if (!currentCard) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-4">
          <Target className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">No flashcards available</h2>
          <p className="text-muted-foreground">Bookmark some stories first to create flashcards.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-large w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Study Mode</h2>
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Reviewed: {studyStats.reviewed}/{studyStats.total}
            </div>
            <Button onClick={restart} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Flashcard
              front={currentCard.front}
              back={currentCard.back}
            />
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button 
            onClick={goToPrevious} 
            disabled={currentIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground capitalize">
              {currentCard.category.replace('-', ' ')}
            </span>
          </div>

          <Button 
            onClick={goToNext} 
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};