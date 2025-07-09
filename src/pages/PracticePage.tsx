import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PracticeFlashcards } from '@/components/PracticeFlashcards';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Brain, TrendingUp } from 'lucide-react';

export default function PracticePage() {
  const { user } = useAuth();
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchUserAnalytics();
    }
  }, [user]);

  const fetchUserAnalytics = async () => {
    const { data } = await supabase
      .from('user_analytics')
      .select('readiness_score, total_sessions')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setReadinessScore(data.readiness_score || 0);
      setTotalSessions(data.total_sessions || 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your stories and track your progress with AI-powered analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Readiness Score</p>
              <p className="text-2xl font-bold">{readinessScore}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Practice Sessions</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="practice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="practice">Practice Session</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <PracticeFlashcards onSessionComplete={fetchUserAnalytics} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}