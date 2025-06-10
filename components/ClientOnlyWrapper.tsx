'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that ensures children only render on the client side.
 * This prevents hydration errors for components that use browser-only APIs.
 */
export default function ClientOnlyWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-800 rounded h-32 flex items-center justify-center text-gray-400">Loading...</div> 
}: ClientOnlyWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 