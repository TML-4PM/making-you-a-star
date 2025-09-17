
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppNavigation } from "./components/AppNavigation";
import LandingPage from "./pages/LandingPage";
import StoriesPage from "./pages/StoriesPage";
import StoryOptimizationPage from "./pages/StoryOptimizationPage";
import StudyPage from "./pages/StudyPage";
import PracticePage from "./pages/PracticePage";
import BookmarksPage from "./pages/BookmarksPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { GroupsPage } from "./pages/GroupsPage";
import JobDescriptionsPage from "./pages/JobDescriptionsPage";
import JobAnalysisPage from "./pages/JobAnalysisPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import EmbedInterviewPrepPage from "./pages/EmbedInterviewPrepPage";
import EmbedInstructionsPage from "./pages/EmbedInstructionsPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Embed routes - no navigation */}
            <Route path="/embed/*" element={
              <div className="min-h-screen w-full">
                <Routes>
                  <Route path="interview-prep" element={<EmbedInterviewPrepPage />} />
                </Routes>
              </div>
            } />
            
            {/* Regular routes - with navigation */}
            <Route path="*" element={
              <div className="min-h-screen w-full">
                <AppNavigation />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/stories" element={<StoriesPage />} />
                  <Route path="/stories/:id/optimize" element={<StoryOptimizationPage />} />
                  <Route path="/study" element={<StudyPage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/interview-prep" element={<InterviewPrepPage />} />
                  <Route path="/embed-instructions" element={<EmbedInstructionsPage />} />
                  <Route path="/job-descriptions" element={<JobDescriptionsPage />} />
                  <Route path="/job-descriptions/:id" element={<JobAnalysisPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            } />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
