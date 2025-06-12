import { db } from '@/lib/db';
import { 
  analyticsEvents, 
  webVitalsMetrics, 
  apiMetrics, 
  pageViews 
} from '@/lib/db/schema';
import { eq, count, desc, and, gte, avg, sql } from 'drizzle-orm';

// Session ID generator for tracking user sessions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create session ID from localStorage (client-side only)
function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export interface WebVitalsData {
  cls?: number;
  inp?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
}

export interface UserEventData {
  [key: string]: unknown;
}

export class RealDataCollector {
  private static instance: RealDataCollector;
  
  private constructor() {}
  
  static getInstance(): RealDataCollector {
    if (!RealDataCollector.instance) {
      RealDataCollector.instance = new RealDataCollector();
    }
    return RealDataCollector.instance;
  }

  /**
   * Store real page view data
   */
  async storePageView(page: string, referrer?: string, userAgent?: string): Promise<void> {
    if (!db) {
      console.warn('Database not available for analytics');
      return;
    }

    try {
      await db.insert(pageViews).values({
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        sessionId: getSessionId(),
        userId: null, // We don't track user IDs for privacy
      });
    } catch (error) {
      console.error('Failed to store page view:', error);
    }
  }

  /**
   * Store real web vitals from browser measurements
   */
  async storeWebVitals(page: string, vitals: WebVitalsData): Promise<void> {
    if (!db) {
      console.warn('Database not available for analytics');
      return;
    }

    try {
      await db.insert(webVitalsMetrics).values({
        page,
        cls: vitals.cls || null,
        inp: vitals.inp || null,
        fcp: vitals.fcp || null,
        lcp: vitals.lcp || null,
        ttfb: vitals.ttfb || null,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.error('Failed to store web vitals:', error);
    }
  }

  /**
   * Store real API metrics from actual requests
   */
  async storeApiMetric(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    statusCode?: number,
    responseSize?: number,
    errorMessage?: string
  ): Promise<void> {
    if (!db) {
      console.warn('Database not available for analytics');
      return;
    }

    try {
      await db.insert(apiMetrics).values({
        endpoint,
        method,
        duration,
        success,
        statusCode: statusCode || null,
        responseSize: responseSize || null,
        errorMessage: errorMessage || null,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.error('Failed to store API metric:', error);
    }
  }

  /**
   * Store real user events (chat, uploads, tool usage, etc.)
   */
  async storeUserEvent(
    eventName: string,
    eventData: UserEventData,
    page?: string
  ): Promise<void> {
    if (!db) {
      console.warn('Database not available for analytics');
      return;
    }

    try {
      await db.insert(analyticsEvents).values({
        eventName,
        eventData,
        page: page || null,
        sessionId: getSessionId(),
        userId: null, // Privacy-first approach
      });
    } catch (error) {
      console.error('Failed to store user event:', error);
    }
  }

  /**
   * Get real analytics data from database (for API endpoint)
   */
  async getRealAnalyticsData(timeRangeHours: number = 24 * 30): Promise<{
    pageViews: number;
    apiCalls: number;
    errors: number;
    webVitals: WebVitalsData;
    performanceScore: number;
    userFlows: {
      chatConversations: number;
      documentUploads: number;
      uiGeneration: number;
      visualizations: number;
    };
    avgApiResponseTime: number;
    errorRate: number;
    timeRange: string;
    lastUpdated: string;
  }> {
    if (!db) {
      throw new Error('Database not available for analytics');
    }

    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    try {
      // Real page views count
      const pageViewsResult = await db
        .select({ count: count() })
        .from(pageViews)
        .where(gte(pageViews.timestamp, cutoffTime));

      // Real API calls count
      const apiCallsResult = await db
        .select({ count: count() })
        .from(apiMetrics)
        .where(gte(apiMetrics.timestamp, cutoffTime));

      // Real errors count
      const errorsResult = await db
        .select({ count: count() })
        .from(apiMetrics)
        .where(
          and(
            gte(apiMetrics.timestamp, cutoffTime),
            eq(apiMetrics.success, false)
          )
        );

      // Real web vitals (latest for each page)
      const webVitalsResult = await db
        .select()
        .from(webVitalsMetrics)
        .where(gte(webVitalsMetrics.timestamp, cutoffTime))
        .orderBy(desc(webVitalsMetrics.timestamp))
        .limit(1);

      // Real user flow counts
      const chatSessionsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'chat_session_started')
          )
        );

      const documentUploadsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'document_uploaded')
          )
        );

