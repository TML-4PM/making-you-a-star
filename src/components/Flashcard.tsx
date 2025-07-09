import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Eye, EyeOff } from 'lucide-react';

interface FlashcardProps {
  front: string;
  back: string;
  onFlip?: () => void;
}

export const Flashcard = ({ front, back, onFlip }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div className="relative w-full h-96 perspective-1000">
      <Card 
        className={`absolute inset-0 w-full h-full transition-transform duration-500 cursor-pointer preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front */}
        <div className={`absolute inset-0 w-full h-full backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
          <div className="p-8 h-full flex flex-col justify-center items-center text-center space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Question</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground leading-relaxed">
              {front}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Click to reveal answer</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : 'visible'}`}>
          <div className="p-8 h-full flex flex-col justify-center space-y-6 bg-muted/30">
            <div className="flex items-center gap-2 text-success">
              <EyeOff className="w-5 h-5" />
              <span className="text-sm font-medium">Answer</span>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-lg text-foreground leading-relaxed">
                {back}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Click to flip back</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};