import { useAppStore } from './app-store';

// Chat hooks
export const useChatActions = () => {
  return useAppStore((state) => ({
    setConversations: state.setConversations,
    addConversation: state.addConversation,
    updateConversation: state.updateConversation,
    deleteConversation: state.deleteConversation,
    setCurrentConversation: state.setCurrentConversation,
    addMessage: state.addMessage,
    setMessages: state.setMessages,
    setSelectedModel: state.setSelectedModel,
    setIsStreaming: state.setIsStreaming,
  }));
};

export const useChatState = () => {
  return useAppStore((state) => ({
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    selectedModel: state.selectedModel,
    isStreaming: state.isStreaming,
  }));
};

// Document hooks
export const useDocumentActions = () => {
  return useAppStore((state) => ({
    setDocuments: state.setDocuments,
    addDocument: state.addDocument,
    updateDocument: state.updateDocument,
    deleteDocument: state.deleteDocument,
    setUploadProgress: state.setUploadProgress,
    clearUploadProgress: state.clearUploadProgress,
    setIsUploading: state.setIsUploading,
  }));
};

export const useDocumentState = () => {
  return useAppStore((state) => ({
    documents: state.documents,
    uploadProgress: state.uploadProgress,
    isUploading: state.isUploading,
  }));
};

// UI hooks
export const useUIActions = () => {
  return useAppStore((state) => ({
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    setCurrentPage: state.setCurrentPage,
  }));
};

export const useUIState = () => {
  return useAppStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    currentPage: state.currentPage,
  }));
};

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