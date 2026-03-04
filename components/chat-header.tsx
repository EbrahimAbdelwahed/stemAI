'use client';

import { Plus, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Button } from './ui/button';
import { ModelSelector } from './model-selector';
import { Tooltip } from './ui/tooltip';

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isLoading: boolean;
}

export function ChatHeader({
  selectedModel,
  onModelChange,
  onNewChat,
  onToggleSidebar,
  isSidebarOpen,
  isLoading,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 flex items-center justify-between gap-2 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="flex items-center gap-2">
        <Tooltip content={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="size-8"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </Tooltip>
        <Tooltip content="New chat">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            disabled={isLoading}
            className="size-8"
          >
            <Plus className="size-4" />
          </Button>
        </Tooltip>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="hidden sm:inline font-medium">STEM AI</span>
      </div>
    </header>
  );
}
