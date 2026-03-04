'use client';

import React from 'react';
import { MessageSquare, Trash2, Atom } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export function ChatSidebar({
  isOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Sidebar header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Atom className="size-5 text-primary" />
        <span className="font-semibold text-sm">STEM AI</span>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                  session.id === currentSessionId
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-sidebar-foreground'
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">
                  {session.title || 'New conversation'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