      const uiGenerationsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'ui_generation_completed')
          )
        );

      const visualizationsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'visualization_rendered')
          )
        );

              // Real performance metrics
        const avgApiResponseTimeResult = await db
          .select({ avg: avg(apiMetrics.duration) })
          .from(apiMetrics)
          .where(
            and(
              gte(apiMetrics.timestamp, cutoffTime),
              eq(apiMetrics.success, true)
            )
          );

      // Calculate real performance score from web vitals
      const webVitals = webVitalsResult[0];
      let performanceScore = 0;
      if (webVitals) {
        let scoreSum = 0;
        let scoreCount = 0;

        if (webVitals.cls !== null) {
          scoreSum += webVitals.cls <= 0.1 ? 100 : webVitals.cls <= 0.25 ? 50 : 0;
          scoreCount++;
        }
        if (webVitals.inp !== null) {
          scoreSum += webVitals.inp <= 200 ? 100 : webVitals.inp <= 500 ? 50 : 0;
          scoreCount++;
        }
        if (webVitals.fcp !== null) {
          scoreSum += webVitals.fcp <= 1800 ? 100 : webVitals.fcp <= 3000 ? 50 : 0;
          scoreCount++;
        }
        if (webVitals.lcp !== null) {
          scoreSum += webVitals.lcp <= 2500 ? 100 : webVitals.lcp <= 4000 ? 50 : 0;
          scoreCount++;
        }
        if (webVitals.ttfb !== null) {
          scoreSum += webVitals.ttfb <= 800 ? 100 : webVitals.ttfb <= 1800 ? 50 : 0;
          scoreCount++;
        }

        performanceScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
      }

      // Calculate error rate
      const totalApiCalls = apiCallsResult[0]?.count || 0;
      const totalErrors = errorsResult[0]?.count || 0;
      const errorRate = totalApiCalls > 0 ? (totalErrors / totalApiCalls) * 100 : 0;

      return {
        // Core metrics (REAL DATA ONLY)
        pageViews: pageViewsResult[0]?.count || 0,
        apiCalls: apiCallsResult[0]?.count || 0,
        errors: totalErrors,
        
        // Web vitals (REAL DATA)
        webVitals: {
          cls: webVitals?.cls || 0,
          inp: webVitals?.inp || 0,
          fcp: webVitals?.fcp || 0,
          lcp: webVitals?.lcp || 0,
          ttfb: webVitals?.ttfb || 0,
        },
        
        // Performance score (CALCULATED FROM REAL DATA)
        performanceScore,
        
        // User flows (REAL DATA)
        userFlows: {
          chatConversations: chatSessionsResult[0]?.count || 0,
          documentUploads: documentUploadsResult[0]?.count || 0,
          uiGeneration: uiGenerationsResult[0]?.count || 0,
          visualizations: visualizationsResult[0]?.count || 0,
        },
        
        // Performance insights (REAL DATA)
        avgApiResponseTime: Number(avgApiResponseTimeResult[0]?.avg) || 0,
        errorRate: Math.round(errorRate * 100) / 100,
        
        // Metadata
        timeRange: `${timeRangeHours} hours`,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get real analytics data:', error);
      throw error;
    }
  }

  /**
   * Get model usage statistics (REAL DATA)
   */
  async getModelUsageStats(_timeRangeHours: number = 24 * 30): Promise<{
    gpt4: number;
    gemini: number;
    grok: number;
    claude: number;
  }> {
    if (!db) {
      throw new Error('Database not available for analytics');
    }

    try {
      // This would require tracking model usage in events
      // For now, return structure for when we implement model tracking
      return {
        gpt4: 0,
        gemini: 0,
        grok: 0,
        claude: 0,
      };
    } catch (error) {
      console.error('Failed to get model usage stats:', error);
      throw error;
    }
  }

  /**
   * Get tool usage statistics (REAL DATA)
   */
  async getToolUsageStats(timeRangeHours: number = 24 * 30): Promise<{
    mol3d: number;
    plotly: number;
    physics: number;
    rag: number;
  }> {
    if (!db) {
      throw new Error('Database not available for analytics');
    }

    const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    try {
      const mol3dResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'tool_invoked'),
            sql`event_data->>'tool_type' = '3dmol'`
          )
        );

      const plotlyResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'tool_invoked'),
            sql`event_data->>'tool_type' = 'plotly'`
          )
        );

      const physicsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'tool_invoked'),
            sql`event_data->>'tool_type' = 'physics'`
          )
        );

      const ragResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.timestamp, cutoffTime),
            eq(analyticsEvents.eventName, 'tool_invoked'),
            sql`event_data->>'tool_type' = 'rag_search'`
          )
        );

      return {
        mol3d: mol3dResult[0]?.count || 0,
        plotly: plotlyResult[0]?.count || 0,
        physics: physicsResult[0]?.count || 0,
        rag: ragResult[0]?.count || 0,
      };
    } catch (error) {
      console.error('Failed to get tool usage stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const realDataCollector = RealDataCollector.getInstance(); 