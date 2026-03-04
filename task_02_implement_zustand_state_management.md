# Task 02: Implement Zustand State Management

## Priority: P0 (Critical - Fix Immediately)

## Overview
The current codebase has no centralized state management strategy, with 15+ separate `useState<...[]>([])` declarations scattered across components. This creates prop drilling, unnecessary re-renders, and maintenance complexity. Implement Zustand for clean, centralized state management.

## Root Cause Analysis
- State scattered throughout component tree with no coherent management strategy
- Prop drilling evident in components like `ChatInput.tsx`, `ConversationView.tsx`
- Multiple components maintaining duplicate state (conversations, documents, models)
- No single source of truth for application state

## Implementation Steps

### Step 1: Install Zustand
```bash
npm install zustand
npm install --save-dev @types/zustand
```

### Step 2: Create Main Application Store
Create `lib/store/app-store.ts`:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface Conversation {
  id: string;
  title: string;
  model: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AppState {
  // Chat state
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  selectedModel: string;
  isStreaming: boolean;
  
  // Document state
  documents: Document[];
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentPage: string;
  
  // Actions - Chat
  setCurrentConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setSelectedModel: (model: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  
  // Actions - Documents
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setUploadProgress: (fileId: string, progress: number) => void;
  clearUploadProgress: (fileId: string) => void;
  setIsUploading: (uploading: boolean) => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPage: (page: string) => void;
  
  // Actions - Bulk operations
  clearAll: () => void;
  resetToDefaults: () => void;
}

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  selectedModel: 'grok-3-mini',
  isStreaming: false,
  documents: [],
  uploadProgress: {},
  isUploading: false,
  sidebarOpen: true,
  theme: 'dark' as const,
  currentPage: '/',
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Chat Actions
        setCurrentConversation: (id) => 
          set({ currentConversation: id }, false, 'setCurrentConversation'),
        
        addConversation: (conversation) =>
          set(
            (state) => ({ 
              conversations: [conversation, ...state.conversations],
              currentConversation: conversation.id 
            }),
            false,
            'addConversation'
          ),
          
        updateConversation: (id, updates) =>
          set(
            (state) => ({
              conversations: state.conversations.map(conv =>
                conv.id === id ? { ...conv, ...updates } : conv
              )
            }),
            false,
            'updateConversation'
          ),
          
        deleteConversation: (id) =>
          set(
            (state) => {
              const newMessages = { ...state.messages };
              delete newMessages[id];
              
              return {
                conversations: state.conversations.filter(conv => conv.id !== id),
                messages: newMessages,
                currentConversation: state.currentConversation === id ? null : state.currentConversation
              };
            },
            false,
            'deleteConversation'
          ),
          
        addMessage: (conversationId, message) =>
          set(
            (state) => ({
              messages: {
                ...state.messages,
                [conversationId]: [...(state.messages[conversationId] || []), message]
              }
            }),
            false,
            'addMessage'
          ),
          
        setMessages: (conversationId, messages) =>
          set(
            (state) => ({
              messages: {
                ...state.messages,
                [conversationId]: messages
              }
            }),
            false,
            'setMessages'
          ),
          
        setSelectedModel: (model) =>
          set({ selectedModel: model }, false, 'setSelectedModel'),
          
        setIsStreaming: (streaming) =>
          set({ isStreaming: streaming }, false, 'setIsStreaming'),
        
        // Document Actions
        addDocument: (document) =>
          set(
            (state) => ({ 
              documents: [document, ...state.documents] 
            }),
            false,
            'addDocument'
          ),
          
        updateDocument: (id, updates) =>
          set(
            (state) => ({
              documents: state.documents.map(doc =>
                doc.id === id ? { ...doc, ...updates } : doc
              )
            }),
            false,
            'updateDocument'
          ),
          
        deleteDocument: (id) =>
          set(
            (state) => ({
              documents: state.documents.filter(doc => doc.id !== id)
            }),
            false,
            'deleteDocument'
          ),
          
        setUploadProgress: (fileId, progress) =>
          set(
            (state) => ({
              uploadProgress: { ...state.uploadProgress, [fileId]: progress }
            }),
            false,
            'setUploadProgress'
          ),
          
        clearUploadProgress: (fileId) =>
          set(
            (state) => {
              const newProgress = { ...state.uploadProgress };
              delete newProgress[fileId];
              return { uploadProgress: newProgress };
            },
            false,
            'clearUploadProgress'
          ),
          
        setIsUploading: (uploading) =>
          set({ isUploading: uploading }, false, 'setIsUploading'),
        
        // UI Actions
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
          
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),
          
        setTheme: (theme) =>
          set({ theme }, false, 'setTheme'),
          
        setCurrentPage: (page) =>
          set({ currentPage: page }, false, 'setCurrentPage'),
        
        // Bulk Actions
        clearAll: () =>
          set(initialState, false, 'clearAll'),
          
        resetToDefaults: () =>
          set({
            selectedModel: 'grok-3-mini',
            sidebarOpen: true,
            theme: 'dark',
            currentConversation: null
          }, false, 'resetToDefaults'),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          // Only persist these fields
          selectedModel: state.selectedModel,
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
          // Don't persist conversations/messages - load from API instead
        }),
      }
    ),
    { name: 'app-store' }
  )
);

// Selectors for common use cases
export const useCurrentConversation = () => {
  const conversations = useAppStore(state => state.conversations);
  const currentId = useAppStore(state => state.currentConversation);
  return conversations.find(conv => conv.id === currentId) || null;
};

export const useCurrentMessages = () => {
  const messages = useAppStore(state => state.messages);
  const currentId = useAppStore(state => state.currentConversation);
  return currentId ? messages[currentId] || [] : [];
};

