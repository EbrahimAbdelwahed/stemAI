import { NextRequest, NextResponse } from 'next/server';
import { realDataCollector } from '@/lib/analytics/real-data-collector';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '720'; // Default 30 days (720 hours)
    const action = searchParams.get('action') || 'overview';

    const timeRangeHours = parseInt(timeRange);
    
    if (isNaN(timeRangeHours) || timeRangeHours <= 0) {
      return NextResponse.json(
        { error: 'Invalid timeRange parameter' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'overview':
        // Get comprehensive real analytics data
        const analyticsData = await realDataCollector.getRealAnalyticsData(timeRangeHours);
        
        return NextResponse.json({
          success: true,
          data: analyticsData,
          source: 'real_database_data', // Explicitly mark as real data
          timestamp: new Date().toISOString()
        });

      case 'userFlows':
        // Get detailed user flow analytics
        const userFlowData = await realDataCollector.getRealAnalyticsData(timeRangeHours);
        const toolUsageData = await realDataCollector.getToolUsageStats(timeRangeHours);
        
        return NextResponse.json({
          success: true,
          data: {
            userFlows: userFlowData.userFlows,
            toolUsage: toolUsageData,
          },
          source: 'real_database_data',
          timestamp: new Date().toISOString()
        });

      case 'performance':
        // Get performance-specific metrics
        const performanceData = await realDataCollector.getRealAnalyticsData(timeRangeHours);
        
        return NextResponse.json({
          success: true,
          data: {
            webVitals: performanceData.webVitals,
            performanceScore: performanceData.performanceScore,
            avgApiResponseTime: performanceData.avgApiResponseTime,
            errorRate: performanceData.errorRate,
          },
          source: 'real_database_data',
          timestamp: new Date().toISOString()
        });

      case 'models':
        // Get AI model usage statistics
        const modelData = await realDataCollector.getModelUsageStats(timeRangeHours);
        
        return NextResponse.json({
          success: true,
          data: modelData,
          source: 'real_database_data',
          timestamp: new Date().toISOString()
        });

      case 'health':
        // Simple health check that returns basic real metrics
        try {
          const healthData = await realDataCollector.getRealAnalyticsData(24); // Last 24 hours
          return NextResponse.json({
            success: true,
            healthy: true,
            data: {
              recentPageViews: healthData.pageViews,
              recentApiCalls: healthData.apiCalls,
              recentErrors: healthData.errors,
            },
            source: 'real_database_data',
            timestamp: new Date().toISOString()
          });
                 } catch {
           return NextResponse.json({
             success: false,
             healthy: false,
             error: 'Database connection failed',
             timestamp: new Date().toISOString()
           }, { status: 503 });
         }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: overview, userFlows, performance, models, or health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    
    // If database is not available, return clear error (NO FAKE DATA)
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json({
        success: false,
        error: 'Analytics database not available. Please enable RAG_ENABLED in environment variables.',
        message: 'Real analytics data requires database connection',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'trackPageView':
        const { page, referrer, userAgent } = data;
        if (!page) {
          return NextResponse.json(
            { error: 'Missing page parameter' },
            { status: 400 }
          );
        }
        
        await realDataCollector.storePageView(page, referrer, userAgent);
        return NextResponse.json({
          success: true,
          message: 'Page view tracked',
          timestamp: new Date().toISOString()
        });

      case 'trackWebVitals':
        const { page: vitalsPage, vitals } = data;
        if (!vitalsPage || !vitals) {
          return NextResponse.json(
            { error: 'Missing page or vitals data' },
            { status: 400 }
          );
        }
        
        await realDataCollector.storeWebVitals(vitalsPage, vitals);
        return NextResponse.json({
          success: true,
          message: 'Web vitals tracked',
          timestamp: new Date().toISOString()
        });

      case 'trackApiMetric':
        const { endpoint, method, duration, success, statusCode, responseSize, errorMessage } = data;
        if (!endpoint || !method || duration === undefined || success === undefined) {
          return NextResponse.json(
            { error: 'Missing required API metric data' },
            { status: 400 }
          );
        }
        
        await realDataCollector.storeApiMetric(
          endpoint, 
          method, 
          duration, 
          success, 
          statusCode, 
          responseSize, 
          errorMessage
        );
        return NextResponse.json({
          success: true,
          message: 'API metric tracked',
          timestamp: new Date().toISOString()
        });

      case 'trackUserEvent':
        const { eventName, eventData, page: eventPage } = data;
        if (!eventName || !eventData) {
          return NextResponse.json(
            { error: 'Missing eventName or eventData' },
            { status: 400 }
          );
        }
        
        await realDataCollector.storeUserEvent(eventName, eventData, eventPage);
        return NextResponse.json({
          success: true,
          message: 'User event tracked',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: trackPageView, trackWebVitals, trackApiMetric, or trackUserEvent' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to track analytics data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 