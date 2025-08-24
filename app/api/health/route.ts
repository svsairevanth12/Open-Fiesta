import { NextResponse } from 'next/server';

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  features: {
    sharing: {
      enabled: boolean;
      status: 'ok' | 'error';
      maxMessageCount: number;
    };
    redis?: {
      enabled: boolean;
      status: 'ok' | 'error';
      connection?: string;
    };
    cdn?: {
      enabled: boolean;
      status: 'ok' | 'error';
    };
  };
  metrics?: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

async function checkRedisConnection(): Promise<{ enabled: boolean; status: 'ok' | 'error'; connection?: string }> {
  const enabled = process.env.REDIS_ENABLED === 'true';
  
  if (!enabled) {
    return { enabled, status: 'ok' };
  }

  try {
    // In a real implementation, you would check Redis connection here
    // For now, we'll simulate based on environment variables
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return { enabled, status: 'error' };
    }
    
    return { 
      enabled,
      status: 'ok',
      connection: redisUrl.replace(/\/\/.*@/, '//***@') // Hide credentials
    };
  } catch (error) {
    return { enabled, status: 'error' };
  }
}

async function checkSharingFeature(): Promise<{ enabled: boolean; status: 'ok' | 'error'; maxMessageCount: number }> {
  const enabled = process.env.SHARE_FEATURE_ENABLED === 'true';
  const maxMessageCount = parseInt(process.env.SHARE_MAX_MESSAGE_COUNT || '20', 10);
  
  // Basic validation of sharing configuration
  if (enabled && (!process.env.SHARE_URL_BASE || maxMessageCount <= 0)) {
    return { enabled, status: 'error', maxMessageCount };
  }
  
  return { enabled, status: 'ok', maxMessageCount };
}

async function checkCDN(): Promise<{ enabled: boolean; status: 'ok' | 'error' }> {
  const enabled = process.env.CDN_ENABLED === 'true';
  
  if (enabled && !process.env.CDN_URL) {
    return { enabled, status: 'error' };
  }
  
  return { enabled, status: 'ok' };
}

export async function GET() {
  try {
    const startTime = process.hrtime();
    
    // Run health checks in parallel
    const [redisCheck, sharingCheck, cdnCheck] = await Promise.all([
      checkRedisConnection(),
      checkSharingFeature(),
      checkCDN()
    ]);
    
    const endTime = process.hrtime(startTime);
    const responseTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds
    
    // Determine overall status
    let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
    
    if (sharingCheck.status === 'error') {
      overallStatus = 'error';
    } else if (redisCheck.status === 'error' || cdnCheck.status === 'error') {
      overallStatus = 'degraded';
    }
    
    const healthCheck: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || process.env.npm_package_version || '0.1.0',
      features: {
        sharing: sharingCheck,
        ...(process.env.REDIS_ENABLED === 'true' && { redis: redisCheck }),
        ...(process.env.CDN_ENABLED === 'true' && { cdn: cdnCheck })
      }
    };
    
    // Add metrics in production
    if (process.env.NODE_ENV === 'production' && process.env.METRICS_ENABLED === 'true') {
      healthCheck.metrics = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
    }
    
    // Set appropriate status code
    const statusCode = overallStatus === 'error' ? 503 : overallStatus === 'degraded' ? 200 : 200;
    
    const response = NextResponse.json(healthCheck, { status: statusCode });
    
    // Add performance headers
    response.headers.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
    
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || process.env.npm_package_version || '0.1.0'
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}