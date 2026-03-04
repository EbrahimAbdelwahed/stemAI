import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { migrateLocalStorageChats } from '@/lib/chat/migration'

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
    const { localChats } = body

    if (!localChats || !Array.isArray(localChats)) {
      return new Response(JSON.stringify({ error: 'Local chats data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Starting migration for user ${session.user.id} with ${localChats.length} chats`)

    // Store the local chats data temporarily in the request context
    // and trigger the migration process
    const results = await migrateLocalStorageChats(session.user.id)

    return new Response(JSON.stringify({ 
      success: true,
      results,
      message: `Migration completed: ${results.success} successful, ${results.failed} failed`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error migrating localStorage chats:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to migrate chats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 