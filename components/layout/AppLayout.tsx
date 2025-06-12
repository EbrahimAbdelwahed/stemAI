'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  currentConversationId?: string;
}

export function AppLayout({ children, showSidebar = true, currentConversationId }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Responsive sidebar management
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-neutral-950">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex relative overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed}
        currentConversationId={currentConversationId}
      />
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative z-10",
        sidebarCollapsed ? "ml-0" : "ml-0"
      )}>
        {/* Top Header Bar */}
        <header className="bg-neutral-900/50 border-b border-neutral-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center space-x-4">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Breadcrumb or page title could go here */}
            </div>
            
            {/* User actions */}
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors duration-200"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.239 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
      
      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
} 