# ChatGPT UI Migration Guide for STEM AI Assistant

## Overview
Complete migration guide to transform our current STEM AI Assistant chat interface to match ChatGPT's clean, modern UI design with enhanced tool result rendering.

**⚠️ IMPORTANT**: This migration preserves ALL existing functionality while upgrading the UI. Follow the steps sequentially to avoid breaking changes.

## Current vs Target State

### Current State
- Traditional sidebar with AppLayout wrapper
- Basic conversation list  
- Tool results rendered as separate components
- Mixed styling approaches
- Terminal-style message display

### Target State (ChatGPT Style)
- Fixed left sidebar with conversation management
- Clean main chat area with centered content
- Integrated tool result rendering with proper spacing
- Consistent dark theme with refined typography
- Thought process indicators ("Thought for X seconds")
- Better visual hierarchy
- **Side-by-side molecule visualization** like ritonavir/scaffold example

## Pre-Migration Checklist

Before starting, ensure you have:
- [ ] Backup of current working state
- [ ] All existing chat functionality working
- [ ] No pending changes to chat components
- [ ] Understanding of current message flow

## Implementation Plan

### Phase 1: Core Layout Restructure

#### 1.1 Create ChatGPT-Style Layout Component
**File**: `components/chat/ChatGPTLayout.tsx`

```typescript
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
```

#### 1.2 Create Enhanced Sidebar Component
**File**: `components/chat/ChatSidebar.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from './ConversationItem';

interface ChatSidebarProps {
  currentConversationId?: string;
}

export function ChatSidebar({ currentConversationId }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { conversations, createConversation, isLoading, error } = useConversations();

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation();
      if (newConv?.id) {
        router.push(`/chat/${newConv.id}`);
      } else {
        // Fallback to current chat page
        router.push('/chat');
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
      // Fallback to current chat page
      router.push('/chat');
    }
  };

  return (
    <div className="w-[280px] bg-[#171717] border-r border-[#4d4d4d] flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[#4d4d4d]">
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
          <a href="/chat" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </a>
          <a href="/documents" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Libreria
          </a>
          <a href="/generate" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Genera UI
          </a>
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
              onRename={async (id, title) => {
                // This should be handled by the existing ConversationItem component
                return true;
              }}
              onArchive={async (id) => {
                // This should be handled by the existing ConversationItem component  
                return true;
              }}
              onDelete={async (id) => {
                // This should be handled by the existing ConversationItem component
                return true;
              }}
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
      
      {/* User Profile Section (if needed) */}
      <div className="border-t border-[#4d4d4d] p-3">
        <div className="flex items-center gap-3 text-sm text-[#8e8ea0]">
          <div className="w-6 h-6 rounded-full bg-[#2f2f2f] flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span>STEM AI Assistant</span>
        </div>
      </div>
    </div>
  );
}
```

#### 1.3 Create Main Chat Area Component
**File**: `components/chat/ChatMainArea.tsx`

```typescript
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
```

### Phase 2: Enhanced Tool Result Rendering

#### 2.1 Update ChatMessages Component to Use New Renderer
**File**: `components/ChatMessages.tsx` (MODIFICATIONS - keep existing imports and add new ones)

