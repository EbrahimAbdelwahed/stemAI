'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface ConversationData {
  id: string
  title: string
  model: string
  createdAt: string
  updatedAt: string
  messageCount?: number
  isArchived?: boolean
}

export interface UseConversationsReturn {
  conversations: ConversationData[]
  isLoading: boolean
  error: string | null
  createConversation: (title: string, model: string) => Promise<ConversationData | null>
  updateConversation: (id: string, updates: Partial<ConversationData>) => Promise<boolean>
  deleteConversation: (id: string, archive?: boolean) => Promise<boolean>
  searchConversations: (query: string) => Promise<ConversationData[]>
  refreshConversations: () => Promise<void>
}

export function useConversations(): UseConversationsReturn {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) {
      setConversations([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  const createConversation = useCallback(async (title: string, model: string): Promise<ConversationData | null> => {
    if (!session?.user?.id) {
      setError('Authentication required')
      return null
    }

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, model }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      const newConversation = data.conversation

      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      return null
    }
  }, [session?.user?.id])

  const updateConversation = useCallback(async (id: string, updates: Partial<ConversationData>): Promise<boolean> => {
    if (!session?.user?.id) {
      setError('Authentication required')
      return false
    }

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      const data = await response.json()
      const updatedConversation = data.conversation

      setConversations(prev => 
        prev.map(conv => conv.id === id ? { ...conv, ...updatedConversation } : conv)
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation')
      return false
    }
  }, [session?.user?.id])

  const deleteConversation = useCallback(async (id: string, archive = false): Promise<boolean> => {
    if (!session?.user?.id) {
      setError('Authentication required')
      return false
    }

    try {
      const url = archive ? `/api/conversations/${id}?archive=true` : `/api/conversations/${id}`
      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to ${archive ? 'archive' : 'delete'} conversation`)
      }

      if (archive) {
        // Update the conversation as archived
        setConversations(prev => 
          prev.map(conv => conv.id === id ? { ...conv, isArchived: true } : conv)
        )
      } else {
        // Remove from list
        setConversations(prev => prev.filter(conv => conv.id !== id))
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${archive ? 'archive' : 'delete'} conversation`)
      return false
    }
  }, [session?.user?.id])

  const searchConversations = useCallback(async (query: string): Promise<ConversationData[]> => {
    if (!session?.user?.id) {
      return []
    }

    try {
      const response = await fetch(`/api/conversations?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search conversations')
      }

      const data = await response.json()
      return data.conversations || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search conversations')
      return []
    }
  }, [session?.user?.id])

  const refreshConversations = useCallback(async () => {
    await fetchConversations()
  }, [fetchConversations])

  // Load conversations when session changes
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations: conversations.filter(conv => !conv.isArchived), // Hide archived by default
    isLoading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
    refreshConversations,
  }
} 