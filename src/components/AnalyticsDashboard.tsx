import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Clock, Target, TrendingUp, Brain, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalSessions: number;
  totalPracticeTime: number;
  averageConfidence: number;
  readinessScore: number;
  lastPracticeAt: string | null;
  weakThemes: string[];
  strongThemes: string[];
}

interface SessionData {
  date: string;
  accuracy: number;
  confidence: number;
  session_count: number;
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSessions: 0,
    totalPracticeTime: 0,
    averageConfidence: 0,
    readinessScore: 0,
    lastPracticeAt: null,
    weakThemes: [],
    strongThemes: []
  });
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchSessionHistory();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAnalytics({
        totalSessions: data.total_sessions || 0,
        totalPracticeTime: data.total_practice_time_minutes || 0,
        averageConfidence: data.average_confidence || 0,
        readinessScore: data.readiness_score || 0,
        lastPracticeAt: data.last_practice_at,
        weakThemes: Array.isArray(data.weak_themes) ? data.weak_themes.map(String) : [],
        strongThemes: Array.isArray(data.strong_themes) ? data.strong_themes.map(String) : []
      });
    }
    setLoading(false);
  };

  const fetchSessionHistory = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('practice_sessions')
      .select(`
        started_at,
        completed_at,
        total_items,
        correct_items,
        practice_items (
          confidence_level
        )
      `)
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: true })
      .limit(30);

    if (data) {
      const processedData = data.map(session => {
        const accuracy = session.total_items > 0 
          ? Math.round((session.correct_items / session.total_items) * 100) 
          : 0;
        
        const avgConfidence = session.practice_items.length > 0
          ? session.practice_items.reduce((sum, item) => sum + (item.confidence_level || 0), 0) / session.practice_items.length
          : 0;

        return {
          date: new Date(session.started_at).toLocaleDateString(),
          accuracy,
          confidence: Math.round(avgConfidence),
          session_count: 1
        };
      });

      setSessionHistory(processedData);
    }
  };

  const calculateReadinessMessage = (score: number) => {
    if (score >= 80) return { message: "Interview Ready!", color: "text-green-600" };
    if (score >= 60) return { message: "Getting There", color: "text-yellow-600" };
    if (score >= 40) return { message: "Keep Practicing", color: "text-orange-600" };
    return { message: "Needs Work", color: "text-red-600" };
  };

  const readinessInfo = calculateReadinessMessage(analytics.readinessScore);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-medium">Interview Readiness</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{analytics.readinessScore}%</span>
            <span className={`text-sm font-medium ${readinessInfo.color}`}>
              {readinessInfo.message}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="font-medium">Practice Sessions</span>
          </div>
          <span className="text-3xl font-bold">{analytics.totalSessions}</span>
          <p className="text-sm text-muted-foreground mt-1">
            Total completed sessions
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-medium">Practice Time</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{analytics.totalPracticeTime}</span>
            <span className="text-muted-foreground">min</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-medium">Avg Confidence</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">{analytics.averageConfidence.toFixed(1)}</span>
            <span className="text-muted-foreground">/5</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="font-medium">Last Practice</span>
          </div>
          <span className="text-lg font-semibold">
            {analytics.lastPracticeAt 
              ? new Date(analytics.lastPracticeAt).toLocaleDateString()
              : 'Never'
            }
          </span>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-medium">Focus Areas</span>
          </div>
          <div className="space-y-1">
            {analytics.weakThemes.length > 0 ? (
              <p className="text-sm text-red-600">
                Work on: {analytics.weakThemes.slice(0, 2).join(', ')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete more sessions for insights
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      {sessionHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Confidence Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar 
                  dataKey="confidence" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recommendations</h3>
        <div className="space-y-3">
          {analytics.readinessScore < 70 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Increase Practice Frequency
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Try to practice at least 3 times per week to improve your readiness score
                </p>
              </div>
            </div>
          )}
          
          {analytics.totalSessions < 5 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Build Consistency
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Complete more practice sessions to unlock detailed analytics and insights
                </p>
              </div>
            </div>
          )}

          {analytics.averageConfidence < 3 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Focus on Story Development
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Review and strengthen your stories to build confidence in your responses
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}