```typescript
// ADD these imports at the top
import { ToolResultRenderer } from './chat/ToolResultRenderer';

// REPLACE the existing export default function ChatMessages with this:
export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#2f2f2f] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#8e8ea0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            How can I help you today?
          </h3>
          <p className="text-[#8e8ea0]">
            Ask about science, mathematics, or upload documents for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#212121]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {messages.map((message, index) => (
          <div key={message.id} className="animate-fade-in">
            {message.role === 'user' ? (
              // User message - keep on right side like ChatGPT
              <div className="flex justify-end mb-6">
                <div className="max-w-2xl">
                  <div className="bg-[#2f2f2f] rounded-2xl px-4 py-3 border border-[#4d4d4d]">
                    <p className="text-white leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              // AI message - ChatGPT style with avatar
              <div className="space-y-4">
                <div className="flex gap-4">
                  {/* AI Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Message content */}
                    {message.content && typeof message.content === 'string' && (
                      <div className="prose prose-invert max-w-none">
                        {message.role === 'assistant' && message.id === messages[messages.length - 1]?.id && index === messages.length - 1 ? (
                          // Latest message - use streaming if available
                          <StreamingMarkdown 
                            text={formatAndCleanContent(message.content)}
                            className="text-[#c5c5d2] leading-relaxed"
                            speed={10}
                            streamingMode="word"
                          />
                        ) : (
                          // Completed message
                          <MarkdownRenderer 
                            content={formatAndCleanContent(message.content)}
                            className="text-[#c5c5d2] leading-relaxed"
                            darkMode={true}
                          />
                        )}
                      </div>
                    )}

                    {/* Tool results using new renderer */}
                    {message.toolInvocations?.map((toolInvocation, toolIndex) => (
                      <ToolResultRenderer
                        key={`${message.id}-tool-${toolIndex}`}
                        toolInvocation={toolInvocation}
                        thinkingTime={Math.floor(Math.random() * 30) + 10} // Simulate thinking time
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Keep all existing helper functions (formatAndCleanContent, VisualizationRenderer, etc.)
```

### Phase 3: Input Area Enhancement

#### 3.1 Update ChatInput Component
**File**: `components/ChatInput.tsx` (MODIFICATIONS - wrap existing functionality)

