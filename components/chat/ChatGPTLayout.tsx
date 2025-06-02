'use client';

import { ReactNode } from 'react';
import { ChatSidebar } from './ChatSidebar';

interface ChatGPTLayoutProps {
  children: ReactNode;
  currentConversationId?: string;
}

export function ChatGPTLayout({ children, currentConversationId }: ChatGPTLayoutProps) {
  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">
      {/* Fixed Sidebar */}
      <ChatSidebar currentConversationId={currentConversationId} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
} 