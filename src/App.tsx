
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AppNavigation } from "./components/AppNavigation";
import StoriesPage from "./pages/StoriesPage";
import StudyPage from "./pages/StudyPage";
import BookmarksPage from "./pages/BookmarksPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { GroupsPage } from "./pages/GroupsPage";
import { JobDescriptionsPage } from "./pages/JobDescriptionsPage";
import { JobAnalysisPage } from "./pages/JobAnalysisPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthGuard>
            <div className="min-h-screen w-full">
              <AppNavigation />
              <Routes>
                <Route path="/" element={<StoriesPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/job-descriptions" element={<JobDescriptionsPage />} />
                <Route path="/job-descriptions/:id" element={<JobAnalysisPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthGuard>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
