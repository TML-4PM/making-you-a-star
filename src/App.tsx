import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppNavigation } from "./components/AppNavigation";
import StoriesPage from "./pages/StoriesPage";
import StudyPage from "./pages/StudyPage";
import BookmarksPage from "./pages/BookmarksPage";
import UploadPage from "./pages/UploadPage";
import NotFound from "./pages/NotFound";
import { GroupsPage } from "./pages/GroupsPage";
import { JobDescriptionsPage } from "./pages/JobDescriptionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen w-full">
          <AppNavigation />
          <Routes>
            <Route path="/" element={<StoriesPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/job-descriptions" element={<JobDescriptionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
