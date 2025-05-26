'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
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

interface UserStats {
  totalConversations: number
  totalMessages: number
  favoriteModel: string
  joinDate: string
  lastActive: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement API calls to fetch user data
      // For now, using mock data
      const mockStats: UserStats = {
        totalConversations: 12,
        totalMessages: 156,
        favoriteModel: 'gpt-4',
        joinDate: '2024-01-15',
        lastActive: new Date().toISOString()
      }

      const mockConversations: ConversationSummary[] = [
        {
          id: '1',
          title: 'Quantum Physics Discussion',
          model: 'gpt-4',
          messageCount: 23,
          lastActivity: '2024-01-20T10:30:00Z',
          isArchived: false
        },
        {
          id: '2',
          title: 'Molecular Structure Analysis',
          model: 'claude-3',
          messageCount: 15,
          lastActivity: '2024-01-19T14:22:00Z',
          isArchived: false
        },
        {
          id: '3',
          title: 'Chemistry Lab Help',
          model: 'gpt-4',
          messageCount: 8,
          lastActivity: '2024-01-18T09:15:00Z',
          isArchived: true
        }
      ]

      setStats(mockStats)
      setConversations(mockConversations)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h1" className="text-white">
              Profile
            </Typography>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </div>
          
          {/* User Info Card */}
          <Card className="bg-neutral-900 border-neutral-800">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <UserAvatar size="lg" />
                <div className="flex-1">
                  <Typography variant="h3" className="text-white mb-1">
                    {session.user.name || 'User'}
                  </Typography>
                  <Typography variant="muted" className="text-neutral-400 mb-2">
                    {session.user.email}
                  </Typography>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500">
                    <span>Joined {stats ? formatDate(stats.joinDate) : 'Recently'}</span>
                    <span>•</span>
                    <span>Last active {stats ? formatRelativeTime(stats.lastActive) : 'Recently'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">
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

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-4 text-center">
                <Typography variant="h2" className="text-blue-400 mb-1">
                  {stats.totalConversations}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Conversations
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-4 text-center">
                <Typography variant="h2" className="text-green-400 mb-1">
                  {stats.totalMessages}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Messages
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-4 text-center">
                <Typography variant="h2" className="text-purple-400 mb-1">
                  {stats.favoriteModel}
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Favorite Model
                </Typography>
              </div>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-4 text-center">
                <Typography variant="h2" className="text-orange-400 mb-1">
                  24/7
                </Typography>
                <Typography variant="small" className="text-neutral-400">
                  Availability
                </Typography>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversations">Chat History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="mt-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h4" className="text-white">
                    Recent Conversations
                  </Typography>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-neutral-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Typography variant="small" className="text-white font-medium">
                              {conversation.title}
                            </Typography>
                            {conversation.isArchived && (
                              <Badge variant="secondary" className="text-xs">
                                Archived
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-neutral-400">
                            <span>{conversation.model}</span>
                            <span>•</span>
                            <span>{conversation.messageCount} messages</span>
                            <span>•</span>
                            <span>{formatRelativeTime(conversation.lastActivity)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <Typography variant="large" className="text-neutral-300 mb-2">
                      No conversations yet
                    </Typography>
                    <Typography variant="muted" className="text-neutral-400 mb-4">
                      Start chatting to see your conversation history here.
                    </Typography>
                    <Button variant="primary">
                      Start New Chat
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6">
                <Typography variant="h4" className="text-white mb-4">
                  Uploaded Documents
                </Typography>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <Typography variant="large" className="text-neutral-300 mb-2">
                    No documents uploaded
                  </Typography>
                  <Typography variant="muted" className="text-neutral-400 mb-4">
                    Upload documents to enhance your AI conversations.
                  </Typography>
                  <Button variant="outline">
                    Upload Document
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <div className="p-6">
                  <Typography variant="h4" className="text-white mb-4">
                    Account Settings
                  </Typography>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="text-white font-medium">
                          Email Notifications
                        </Typography>
                        <Typography variant="small" className="text-neutral-400">
                          Receive updates about your conversations
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="text-white font-medium">
                          Data Export
                        </Typography>
                        <Typography variant="small" className="text-neutral-400">
                          Download your conversation history
                        </Typography>
                      </div>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="text-red-400 font-medium">
                          Delete Account
                        </Typography>
                        <Typography variant="small" className="text-neutral-400">
                          Permanently delete your account and data
                        </Typography>
                      </div>
                      <Button variant="destructive" size="sm">
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