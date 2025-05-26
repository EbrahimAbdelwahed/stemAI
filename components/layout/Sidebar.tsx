'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from '@/components/chat/ConversationItem';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  currentConversationId?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  {
    title: 'Chat',
    href: '/chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export function Sidebar({ isCollapsed, onCollapsedChange, currentConversationId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    conversations,
    isLoading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
  } = useConversations();

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const handleNewChat = () => {
    // Navigate to new chat
    router.push('/chat');
  };

  const handleRename = async (id: string, newTitle: string): Promise<boolean> => {
    return await updateConversation(id, { title: newTitle });
  };

  const handleArchive = async (id: string): Promise<boolean> => {
    return await deleteConversation(id, true); // Archive instead of delete
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    return await deleteConversation(id, false); // Permanent delete
  };

  return (
    <div className={cn(
      "flex flex-col bg-neutral-900/50 border-r border-neutral-800/50 backdrop-blur-sm transition-all duration-300 relative z-20",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <svg 
                className="w-6 h-6 text-neutral-300 group-hover:text-neutral-100 transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              STEM AI
            </span>
          </Link>
        )}
        
        <button
          onClick={() => onCollapsedChange(!isCollapsed)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-lg bg-neutral-600 hover:bg-neutral-700 text-white transition-colors duration-200",
              isCollapsed && "justify-center px-3"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">New Chat</span>}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200",
                  isActive 
                    ? "bg-neutral-800/80 text-white" 
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/50",
                  isCollapsed && "justify-center px-3"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Conversation History */}
        {!isCollapsed && session?.user && (
          <div className="flex-1 px-4 mt-6">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Recent Conversations
              </h3>
            </div>
            
            {/* Search Box */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Conversation List */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {error && (
                <div className="p-2 text-sm text-red-400 bg-red-900/20 rounded-lg">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-800/50 rounded-lg animate-pulse" />
                ))
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation.id}
                    onRename={handleRename}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="p-2 text-center">
                  <p className="text-neutral-400 text-sm">
                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Sign-in prompt for unauthenticated users */}
        {!isCollapsed && !session?.user && (
          <div className="flex-1 px-4 mt-6">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Chat History
              </h3>
            </div>
            <div className="p-4 text-center bg-neutral-800/50 rounded-lg">
              <p className="text-sm text-neutral-400 mb-3">
                Sign in to save and access your chat history
              </p>
              <Link
                href="/auth/signin"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/50">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">AI</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-200 truncate">
                  STEM Assistant
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  Ready to help
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 