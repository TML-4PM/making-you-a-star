import React from 'react';
import { Clock, Target, Activity, Award, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpandedContentProps {
  item: any;
}

export const ExpandedContent: React.FC<ExpandedContentProps> = ({ item }) => {
  return (
    <div className="mt-4 animate-fade-in">
      <Tabs defaultValue="situation" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="situation" className="text-xs">Situation</TabsTrigger>
          <TabsTrigger value="task" className="text-xs">Task</TabsTrigger>
          <TabsTrigger value="action" className="text-xs">Action</TabsTrigger>
          <TabsTrigger value="result" className="text-xs">Result</TabsTrigger>
          <TabsTrigger value="lesson" className="text-xs">Lesson</TabsTrigger>
        </TabsList>
        
        <TabsContent value="situation" className="mt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Situation
            </h4>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg text-sm">
              {item.Situation}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="task" className="mt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Task
            </h4>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg text-sm">
              {item.Task}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="action" className="mt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Action
            </h4>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg text-sm">
              {item.Action}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="result" className="mt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-success" />
              Result
            </h4>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg text-sm">
              {item.Result}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="lesson" className="mt-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              Lesson
            </h4>
            <p className="text-muted-foreground leading-relaxed italic bg-accent-light p-3 rounded-lg border-l-4 border-accent text-sm">
              {item.Lesson}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};