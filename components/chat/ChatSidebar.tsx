'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from './ConversationItem';
import { v4 as uuidv4 } from 'uuid';

interface ChatSidebarProps {
  currentConversationId?: string;
  onClose?: () => void;
}

export function ChatSidebar({ currentConversationId, onClose }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const { 
    conversations, 
    createConversation, 
    updateConversation,
    deleteConversation,
    isLoading, 
    error 
  } = useConversations();

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = async () => {
    try {
      // Generate a new chat ID
      const newChatId = uuidv4();
      
      // Clear current chat data from localStorage
      if (currentConversationId) {
        localStorage.removeItem(`chat-messages-${currentConversationId}`);
      }
      
      // Set new chat ID in localStorage
      localStorage.setItem('currentChatId', newChatId);
      
      // Navigate to chat page with the new ID
      router.push(`/chat?id=${newChatId}`);
      
      // Force a page refresh to ensure clean state
      setTimeout(() => {
        window.location.href = '/chat';
      }, 100);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // Fallback: just navigate to chat page
      router.push('/chat');
    }
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
    <div className="w-[280px] bg-[#171717] border-r border-[#4d4d4d] flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[#4d4d4d]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">STEM AI</span>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#2f2f2f] transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-transparent border border-[#4d4d4d] hover:bg-[#2f2f2f] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova chat
        </button>
      </div>

      {/* Navigation */}
      <div className="p-3 border-b border-[#4d4d4d]">
        <nav className="space-y-1">
          <Link 
            href="/" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link 
            href="/chat" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </Link>
          <Link 
            href="/documents" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Libreria
          </Link>
          <Link 
            href="/generate" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Genera UI
          </Link>
        </nav>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8e8ea0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-[#4d4d4d] rounded-lg text-sm placeholder-[#8e8ea0] focus:outline-none focus:border-[#565869] transition-colors"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {error && (
          <div className="p-2 text-sm text-red-400 bg-red-900/20 rounded-lg mb-3">
            {error}
          </div>
        )}
        
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#2f2f2f] rounded-lg animate-pulse" />
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
            <p className="text-[#8e8ea0] text-sm">
              {searchTerm ? 'Nessuna chat trovata' : 'Nessuna conversazione'}
            </p>
          </div>
        )}
      </div>
      
      {/* User Profile Section */}
      <div className="border-t border-[#4d4d4d] p-3">
        {session?.user ? (
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm text-[#8e8ea0] hover:text-white" onClick={onClose}>
            <div className="w-6 h-6 rounded-full bg-[#2f2f2f] flex items-center justify-center">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{session.user.name || session.user.email}</div>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-sm text-[#8e8ea0]">
            <div className="w-6 h-6 rounded-full bg-[#2f2f2f] flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span>STEM AI Assistant</span>
          </div>
        )}
      </div>
    </div>
  );
} 