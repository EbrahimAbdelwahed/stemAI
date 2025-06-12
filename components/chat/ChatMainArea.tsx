'use client';

import { ReactNode } from 'react';

interface ChatMainAreaProps {
  children: ReactNode;
  title?: string;
}

export function ChatMainArea({ children, title }: ChatMainAreaProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Optional Header - only show if title provided */}
      {title && (
        <div className="border-b border-[#4d4d4d] p-4 bg-[#212121]">
          <h1 className="text-lg font-medium text-center text-white truncate">
            {title}
          </h1>
        </div>
      )}
      
      {/* Chat Content - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
} 