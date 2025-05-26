import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { 
  getConversationWithMessages, 
  updateConversation, 
  deleteConversation, 
  archiveConversation 
} from '@/lib/db/conversations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const conversationId = params.id

    // Allow both authenticated and anonymous access
    // For authenticated users, verify ownership
    const userId = session?.user?.id

    const conversationWithMessages = await getConversationWithMessages(
      conversationId, 
      userId // This will enforce ownership check if userId is provided
    )

    if (!conversationWithMessages) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      conversation: conversationWithMessages 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const conversationId = params.id
    const body = await request.json()
    const { title, isArchived } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (isArchived !== undefined) updateData.isArchived = isArchived

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updatedConversation = await updateConversation(conversationId, updateData)

    if (!updatedConversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      conversation: updatedConversation 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return new Response(JSON.stringify({ error: 'Failed to update conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const archive = searchParams.get('archive') === 'true'

    if (archive) {
      // Archive instead of delete
      const archivedConversation = await archiveConversation(conversationId)
      return new Response(JSON.stringify({ 
        conversation: archivedConversation,
        message: 'Conversation archived successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Permanent delete
      await deleteConversation(conversationId)
      return new Response(JSON.stringify({ 
        message: 'Conversation deleted successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 