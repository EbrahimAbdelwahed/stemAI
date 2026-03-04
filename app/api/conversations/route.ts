import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { 
  getUserConversations, 
  createConversation, 
  searchConversations 
} from '@/lib/db/conversations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let conversations
    if (search) {
      conversations = await searchConversations(session.user.id, search)
    } else {
      conversations = await getUserConversations(session.user.id)
    }

    return new Response(JSON.stringify({ conversations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { title, model } = body

    if (!title || !model) {
      return new Response(JSON.stringify({ error: 'Title and model are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const conversation = await createConversation({
      userId: session.user.id,
      title,
      model
    })

    return new Response(JSON.stringify({ conversation }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 