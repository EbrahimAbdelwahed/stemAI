import { createConversation, saveMessage, generateConversationTitle } from '@/lib/db/conversations'
import type { Message } from 'ai'

export const LOCAL_STORAGE_MESSAGES_KEY_PREFIX = 'chat-messages-'
export const LOCAL_STORAGE_CHAT_ID_KEY = 'current-chat-id'

export interface LocalStorageChat {
  id: string
  messages: Message[]
  model?: string
  timestamp?: number
}

// Get all chats from localStorage
export function getAllLocalStorageChats(): LocalStorageChat[] {
  if (typeof window === 'undefined') return []

  const chats: LocalStorageChat[] = []
  
  try {
    // Get all localStorage keys that match our chat pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(LOCAL_STORAGE_MESSAGES_KEY_PREFIX)) {
        const chatId = key.replace(LOCAL_STORAGE_MESSAGES_KEY_PREFIX, '')
        const messagesJson = localStorage.getItem(key)
        
        if (messagesJson) {
          try {
            const messages = JSON.parse(messagesJson) as Message[]
            if (Array.isArray(messages) && messages.length > 0) {
              chats.push({
                id: chatId,
                messages,
                model: 'gpt-4o', // Default model for migrated chats
                timestamp: Date.now()
              })
            }
          } catch (parseError) {
            console.warn(`Failed to parse messages for chat ${chatId}:`, parseError)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading localStorage chats:', error)
  }

  return chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
}

// Get current chat ID from localStorage
export function getCurrentChatId(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(LOCAL_STORAGE_CHAT_ID_KEY)
  } catch (error) {
    console.error('Error reading current chat ID:', error)
    return null
  }
}

// Clear all localStorage chat data
export function clearLocalStorageChats(): void {
  if (typeof window === 'undefined') return

  try {
    const keysToRemove: string[] = []
    
    // Collect keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith(LOCAL_STORAGE_MESSAGES_KEY_PREFIX) ||
        key === LOCAL_STORAGE_CHAT_ID_KEY
      )) {
        keysToRemove.push(key)
      }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log(`Cleared ${keysToRemove.length} localStorage chat items`)
  } catch (error) {
    console.error('Error clearing localStorage chats:', error)
  }
}

// Migrate all localStorage chats to database for a user
export async function migrateLocalStorageChats(userId: string): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  const localChats = getAllLocalStorageChats()
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  if (localChats.length === 0) {
    console.log('No localStorage chats found to migrate')
    return results
  }

  console.log(`Starting migration of ${localChats.length} chats for user ${userId}`)

  for (const chat of localChats) {
    try {
      // Create conversation in database
      const conversation = await createConversation({
        userId,
        title: generateConversationTitle(chat.messages),
        model: chat.model || 'gpt-4o'
      })

      // Save all messages for this conversation
      for (const message of chat.messages) {
        await saveMessage({
          conversationId: conversation.id,
          role: message.role,
          content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
          parts: Array.isArray(message.content) ? message.content : undefined,
          metadata: { 
            migratedFromLocalStorage: true,
            originalChatId: chat.id,
            originalTimestamp: chat.timestamp
          }
        })
      }

      results.success++
      console.log(`Successfully migrated chat ${chat.id} (${chat.messages.length} messages)`)
      
    } catch (error) {
      results.failed++
      const errorMessage = `Failed to migrate chat ${chat.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMessage)
      console.error(errorMessage, error)
    }
  }

  // If migration was successful, clear localStorage
  if (results.success > 0 && results.failed === 0) {
    clearLocalStorageChats()
    console.log('Migration completed successfully, localStorage cleared')
  } else if (results.success > 0) {
    console.warn(`Migration partially successful (${results.success}/${localChats.length}), keeping localStorage data`)
  }

  return results
}

// Check if user has localStorage chats that need migration
export function hasLocalStorageChats(): boolean {
  return getAllLocalStorageChats().length > 0
}

// Get summary of localStorage chats for display
export function getLocalStorageChatsSummary(): {
  totalChats: number
  totalMessages: number
  oldestChat?: Date
  newestChat?: Date
} {
  const chats = getAllLocalStorageChats()
  
  if (chats.length === 0) {
    return {
      totalChats: 0,
      totalMessages: 0
    }
  }

  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0)
  const timestamps = chats.map(chat => chat.timestamp || 0).filter(t => t > 0)
  
  return {
    totalChats: chats.length,
    totalMessages,
    oldestChat: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined,
    newestChat: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined
  }
}

// Save current chat to localStorage (fallback for anonymous users)
export function saveToLocalStorage(chatId: string, messages: Message[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatId}`, JSON.stringify(messages))
    localStorage.setItem(LOCAL_STORAGE_CHAT_ID_KEY, chatId)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Load chat from localStorage
export function loadFromLocalStorage(chatId: string): Message[] | null {
  if (typeof window === 'undefined') return null

  try {
    const messagesJson = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${chatId}`)
    if (messagesJson) {
      return JSON.parse(messagesJson) as Message[]
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }

  return null
} 