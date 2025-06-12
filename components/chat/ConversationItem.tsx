'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ConversationData } from '@/hooks/useConversations'

interface ConversationItemProps {
  conversation: ConversationData
  isActive?: boolean
  onDelete: (id: string) => Promise<boolean>
  onArchive: (id: string) => Promise<boolean>
  onRename: (id: string, newTitle: string) => Promise<boolean>
}

export function ConversationItem({ 
  conversation, 
  isActive = false, 
  onDelete, 
  onArchive, 
  onRename 
}: ConversationItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close actions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = async () => {
    if (editTitle.trim() === conversation.title || !editTitle.trim()) {
      setIsEditing(false)
      setEditTitle(conversation.title)
      return
    }

    setIsLoading(true)
    const success = await onRename(conversation.id, editTitle.trim())
    setIsLoading(false)
    
    if (success) {
      setIsEditing(false)
    } else {
      setEditTitle(conversation.title) // Reset on failure
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditTitle(conversation.title)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await onDelete(conversation.id)
    setIsLoading(false)
    setShowActions(false)
  }

  const handleArchive = async () => {
    setIsLoading(true)
    await onArchive(conversation.id)
    setIsLoading(false)
    setShowActions(false)
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn(
      "group relative rounded-lg transition-colors",
      isActive && "bg-neutral-800 border border-neutral-700",
      !isActive && "hover:bg-neutral-800/50"
    )}>
      {/* Main conversation link */}
      <Link
        href={`/chat/${conversation.id}`}
        className={cn(
          "block p-3 pr-10", // Add right padding for actions button
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-medium text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
            disabled={isLoading}
          />
        ) : (
          <div className="text-sm font-medium text-white truncate">
            {conversation.title}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-400 capitalize">
            {conversation.model.replace(/-/g, ' ')}
          </span>
          <span className="text-xs text-neutral-500">
            {formatTimeAgo(conversation.updatedAt)}
          </span>
        </div>
      </Link>

      {/* Actions button */}
      <div ref={menuRef} className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowActions(!showActions)
          }}
          className={cn(
            "p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors",
            "opacity-0 group-hover:opacity-100",
            showActions && "opacity-100 text-white bg-neutral-700"
          )}
          disabled={isLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        </button>

        {/* Actions dropdown */}
        {showActions && (
          <div className="absolute right-0 mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsEditing(true)
                setShowActions(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Rename
            </button>
            
            <button
              onClick={handleArchive}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
              </svg>
              Archive
            </button>
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 