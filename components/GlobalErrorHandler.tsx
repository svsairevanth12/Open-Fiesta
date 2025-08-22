'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export default function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (process.env.NODE_ENV === 'production') {
        toast.error('Something went wrong. Please try again.');
      }
      
      event.preventDefault();
    };

    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error || event.message);
      
      if (process.env.NODE_ENV === 'production') {
        toast.error('An unexpected error occurred.');
      }
    };

    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      console.error('Resource loading error:', target?.tagName, target);
      
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('error', handleResourceError, true); // Use capture phase for resource errors

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  return <>{children}</>;
}
