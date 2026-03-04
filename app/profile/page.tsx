'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/Typography'
import { Card } from '@/components/ui/Card'
import { UserAvatar, AuthButton } from '@/components/ui/AuthButton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDocumentState, useDocumentActions, useChatState, useChatActions } from '@/lib/store/hooks'

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

  const { conversations } = useChatState()
  const { setConversations } = useChatActions()
  const { documents } = useDocumentState()
  const { setDocuments } = useDocumentActions()

  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true)
      setError(null)

      // Prepare container for conversation summaries
      let conversationSummaries: ConversationSummary[] = [];

      // Fetch conversations
      const conversationsResponse = await fetch('/api/conversations')
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json()
        
        // Transform conversation data to include message counts
        conversationSummaries = await Promise.all(
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
        setConversations(conversationSummaries as any)
      }

      // Fetch documents
      const documentsResponse = await fetch('/api/documents')
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        setDocuments(documentsData.documents || [])
      }

      // Calculate stats from fetched data using the freshly fetched summaries
      const totalMessages = (conversationSummaries as any[]).reduce((sum, conv) => sum + conv.messageCount, 0)
      const modelCounts = (conversationSummaries as any[]).reduce((acc: Record<string, number>, conv) => {
        acc[conv.model] = (acc[conv.model] || 0) + 1
        return acc
      }, {})
      const favoriteModel = Object.entries(modelCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'gpt-4o'

      const userStats: UserStats = {
        totalConversations: conversationSummaries.length,
        totalMessages,
        favoriteModel,
        joinDate: new Date().toISOString(),
        lastActive: (conversationSummaries[0] as any)?.lastActivity || new Date().toISOString()
      }
      setStats(userStats)

    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setError('Failed to load user data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, setConversations, setDocuments])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status, fetchUserData])

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

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDocuments(documents.filter((doc: any) => doc.id !== documentId))
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
                    <div className="space-y-3">
                      <Typography variant="h3" className="text-white leading-tight">
                        {session.user.name || 'User'}
                      </Typography>
                      <Typography variant="muted" className="text-neutral-400 leading-relaxed">
                        {session.user.email}
                      </Typography>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-500 pt-2">
                        <span>Joined {stats ? formatDate(stats.joinDate) : 'Recently'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Last active {stats ? formatRelativeTime(stats.lastActive) : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                  <Badge variant="secondary">
                    Pro User
                  </Badge>
                  <Typography variant="small" className="text-neutral-400">
                    User ID: {session.user.id}
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {isLoading && (
          <div className="text-center text-neutral-400">
            <div className="w-6 h-6 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading your data...</p>
          </div>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-500/30">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <Typography variant="h4" className="text-red-300 mb-2">
                An Error Occurred
              </Typography>
              <Typography variant="muted" className="text-red-400 mb-6">
                {error}
              </Typography>
              <Button onClick={fetchUserData} variant="destructive">
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {!isLoading && !error && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-900 border-neutral-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="conversations">
                Conversations ({conversations.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({documents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="bg-neutral-900 border-neutral-800 mt-6">
                <div className="p-6">
                  <Typography variant="h3" className="text-white mb-6">
                    Statistics
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <Card className="bg-neutral-800/50 p-4">
                      <Typography variant="small" className="text-neutral-400">
                        Total Conversations
                      </Typography>
                      <Typography variant="h2" className="text-white">
                        {stats?.totalConversations ?? 0}
                      </Typography>
                    </Card>
                    <Card className="bg-neutral-800/50 p-4">
                      <Typography variant="small" className="text-neutral-400">
                        Total Messages
                      </Typography>
                      <Typography variant="h2" className="text-white">
                        {stats?.totalMessages ?? 0}
                      </Typography>
                    </Card>
                    <Card className="bg-neutral-800/50 p-4">
                      <Typography variant="small" className="text-neutral-400">
                        Most Used Model
                      </Typography>
                      <Typography variant="h2" className="text-white capitalize">
                        {stats?.favoriteModel.split('-')[0] ?? 'N/A'}
                      </Typography>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="conversations">
              <Card className="bg-neutral-900 border-neutral-800 mt-6">
                <div className="p-6">
                  <Typography variant="h3" className="text-white mb-6">
                    Chat History
                  </Typography>
                  <div className="space-y-4">
                    {conversations
                      // .sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                      .map((conv) => (
                      <Card 
                        key={conv.id} 
                        className="bg-neutral-800/50 hover:bg-neutral-800/80 transition-colors"
                        onClick={() => router.push(`/chat/${conv.id}`)}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{conv.title}</p>
                            <div className="text-sm text-neutral-400 flex items-center gap-3 mt-1">
                              <span>{conv.model}</span>
                              <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                              {/* <span>{conv.messageCount} messages</span> */}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-neutral-500">
                              {/* {formatRelativeTime(conv.lastActivity)} */}
                              Recently
                            </p>
                            {conv.isArchived && (
                              <Badge variant="secondary" className="mt-1">
                                Archived
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card className="bg-neutral-900 border-neutral-800 mt-6">
                <div className="p-6">
                  <Typography variant="h3" className="text-white mb-6">
                    My Documents
                  </Typography>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="bg-neutral-800/50">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{doc.title}</p>
                            <div className="text-sm text-neutral-400 flex items-center gap-3 mt-1">
                              <span>{doc.isPublic ? 'Public' : 'Private'}</span>
                              <span className="w-1 h-1 bg-neutral-600 rounded-full" />
                              <span>Uploaded: {formatDate(doc.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id.toString())}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

          </Tabs>
        )}
      </div>
    </div>
  )
} 