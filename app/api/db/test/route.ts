import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { conversations, users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection by counting users
    const userCount = await db.select().from(users).limit(1)
    
    // Test conversations table
    const conversationCount = await db.select().from(conversations).limit(1)
    
    console.log('Database connection successful')
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Database connection successful',
      tables: {
        users: 'accessible',
        conversations: 'accessible'
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 