import { NextRequest, NextResponse } from 'next/server';

interface ShareMetrics {
  totalShares: number;
  sharesLast24h: number;
  averageMessageCount: number;
  truncationRate: number;
  errorRate: number;
  topSharedProjects: Array<{ name: string; count: number }>;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: string;
  environment: string;
  version: string;
}

// In a real implementation, these would be stored in Redis or a database
let shareMetricsCache: ShareMetrics = {
  totalShares: 0,
  sharesLast24h: 0,
  averageMessageCount: 0,
  truncationRate: 0,
  errorRate: 0,
  topSharedProjects: []
};

export async function GET(request: NextRequest) {
  try {
    // Check if metrics are enabled
    if (process.env.METRICS_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Metrics disabled' }, { status: 403 });
    }

    // Basic authentication for metrics endpoint
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.METRICS_AUTH_TOKEN;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const type = url.searchParams.get('type') || 'all';

    // Collect system metrics
    const systemMetrics: SystemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '0.1.0'
    };

    // Collect sharing metrics (in production, this would come from Redis/DB)
    const sharingMetrics = await getShareMetrics();

    const metrics = {
      system: systemMetrics,
      ...(type === 'all' || type === 'sharing') && { sharing: sharingMetrics }
    };

    // Return Prometheus format if requested
    if (format === 'prometheus') {
      const prometheusMetrics = formatPrometheusMetrics(systemMetrics, sharingMetrics);
      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Return JSON format
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('[METRICS_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getShareMetrics(): Promise<ShareMetrics> {
  // In production, this would query Redis or database for actual metrics
  // For now, return cached/simulated data
  
  if (process.env.REDIS_ENABLED === 'true') {
    // Simulate Redis metrics collection
    try {
      // In real implementation:
      // const redis = new Redis(process.env.REDIS_URL);
      // const metrics = await redis.hgetall('share_metrics');
      // return parseMetrics(metrics);
      
      return shareMetricsCache;
    } catch (error) {
      console.error('[REDIS_METRICS_ERROR]', error);
      return shareMetricsCache;
    }
  }
  
  return shareMetricsCache;
}

function formatPrometheusMetrics(system: SystemMetrics, sharing: ShareMetrics): string {
  const lines = [
    '# HELP ai_fiesta_uptime_seconds Total uptime in seconds',
    '# TYPE ai_fiesta_uptime_seconds counter',
    `ai_fiesta_uptime_seconds ${system.uptime}`,
    '',
    '# HELP ai_fiesta_memory_usage_bytes Memory usage in bytes',
    '# TYPE ai_fiesta_memory_usage_bytes gauge',
    `ai_fiesta_memory_usage_bytes{type="rss"} ${system.memoryUsage.rss}`,
    `ai_fiesta_memory_usage_bytes{type="heapTotal"} ${system.memoryUsage.heapTotal}`,
    `ai_fiesta_memory_usage_bytes{type="heapUsed"} ${system.memoryUsage.heapUsed}`,
    `ai_fiesta_memory_usage_bytes{type="external"} ${system.memoryUsage.external}`,
    '',
    '# HELP ai_fiesta_shares_total Total number of chat shares',
    '# TYPE ai_fiesta_shares_total counter',
    `ai_fiesta_shares_total ${sharing.totalShares}`,
    '',
    '# HELP ai_fiesta_shares_24h Number of shares in last 24 hours',
    '# TYPE ai_fiesta_shares_24h gauge',
    `ai_fiesta_shares_24h ${sharing.sharesLast24h}`,
    '',
    '# HELP ai_fiesta_share_truncation_rate Rate of truncated shares',
    '# TYPE ai_fiesta_share_truncation_rate gauge',
    `ai_fiesta_share_truncation_rate ${sharing.truncationRate}`,
    '',
    '# HELP ai_fiesta_share_error_rate Rate of sharing errors',
    '# TYPE ai_fiesta_share_error_rate gauge',
    `ai_fiesta_share_error_rate ${sharing.errorRate}`,
    '',
    '# HELP ai_fiesta_share_avg_messages Average messages per share',
    '# TYPE ai_fiesta_share_avg_messages gauge',
    `ai_fiesta_share_avg_messages ${sharing.averageMessageCount}`,
    ''
  ];

  return lines.join('\n');
}

// Endpoint to update share metrics (called by sharing service)
export async function POST(request: NextRequest) {
  try {
    // Check if metrics are enabled
    if (process.env.METRICS_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Metrics disabled' }, { status: 403 });
    }

    const { event, data } = await request.json();
    
    // Update metrics based on event type
    switch (event) {
      case 'share_created':
        shareMetricsCache.totalShares++;
        shareMetricsCache.sharesLast24h++;
        if (data.messageCount) {
          shareMetricsCache.averageMessageCount = 
            (shareMetricsCache.averageMessageCount + data.messageCount) / 2;
        }
        if (data.truncated) {
          shareMetricsCache.truncationRate = 
            (shareMetricsCache.truncationRate * shareMetricsCache.totalShares + 1) / 
            (shareMetricsCache.totalShares + 1);
        }
        break;
        
      case 'share_error':
        shareMetricsCache.errorRate = 
          (shareMetricsCache.errorRate * shareMetricsCache.totalShares + 1) / 
          (shareMetricsCache.totalShares + 1);
        break;
        
      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    // In production, persist to Redis
    if (process.env.REDIS_ENABLED === 'true') {
      // await redis.hset('share_metrics', shareMetricsCache);
    }

    return NextResponse.json({ message: 'Metrics updated' }, { status: 200 });
    
  } catch (error) {
    console.error('[METRICS_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
  }
}