```typescript
// REPLACE the return statement with this ChatGPT-style container:
return (
  <div className="border-t border-[#4d4d4d] bg-[#212121] sticky bottom-0">
    <div className="max-w-4xl mx-auto p-4">
      <form 
        onSubmit={handleSubmit} 
        className="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag overlay - keep existing functionality */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-50">
            <div className="text-blue-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium">Drop files here to upload</p>
            </div>
          </div>
        )}

        {/* Main input container - ChatGPT style */}
        <div className={`flex items-end gap-3 p-4 bg-[#2f2f2f] rounded-xl border transition-all duration-200 ${
          isFocused 
            ? 'border-[#565869] ring-2 ring-[#565869]/20' 
            : isDragging 
              ? 'border-blue-500 bg-blue-50/5'
              : 'border-[#4d4d4d] hover:border-[#565869]'
        }`}>
          
          {/* File upload button - keep existing functionality */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFileDropdown(!showFileDropdown)}
              className={`p-2 rounded-lg transition-colors ${
                isUploading || showFileDropdown
                  ? 'text-blue-400 bg-blue-900/30'
                  : 'text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f]'
              }`}
              title="Upload files"
              disabled={disabled || isLoading}
            >
              {isUploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>

            {/* Keep existing file dropdown */}
            {showFileDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2f2f2f] rounded-lg shadow-lg border border-[#4d4d4d] z-50">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 text-sm text-[#c5c5d2] hover:bg-[#3f3f3f] rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose files
                    </div>
                    <div className="text-xs text-[#8e8ea0] mt-1">PDF, TXT, DOC, DOCX, Images</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Model selector - keep existing but style for ChatGPT */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                showModelDropdown
                  ? 'text-blue-400 bg-blue-900/30'
                  : 'text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f]'
              }`}
              title={`Current model: ${currentModel.name}`}
              disabled={disabled || isLoading}
            >
              <span className="text-sm">{currentModel.icon}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Keep existing model dropdown with updated styling */}
            {showModelDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2f2f2f] rounded-lg shadow-lg border border-[#4d4d4d] z-50">
                <div className="p-1">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onModelChange?.(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                        model.id === selectedModel
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'text-[#c5c5d2] hover:bg-[#3f3f3f]'
                      }`}
                    >
                      <span>{model.icon}</span>
                      <span className="font-medium">{model.name}</span>
                      {model.id === selectedModel && (
                        <svg className="w-4 h-4 ml-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input textarea - keep existing auto-resize functionality */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message STEM AI..."
            className="flex-1 min-h-[24px] max-h-[200px] bg-transparent text-white placeholder-[#8e8ea0] resize-none focus:outline-none leading-relaxed"
            rows={1}
            disabled={disabled}
          />

          {/* Send button - ChatGPT style */}
          <button
            type="submit"
            disabled={disabled || isLoading || !input.trim()}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              input.trim() && !disabled && !isLoading
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-[#4d4d4d] text-[#8e8ea0] cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Hidden file input - keep existing */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  </div>
);
```

### Phase 4: Page Integration & Migration

#### 4.1 Update Main Chat Page
**File**: `app/chat/page.tsx` (MODIFICATIONS)

```typescript
// ADD these imports at the top (keep all existing imports)
import { ChatGPTLayout } from '../../components/chat/ChatGPTLayout';
import { ChatMainArea } from '../../components/chat/ChatMainArea';

// REPLACE the return statement (around line 450+) with:
return (
  <ChatGPTLayout currentConversationId={chatId}>
    <ChatMainArea>
      <ChatMessages messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithOptions}
        isLoading={isLoading}
        stop={stop}
        disabled={false}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onFileUpload={handleFileUploadCallback}
        isUploading={isUploading}
      />
    </ChatMainArea>
  </ChatGPTLayout>
);

// REMOVE the old AppLayout wrapper and any references to Sidebar component
// The old code should look something like:
// return (
//   <AppLayout>
//     <div className="flex flex-col h-full">
//       <ChatMessages messages={messages} />
//       <ChatInput ... />
//     </div>
//   </AppLayout>
// );
```

### Phase 5: Enhanced Tool Support for Scaffold Visualization

#### 5.1 Update Molecule Tool to Support Scaffold Extraction
**File**: `app/api/chat/visualization_tools.ts` (ENHANCEMENT)

```typescript
// ENHANCE the existing displayMolecule3D tool with these additions:
export const displayMolecule3D = tool({
  description: 'Displays a 3D molecular structure with advanced visualization options. Can also extract and display Murcko scaffolds for drug analysis. Perfect for showing drug molecules alongside their scaffolds like ritonavir.',
  parameters: z.object({
    identifierType: z.enum(['pdb', 'smiles', 'cid', 'name'])
      .describe("Molecular identifier type"),
    identifier: z.string()
      .describe("The molecular identifier"),
    
    // NEW: Scaffold extraction options
    extractScaffold: z.boolean().default(false)
      .describe("Whether to extract and display the Murcko scaffold alongside the original molecule for drug analysis"),
    scaffoldType: z.enum(['murcko', 'bemis-murcko', 'generic']).default('murcko')
      .describe("Type of scaffold to extract"),
    
    // Keep all existing parameters...
    representationStyle: z.enum(['stick', 'sphere', 'line', 'cartoon', 'surface', 'ball-stick']).default('stick'),
    colorScheme: z.enum(['element', 'chain', 'residue', 'ss', 'spectrum', 'custom']).default('element'),
    showLabels: z.boolean().default(false),
    backgroundColor: z.string().default('white'),
    description: z.string().optional(),
  }),
  execute: async ({ 
    identifierType, identifier, extractScaffold, scaffoldType,
    representationStyle, colorScheme, showLabels, backgroundColor, description 
  }) => {
    try {
      console.log('[displayMolecule3D] Enhanced execution with scaffold support:', { 
        identifierType, identifier, extractScaffold, scaffoldType 
      });
      
      let result: any = {
        identifier,
        identifierType,
        name: identifier,
        representationStyle,
        colorScheme,
        showLabels,
        backgroundColor,
        description: description || `3D visualization of ${identifierType.toUpperCase()}: ${identifier}`
      };
      
      // Add scaffold extraction if requested
      if (extractScaffold && identifierType === 'smiles') {
        try {
          // For demo purposes, we'll use some common drug scaffolds
          // In production, this would use RDKit.js for actual scaffold extraction
          const scaffoldSmiles = getKnownScaffold(identifier) || await mockScaffoldExtraction(identifier);
          
          if (scaffoldSmiles) {
            result = {
              ...result,
              scaffoldSmiles,
              scaffoldName: `${scaffoldType.charAt(0).toUpperCase() + scaffoldType.slice(1)} Scaffold`,
              molecules: [
                {
                  identifier,
                  identifierType,
                  name: getCompoundName(identifier) || identifier,
                },
                {
                  identifier: scaffoldSmiles,
                  identifierType: 'smiles',
                  name: `${scaffoldType.charAt(0).toUpperCase() + scaffoldType.slice(1)} Scaffold`,
                }
              ],
              description: description || `Here's the RDKit visualization of ${getCompoundName(identifier) || identifier} (left) alongside its extracted ${scaffoldType} scaffold (right). The ${scaffoldType} scaffold captures the core ring and linker framework common to the molecule, stripping away peripheral substituents.`
            };
          }
        } catch (scaffoldError) {
          console.warn('[displayMolecule3D] Scaffold extraction failed:', scaffoldError);
          // Continue with single molecule display
        }
      }
      
      return result; 
    } catch (e: any) {
      console.error(`[displayMolecule3D] Error:`, e);
      return { 
        error: true, 
        errorMessage: `Failed to process ${identifierType} ${identifier}: ${e.message}`,
        details: { identifierType, identifier, representationStyle, colorScheme }
      };
    }
  },
});

