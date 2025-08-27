import { InterviewPrepTool } from '@/components/InterviewPrepTool';
import { useIframeResize } from '@/hooks/useIframeResize';

const EmbedInterviewPrepPage = () => {
  useIframeResize(true);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Prep Tool</h1>
              <p className="text-sm text-muted-foreground">
                Powered by <a 
                  href="https://make-me-a-star.lovable.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Make me a STAR
                </a>
              </p>
            </div>
            <a 
              href="https://make-me-a-star.lovable.app/interview-prep" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              Open in full app →
            </a>
          </div>
        </div>
        <InterviewPrepTool />
      </div>
    </div>
  );
};

export default EmbedInterviewPrepPage;