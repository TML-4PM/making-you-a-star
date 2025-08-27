import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const EmbedInstructions = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const iframeCode = `<div id="interview-prep-container" style="width: 100%; min-height: 600px;">
  <iframe 
    id="interview-prep-iframe"
    src="https://make-me-a-star.lovable.app/embed/interview-prep"
    style="width: 100%; height: 600px; border: none; border-radius: 8px;"
    title="Interview Prep Tool"
  ></iframe>
</div>

<script>
  // Auto-resize iframe based on content
  window.addEventListener('message', function(event) {
    if (event.data.type === 'iframe-resize') {
      const iframe = document.getElementById('interview-prep-iframe');
      if (iframe) {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Iframe code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Embed Integration</h2>
        <p className="text-lg text-muted-foreground">
          Integrate the Interview Prep Tool into troy-latter.lovable.app
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Iframe Embed Code</h3>
            <Badge variant="secondary">Auto-resizing</Badge>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 relative">
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              <code>{iframeCode}</code>
            </pre>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
            >
              {copied ? "Copied!" : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-resizing iframe</li>
                <li>• Minimal UI without navigation</li>
                <li>• Links back to full app</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add to Supabase Auth redirect URLs</li>
                <li>• Test iframe integration</li>
                <li>• Customize styling if needed</li>
                <li>• Monitor performance</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button asChild variant="outline">
              <a 
                href="https://make-me-a-star.lovable.app/embed/interview-prep" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Embed
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-info-light border-info/20">
        <h3 className="font-semibold text-info mb-2">Supabase Configuration</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Add <code className="bg-muted px-1 py-0.5 rounded">troy-latter.lovable.app</code> to your Supabase Auth redirect URLs:
        </p>
        <ol className="text-sm space-y-1 text-muted-foreground">
          <li>1. Go to Supabase Dashboard → Authentication → URL Configuration</li>
          <li>2. Add <code className="bg-muted px-1 py-0.5 rounded">https://troy-latter.lovable.app/**</code> to Redirect URLs</li>
          <li>3. Save the configuration</li>
        </ol>
      </Card>
    </div>
  );
};