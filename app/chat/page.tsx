'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat, Message as VercelMessage } from '@ai-sdk/react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { track } from '@vercel/analytics';
import { ChatHeader } from '../../components/chat-header';
import { ChatMessages } from '../../components/chat-messages';
import { ChatInput } from '../../components/chat-input';
import { ChatSidebar } from '../../components/chat-sidebar';
import { WelcomeScreen } from '../../components/welcome-screen';

type Message = VercelMessage;

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: number;
}

const STORAGE_PREFIX = 'stem-ai-';
const SESSIONS_KEY = `${STORAGE_PREFIX}sessions`;
const ACTIVE_SESSION_KEY = `${STORAGE_PREFIX}active-session`;
const MESSAGES_PREFIX = `${STORAGE_PREFIX}messages-`;

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export default function ChatPage() {
  const [chatId, setChatId] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    stop,
    error: chatError,
    setMessages,
    append,
    setInput,
  } = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
    id: chatId,
    onFinish: (message) => {
      track('ChatResponded', { model: selectedModel, messageId: message.id });
    },
    onError: (err) => {
      console.error('[ChatPage] Chat error:', err);
      toast.error(`Chat error: ${err.message}`);
    },
  });

  // Initialize: load sessions and active chat
  useEffect(() => {
    const storedSessions = loadSessions();
    setSessions(storedSessions);

    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (activeId) {
      setChatId(activeId);
      const storedMessages = localStorage.getItem(`${MESSAGES_PREFIX}${activeId}`);
      if (storedMessages) {
        try {
          const parsed: Message[] = JSON.parse(storedMessages);
          const valid = parsed.map((msg) => ({
            ...msg,
            parts:
              msg.parts && msg.parts.length > 0
                ? msg.parts
                : msg.content
                  ? [{ type: 'text' as const, text: msg.content as string }]
                  : [],
          }));
          setMessages(valid);
        } catch {
          localStorage.removeItem(`${MESSAGES_PREFIX}${activeId}`);
          setMessages([]);
        }
      }
    } else {
      const newId = uuidv4();
      setChatId(newId);
      localStorage.setItem(ACTIVE_SESSION_KEY, newId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (!chatId || messages.length === 0) return;
    try {
      localStorage.setItem(`${MESSAGES_PREFIX}${chatId}`, JSON.stringify(messages));

      // Update session title from first user message
      const firstUserMsg = messages.find((m) => m.role === 'user');
      if (firstUserMsg) {
        const title = (firstUserMsg.content || '').slice(0, 50) || 'New conversation';
        setSessions((prev) => {
          const exists = prev.find((s) => s.id === chatId);
          let updated: ChatSession[];
          if (exists) {
            updated = prev.map((s) =>
              s.id === chatId ? { ...s, title, timestamp: Date.now() } : s
            );
          } else {
            updated = [{ id: chatId, title, timestamp: Date.now() }, ...prev];
          }
          saveSessions(updated);
          return updated;
        });
      }
    } catch {
      toast.error('Could not save chat history.');
    }
  }, [chatId, messages]);

  const handleNewChat = useCallback(() => {
    const newId = uuidv4();
    setChatId(newId);
    localStorage.setItem(ACTIVE_SESSION_KEY, newId);
    setMessages([]);
    toast.info('New conversation started.');
    track('ChatCleared');
  }, [setMessages]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setChatId(id);
      localStorage.setItem(ACTIVE_SESSION_KEY, id);
      const stored = localStorage.getItem(`${MESSAGES_PREFIX}${id}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    },
    [setMessages]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      localStorage.removeItem(`${MESSAGES_PREFIX}${id}`);
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveSessions(updated);
        return updated;
      });
      if (id === chatId) {
        handleNewChat();
      }
    },
    [chatId, handleNewChat]
  );

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (!files?.length) return;
      setIsUploading(true);

      const processFiles = async () => {
        for (const file of files) {
          const isImage = file.type.startsWith('image/');
          const endpoint = isImage ? '/api/ocr' : '/api/documents';

          try {
            toast.info(`Processing ${file.name}...`);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(endpoint, { method: 'POST', body: formData });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || `Failed to process: ${response.statusText}`);
            }

            const result = await response.json();

            if (isImage) {
              const ocrMessage = `**OCR Results from "${file.name}":**\n\n${result.extractedText}${result.hasFormulas ? '\n\n*Mathematical formulas detected and formatted in LaTeX*' : ''}`;
              append({
                id: uuidv4(),
                role: 'assistant',
                content: ocrMessage,
                parts: [{ type: 'text', text: ocrMessage }],
              });
              toast.success(`OCR completed for ${file.name}`);
            } else {
              toast.success(`${file.name} uploaded successfully!`);
              append({
                id: uuidv4(),
                role: 'user',
                content: `I have uploaded the document "${file.name}". Please summarize its key points. (Context: Document just uploaded, ID: ${result.documentId})`,
                parts: [
                  {
                    type: 'text',
                    text: `I have uploaded the document "${file.name}". Please summarize its key points.`,
                  },
                ],
              });
            }
          } catch (error: any) {
            console.error(`File processing error for ${file.name}:`, error);
            toast.error(`Processing failed for ${file.name}: ${error.message}`);
          }
        }
      };

      processFiles().finally(() => setIsUploading(false));
    },
    [append]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    track('ChatSubmitted', { model: selectedModel, inputLength: input.length });
    originalHandleSubmit(e);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-dvh bg-background">
      <ChatSidebar
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSessionId={chatId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <ChatHeader
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isLoading={isLoading}
        />

        {chatError && (
          <div className="mx-auto max-w-3xl w-full px-4 pt-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Error:</strong> {chatError.message}
            </div>
          </div>
        )}

        {showWelcome ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}

        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          disabled={isUploading}
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
} 