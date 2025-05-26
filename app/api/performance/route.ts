import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance/monitor';
import { trackAPIPerformance } from '@/lib/analytics/api-performance-middleware';

async function performanceGetHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const timeRange = searchParams.get('timeRange');
    const action = searchParams.get('action');
    
    // Parse time range if provided
    let parsedTimeRange;
    if (timeRange) {
      try {
        parsedTimeRange = JSON.parse(timeRange);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid timeRange format' },
          { status: 400 }
        );
      }
    }
    
    switch (action) {
      case 'stats':
        const stats = performanceMonitor.getStats(operation || undefined, parsedTimeRange);
        return NextResponse.json({ stats });
        
      case 'webVitals':
        const webVitals = performanceMonitor.getWebVitals();
        return NextResponse.json({ webVitals });
        
      case 'slowOperations':
        const threshold = parseInt(searchParams.get('threshold') || '1000');
        const slowOps = performanceMonitor.getSlowOperations(threshold);
        return NextResponse.json({ slowOperations: slowOps });
        
      case 'errorOperations':
        const errorOps = performanceMonitor.getErrorOperations();
        return NextResponse.json({ errorOperations: errorOps });
        
      case 'export':
        const exportData = performanceMonitor.exportMetrics();
        return NextResponse.json(exportData);
        
      default:
        // Return general overview
        const overview = {
          stats: performanceMonitor.getStats(),
          webVitals: performanceMonitor.getWebVitals(),
          slowOperations: performanceMonitor.getSlowOperations(1000),
          errorOperations: performanceMonitor.getErrorOperations()
        };
        return NextResponse.json(overview);
    }
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = trackAPIPerformance(performanceGetHandler);

async function performancePostHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'recordWebVitals':
        const { page, vitals } = data;
        if (!page || !vitals) {
          return NextResponse.json(
            { error: 'Missing page or vitals data' },
            { status: 400 }
          );
        }
        
        performanceMonitor.recordWebVitals(page, vitals);
        return NextResponse.json({ success: true });
        
      case 'clear':
        performanceMonitor.clearMetrics();
        return NextResponse.json({ success: true, message: 'Metrics cleared' });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Performance API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = trackAPIPerformance(performancePostHandler);

async function performanceDeleteHandler() {
  try {
    performanceMonitor.clearMetrics();
    return NextResponse.json({ 
      success: true, 
      message: 'All performance metrics cleared' 
    });
  } catch (error) {
    console.error('Performance API DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = trackAPIPerformance(performanceDeleteHandler); 