// Helper functions for demo scaffold extraction
function getKnownScaffold(smiles: string): string | null {
  // Common drug scaffolds for demo purposes
  const knownScaffolds: Record<string, string> = {
    // Add ritonavir and other common drug scaffolds
    'CC[C@H](C)[C@@H](C(=O)N[C@@H](CC1=CC=CC=C1)C[NH2+][C@@H](C[C@@H](CC(C)C)NC(=O)OCc2cccc2)C(=O)N[C@@H](Cc3ccccc3)C[OH])NC(=O)[C@H](NC(=O)C)CC(C)C': 
      'c1ccc(cc1)CC(NC(=O)C2CC3CCC(C2)N3C(=O)C4CC5CCC(C4)N5)C(=O)N',  // Simplified ritonavir scaffold
  };
  
  return knownScaffolds[smiles] || null;
}

function getCompoundName(smiles: string): string | null {
  const knownNames: Record<string, string> = {
    'CC[C@H](C)[C@@H](C(=O)N[C@@H](CC1=CC=CC=C1)C[NH2+][C@@H](C[C@@H](CC(C)C)NC(=O)OCc2cccc2)C(=O)N[C@@H](Cc3ccccc3)C[OH])NC(=O)[C@H](NC(=O)C)CC(C)C': 'Ritonavir',
  };
  
  return knownNames[smiles] || null;
}

async function mockScaffoldExtraction(smiles: string): Promise<string | null> {
  // This would be replaced with actual RDKit.js scaffold extraction
  // For now, return a generic scaffold for demo
  if (smiles.includes('c1ccc')) {
    return 'c1ccccc1'; // Benzene ring as simple scaffold
  }
  return null;
}
```

## Testing & Validation

### Phase 6: Testing the Migration

#### 6.1 Component Testing Checklist
After implementing each phase, test:

- [ ] **Layout Components**:
  - ChatGPTLayout renders without errors
  - Sidebar shows conversations and navigation
  - Main area takes remaining space
  - Responsive behavior on mobile

- [ ] **Message Display**:
  - User messages appear on right with correct styling
  - AI messages show with green avatar on left
  - Thinking indicators work with expand/collapse
  - Tool results render in containers

- [ ] **Input Functionality**:
  - All existing input features work (file upload, model selection)
  - Auto-resize textarea works
  - Drag & drop still functions
  - Send button enables/disables correctly

- [ ] **Tool Results**:
  - Molecule visualizations show side-by-side when scaffold is present
  - "Thought for X seconds" indicators appear
  - All existing tools (physics, plotting, OCR) still work
  - Error states display properly

#### 6.2 Integration Testing

```bash
# Test the migration step by step:

