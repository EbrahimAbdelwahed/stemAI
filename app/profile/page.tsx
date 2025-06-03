'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'
import { UserAvatar, AuthButton } from '@/components/ui/AuthButton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ConversationSummary {
  id: string
  title: string
  model: string
  messageCount: number
  lastActivity: string
  isArchived: boolean
}

interface UserDocument {
  id: number
  title: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalConversations: number
  totalMessages: number
  favoriteModel: string
  joinDate: string
  lastActive: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch conversations
      const conversationsResponse = await fetch('/api/conversations')
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        
        // Transform conversation data to include message counts
        const conversationSummaries: ConversationSummary[] = await Promise.all(
          conversationsData.conversations.map(async (conv: any) => {
            try {
              const messagesResponse = await fetch(`/api/conversations/${conv.id}`)
              const messagesData = await messagesResponse.json()
              return {
                id: conv.id,
                title: conv.title,
                model: conv.model,
                messageCount: messagesData.conversation?.messages?.length || 0,
                lastActivity: conv.updatedAt,
                isArchived: conv.isArchived || false
              }
            } catch {
              return {
                id: conv.id,
                title: conv.title,
                model: conv.model,
                messageCount: 0,
                lastActivity: conv.updatedAt,
                isArchived: conv.isArchived || false
              }
            }
          })
        )
        setConversations(conversationSummaries)
      }

      // Fetch documents
      const documentsResponse = await fetch('/api/documents')
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        setDocuments(documentsData.documents || [])
      }

      // Calculate stats from fetched data
      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0)
      const modelCounts = conversations.reduce((acc: Record<string, number>, conv) => {
        acc[conv.model] = (acc[conv.model] || 0) + 1
        return acc
      }, {})
      const favoriteModel = Object.entries(modelCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'gpt-4o'

      const userStats: UserStats = {
        totalConversations: conversations.length,
        totalMessages,
        favoriteModel,
        joinDate: new Date().toISOString(),
        lastActive: conversations[0]?.lastActivity || new Date().toISOString()
      }
      setStats(userStats)

    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setError('Failed to load user data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      setError('Failed to delete document')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="bg-neutral-900 border-neutral-800 max-w-md w-full">
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <Typography variant="h3" className="text-white mb-2">
              Sign In Required
            </Typography>
            <Typography variant="muted" className="text-neutral-400 mb-6">
              Please sign in to view your profile and chat history.
            </Typography>
            <AuthButton variant="primary" size="lg" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Typography variant="h1" className="text-white">
              Profile
            </Typography>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Button>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Button>
            </div>
          </div>
          
          {/* User Info Card */}
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <UserAvatar size="lg" />
                  <div className="flex-1 min-w-0">
                    <Typography variant="h3" className="text-white mb-4">
                      {session.user.name || 'User'}
                    </Typography>
                    <Typography variant="muted" className="text-neutral-400 mb-5">
                      {session.user.email}
                    </Typography>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-500">
                      <span>Joined {stats ? formatDate(stats.joinDate) : 'Recently'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Last active {stats ? formatRelativeTime(stats.lastActive) : 'Recently'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                  <Badge variant="secondary">
                    Pro User
                  </Badge>
                  <Typography variant="small" className="text-neutral-400">
                    All features unlocked
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <Card className="bg-red-900/20 border-red-800">
              <div className="p-6">
                <Typography variant="small" className="text-red-400">
                  {error}
                </Typography>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={fetchUserData}
                >
                  Retry
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 sm:mb-12">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 text-center">
                <Typography variant="h2" className="text-blue-400 mb-2">
                  {stats.totalConversations}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Conversations
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 text-center">
                <Typography variant="h2" className="text-green-400 mb-2">
                  {stats.totalMessages}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Messages
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 text-center">
                <Typography variant="h2" className="text-purple-400 mb-2 break-all">
                  {stats.favoriteModel}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Favorite Model
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 text-center">
                <Typography variant="h2" className="text-orange-400 mb-2">
                  {documents.length}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Documents
                </Typography>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="conversations">Chat History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="mt-0">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <Typography variant="h4" className="text-white">
                    Recent Conversations
                  </Typography>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/chat')}
                  >
                    Start New Chat
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-neutral-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors cursor-pointer"
                        onClick={() => router.push(`/chat/${conversation.id}`)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <Typography variant="small" className="text-white font-medium truncate">
                              {conversation.title}
                            </Typography>
                            {conversation.isArchived && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                Archived
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-neutral-400">
                            <span className="break-all">{conversation.model}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{conversation.messageCount} messages</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatRelativeTime(conversation.lastActivity)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 sm:mt-0 self-end sm:self-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <Typography variant="large" className="text-neutral-300 mb-3">
                      No conversations yet
                    </Typography>
                    <Typography variant="muted" className="text-neutral-400 mb-6">
                      Start chatting to see your conversation history here.
                    </Typography>
                    <Button 
                      variant="primary"
                      onClick={() => router.push('/chat')}
                    >
                      Start New Chat
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <Typography variant="h4" className="text-white">
                    Uploaded Documents
                  </Typography>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/chat')}
                  >
                    Upload Document
                  </Button>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-neutral-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <Typography variant="small" className="text-white font-medium truncate">
                              {document.title}
                            </Typography>
                            {document.isPublic && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                Public
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-neutral-400">
                            <span>Uploaded {formatRelativeTime(document.createdAt)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Modified {formatRelativeTime(document.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <Typography variant="large" className="text-neutral-300 mb-3">
                      No documents uploaded
                    </Typography>
                    <Typography variant="muted" className="text-neutral-400 mb-6">
                      Upload documents to enhance your AI conversations.
                    </Typography>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/chat')}
                    >
                      Upload Document
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6 sm:p-8">
                  <Typography variant="h4" className="text-white mb-6">
                    Account Settings
                  </Typography>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Typography variant="small" className="text-white font-medium">
                          Email Notifications
                        </Typography>
                        <Typography variant="small" className="text-neutral-400 mt-1">
                          Receive updates about your conversations
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm" className="w-fit">
                        Configure
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Typography variant="small" className="text-white font-medium">
                          Data Export
                        </Typography>
                        <Typography variant="small" className="text-neutral-400 mt-1">
                          Download your conversation history
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm" className="w-fit">
                        Export
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Typography variant="small" className="text-red-400 font-medium">
                          Delete Account
                        </Typography>
                        <Typography variant="small" className="text-neutral-400 mt-1">
                          Permanently delete your account and data
                        </Typography>
                      </div>
                      <Button variant="destructive" size="sm" className="w-fit">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 