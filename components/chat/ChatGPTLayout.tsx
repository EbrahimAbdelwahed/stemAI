'use client';

import { ReactNode, useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';

interface ChatGPTLayoutProps {
  children: ReactNode;
  currentConversationId?: string;
}

export function ChatGPTLayout({ children, currentConversationId }: ChatGPTLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on mobile when conversation changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [currentConversationId]);

  // Handle window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Reset mobile state on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:block">
        <ChatSidebar currentConversationId={currentConversationId} />
      </div>
      
      {/* Mobile Sidebar - Overlay on mobile */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <ChatSidebar 
              currentConversationId={currentConversationId} 
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden bg-[#212121] border-b border-[#4d4d4d] p-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2f2f2f] transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
} 