import { NextRequest, NextResponse } from 'next/server';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    disposition: string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Only process CSP reports in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ message: 'CSP reporting disabled in development' }, { status: 200 });
    }

    const report: CSPReport = await request.json();
    const cspReport = report['csp-report'];
    
    if (!cspReport) {
      return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 });
    }

    // Log CSP violation
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'csp_violation',
      documentUri: cspReport['document-uri'],
      violatedDirective: cspReport['violated-directive'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    // In production, you would send this to your logging service
    // For now, we'll log to console with structured format
    if (process.env.LOG_LEVEL === 'info' || process.env.LOG_LEVEL === 'debug') {
      console.log('[CSP_VIOLATION]', JSON.stringify(logData));
    }

    // If Sentry is configured, send the violation there
    if (process.env.SENTRY_DSN && process.env.ERROR_TRACKING_ENABLED === 'true') {
      // In a real implementation, you would use Sentry SDK here
      console.log('[SENTRY_CSP]', JSON.stringify(logData));
    }

    // Check if this is a sharing-related violation
    const isShareRelated = cspReport['document-uri'].includes('/shared/') || 
                          cspReport['source-file'].includes('sharing');
    
    if (isShareRelated) {
      console.log('[SHARE_CSP_VIOLATION]', JSON.stringify({
        ...logData,
        feature: 'chat-sharing'
      }));
    }

    return NextResponse.json({ message: 'CSP report received' }, { status: 204 });
    
  } catch (error) {
    console.error('[CSP_REPORT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process CSP report' }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}