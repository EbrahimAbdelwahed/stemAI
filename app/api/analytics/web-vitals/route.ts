import { NextRequest, NextResponse } from 'next/server';
import { db, webVitalsMetrics } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Validate required fields
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Save to database
    if (db) {
      await db.insert(webVitalsMetrics).values({
        page: metric.pathname || '/',
        [metric.name.toLowerCase()]: metric.value,
        timestamp: new Date(),
        sessionId: request.headers.get('x-session-id') || undefined
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save metric' },
      { status: 500 }
    );
  }
} 