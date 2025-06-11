import { useAppStore } from './app-store';

/* -------------------------------------------------------------------------- */
/*  Helpers – stable selectors                                                 */
/* -------------------------------------------------------------------------- */

// --- Chat ------------------------------------------------------------------
const chatActionsSelector = (state: any) => ({
  setConversations: state.setConversations,
  addConversation: state.addConversation,
  updateConversation: state.updateConversation,
  deleteConversation: state.deleteConversation,
  setCurrentConversation: state.setCurrentConversation,
  addMessage: state.addMessage,
  setMessages: state.setMessages,
  setSelectedModel: state.setSelectedModel,
  setIsStreaming: state.setIsStreaming,
});

const chatStateSelector = (state: any) => ({
  conversations: state.conversations,
  currentConversation: state.currentConversation,
  selectedModel: state.selectedModel,
  isStreaming: state.isStreaming,
});

export const useChatActions = () => useAppStore(chatActionsSelector);
export const useChatState = () => useAppStore(chatStateSelector);

// --- Documents -------------------------------------------------------------
const docActionsSelector = (state: any) => ({
  setDocuments: state.setDocuments,
  addDocument: state.addDocument,
  updateDocument: state.updateDocument,
  deleteDocument: state.deleteDocument,
  setUploadProgress: state.setUploadProgress,
  clearUploadProgress: state.clearUploadProgress,
  setIsUploading: state.setIsUploading,
});

const docStateSelector = (state: any) => ({
  documents: state.documents,
  uploadProgress: state.uploadProgress,
  isUploading: state.isUploading,
});

export const useDocumentActions = () => useAppStore(docActionsSelector);
export const useDocumentState = () => useAppStore(docStateSelector);

// --- UI --------------------------------------------------------------------
const uiActionsSelector = (state: any) => ({
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setTheme: state.setTheme,
  setCurrentPage: state.setCurrentPage,
});

const uiStateSelector = (state: any) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  currentPage: state.currentPage,
});

export const useUIActions = () => useAppStore(uiActionsSelector);
export const useUIState = () => useAppStore(uiStateSelector);

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