import { useEffect } from 'react';

export const useIframeResize = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    // Auto-resize iframe functionality
    const resizeObserver = new ResizeObserver(() => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ 
          type: 'iframe-resize', 
          height: height + 20 // Add small padding
        }, '*');
      }
    });

    // Observe both body and main content changes
    resizeObserver.observe(document.body);
    const mainContent = document.querySelector('main');
    if (mainContent) {
      resizeObserver.observe(mainContent);
    }

    // Send initial height
    const sendInitialHeight = () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ 
          type: 'iframe-resize', 
          height: height + 20
        }, '*');
      }
    };

    // Send height after DOM is ready and content is loaded
    sendInitialHeight();
    setTimeout(sendInitialHeight, 100);
    setTimeout(sendInitialHeight, 500);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled]);
};