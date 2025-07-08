import React from 'react';
import { Grid3X3, List, Table } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  currentView: 'cards' | 'compact' | 'table';
  onViewChange: (view: 'cards' | 'compact' | 'table') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="h-8"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button
        variant={currentView === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('compact')}
        className="h-8"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8"
      >
        <Table className="w-4 h-4" />
      </Button>
    </div>
  );
};