export const useConversationCount = () => {
  return useAppStore(state => state.conversations.length);
};

export const useDocumentCount = () => {
  return useAppStore(state => state.documents.length);
};
```

### Step 3: Create Hooks for Specific Use Cases
Create `lib/store/hooks.ts`:

```typescript
import { useAppStore } from './app-store';
import { useCallback } from 'react';

// Chat hooks
export const useChatActions = () => {
  return useAppStore(useCallback((state) => ({
    addConversation: state.addConversation,
    updateConversation: state.updateConversation,
    deleteConversation: state.deleteConversation,
    setCurrentConversation: state.setCurrentConversation,
    addMessage: state.addMessage,
    setMessages: state.setMessages,
    setIsStreaming: state.setIsStreaming,
  }), []));
};

export const useChatState = () => {
  return useAppStore(useCallback((state) => ({
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    selectedModel: state.selectedModel,
    isStreaming: state.isStreaming,
  }), []));
};

// Document hooks
export const useDocumentActions = () => {
  return useAppStore(useCallback((state) => ({
    addDocument: state.addDocument,
    updateDocument: state.updateDocument,
    deleteDocument: state.deleteDocument,
    setUploadProgress: state.setUploadProgress,
    clearUploadProgress: state.clearUploadProgress,
    setIsUploading: state.setIsUploading,
  }), []));
};

export const useDocumentState = () => {
  return useAppStore(useCallback((state) => ({
    documents: state.documents,
    uploadProgress: state.uploadProgress,
    isUploading: state.isUploading,
  }), []));
};

// UI hooks
export const useUIActions = () => {
  return useAppStore(useCallback((state) => ({
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    setCurrentPage: state.setCurrentPage,
  }), []));
};

export const useUIState = () => {
  return useAppStore(useCallback((state) => ({
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    currentPage: state.currentPage,
  }), []));
};
```

### Step 4: Update ChatInput Component
Update `components/ChatInput.tsx`:

```typescript
import React, { FormEvent, useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop?: () => void;
  disabled?: boolean;
  onFileUpload?: (files: File[]) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  disabled = false,
  onFileUpload,
}: ChatInputProps) {
  // Use Zustand store instead of props
  const selectedModel = useAppStore(state => state.selectedModel);
  const setSelectedModel = useAppStore(state => state.setSelectedModel);
  const isUploading = useAppStore(state => state.isUploading);
  
  // Rest of component logic remains the same
  // Remove selectedModel and onModelChange from props
  // Use store values directly
  
  return (
    // Component JSX using store values
    <div>
      {/* Implementation using selectedModel and setSelectedModel from store */}
    </div>
  );
}
```

### Step 5: Update ConversationView Component
Update `components/ConversationView.tsx`:

```typescript
import React from 'react';
import { useCurrentConversation, useCurrentMessages, useChatActions } from '@/lib/store/hooks';

export default function ConversationView() {
  const conversation = useCurrentConversation();
  const messages = useCurrentMessages();
  const { setCurrentConversation, deleteConversation } = useChatActions();
  
  // Component logic using store data
  // Remove prop drilling for conversation data
  
  return (
    <div>
      {/* Component JSX using store data */}
    </div>
  );
}
```

### Step 6: Update App Layout and Pages
Update pages to use store instead of local state:

```typescript
// app/chat/page.tsx
'use client';

import { useAppStore } from '@/lib/store/app-store';
import { useChatState, useChatActions } from '@/lib/store/hooks';

export default function ChatPage() {
  const { conversations, currentConversation } = useChatState();
  const { setCurrentConversation } = useChatActions();
  
  // Remove local useState calls
  // Use store state and actions
  
  return (
    // Component JSX
  );
}
```

## Verification Steps

### 1. Test State Persistence
- Change model selection, refresh page
- Verify model selection persists
- Test sidebar state persistence
- Confirm theme persistence

### 2. Test State Synchronization
- Open multiple browser tabs
- Change state in one tab
- Verify state updates across tabs (for non-persisted state)

### 3. Test Performance
- Use React DevTools Profiler
- Verify reduced re-renders
- Check for prop drilling elimination

## Expected Outcomes

### Immediate Benefits
- ✅ Elimination of prop drilling
- ✅ Centralized state management
- ✅ Reduced component re-renders
- ✅ Cleaner component interfaces

### Long-term Benefits
- 🚀 Easier state debugging with Redux DevTools
- 📈 Better performance through selective subscriptions
- 🔧 Simplified component testing
- 📊 State persistence for better UX

## Migration Checklist

### Components to Update
- [ ] `components/ChatInput.tsx` - Remove model prop drilling
- [ ] `components/ConversationView.tsx` - Use store for conversation data
- [ ] `components/FileUploader.tsx` - Use store for upload progress
- [ ] `app/profile/page.tsx` - Remove local conversation/document state
- [ ] `app/chat/page.tsx` - Use store for chat state

### State to Migrate
- [ ] Model selection (`selectedModel`)
- [ ] Conversation list (`conversations`)
- [ ] Current conversation (`currentConversation`)
- [ ] Document list (`documents`)
- [ ] Upload progress (`uploadProgress`)
- [ ] UI state (sidebar, theme)

## Success Criteria
- [ ] No more scattered useState for shared state
- [ ] Prop drilling eliminated for global state
- [ ] State persists across page refreshes where appropriate
- [ ] Components re-render only when necessary
- [ ] Redux DevTools shows clean state updates

---

**Priority**: Critical - This should be done immediately after Task 01
**Estimated Time**: 4-6 hours
**Dependencies**: Task 01 (Remove broken performance system)
**Next Task**: Task 03 - Remove Over-engineered Component Patterns
