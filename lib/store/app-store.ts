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
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setSelectedModel: (model: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  
  // Actions - Documents
  setDocuments: (documents: Document[]) => void;
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
  selectedModel: 'deepseek-chat',
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
        setConversations: (conversations) =>
          set({ conversations }, false, 'setConversations'),
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
        setDocuments: (documents) =>
          set({ documents }, false, 'setDocuments'),
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
            selectedModel: 'deepseek-chat',
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