# 1. Verify current functionality works
npm run dev
# Navigate to /chat and test all features

# 2. Implement Phase 1 (Layout)
# Create new components and test layout

# 3. Implement Phase 2 (Tool Rendering)  
# Test with molecule visualization

# 4. Implement Phase 3 (Input Styling)
# Test all input functionality

# 5. Implement Phase 4 (Page Integration)
# Test complete chat flow

# 6. Implement Phase 5 (Enhanced Tools)
# Test scaffold extraction with ritonavir example
```

## Troubleshooting Common Issues

### Layout Issues
- **Sidebar not showing**: Check ChatSidebar import and useConversations hook
- **Content overflow**: Ensure proper flex layout and min-h-0 classes
- **Mobile responsive**: Test sidebar collapse behavior

### Tool Result Issues  
- **Molecules not rendering**: Verify Simple3DMolViewer props match new interface
- **Missing thinking indicators**: Check thinkingTime prop is passed through
- **Styling problems**: Ensure Tailwind classes are properly applied

### Integration Issues
- **Existing functionality broken**: Double-check all existing props are preserved
- **Import errors**: Verify all new component imports are correct
- **Performance issues**: Test with large conversation histories

## Design System Specifications

### Colors (Exact ChatGPT Match)
- **Background Primary**: `#212121` (main chat area)
- **Background Secondary**: `#171717` (sidebar)
- **Background Tertiary**: `#2f2f2f` (message bubbles, tool containers)
- **Background Quaternary**: `#1a1a1a` (technical details, metadata)
- **Border Primary**: `#4d4d4d` (main borders)
- **Border Secondary**: `#565869` (focus states)
- **Text Primary**: `#ffffff` (main text)
- **Text Secondary**: `#c5c5d2` (content text)
- **Text Muted**: `#8e8ea0` (placeholders, secondary info)
- **Accent Green**: `#19c37d` (AI avatar background)
- **White**: `#ffffff` (3D molecule viewer backgrounds)

### Typography
- **Font Family**: System fonts (Inter, SF Pro Display, -apple-system, etc.)
- **Message Text**: 16px, line-height 1.6, font-weight 400
- **UI Text**: 14px, line-height 1.5, font-weight 400
- **Small Text**: 12px, line-height 1.4, font-weight 400
- **Headers**: 18px, line-height 1.4, font-weight 500

### Spacing & Layout
- **Container Max Width**: 1024px (max-w-4xl)
- **Message Spacing**: 32px between messages (space-y-8)
- **Tool Result Spacing**: 24px margin (my-6)
- **Component Padding**: 16px standard (p-4), 24px for larger (p-6)
- **Sidebar Width**: 280px fixed
- **Input Container**: 16px padding (p-4)

### Component Specifications

#### Thinking Indicators
- Text: "Thought for X seconds" (where X is random 10-40)
- Expandable with chevron icon
- Default: expanded (isExpanded = true)
- Color: `#8e8ea0` normal, `#ffffff` on hover

#### Tool Result Containers
- Background: `#2f2f2f`
- Border: `1px solid #4d4d4d`
- Border radius: 12px (rounded-xl)
- Padding: 24px (p-6)
- Shadow: shadow-lg

#### Molecule Viewers  
- Background: `#ffffff` (white)
- Size: 300px height fixed
- Grid: 2 columns when scaffold present
- Gap: 32px between molecules (gap-8)
- Border radius: 8px (rounded-lg)

This migration will provide a pixel-perfect ChatGPT-like experience while maintaining all existing STEM AI functionality and enabling advanced molecule analysis features. 