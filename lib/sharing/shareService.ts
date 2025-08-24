import type { ChatThread } from '@/lib/types';
import type { SharedChatData, ShareResult } from './types';
import { truncateMessages, validateMessagesForSharing } from './truncation';
import { sanitizeMessages, sanitizeThreadForSharing, validateSanitizedData } from './sanitization';
import { encodeShareData, isUrlTooLong } from './encoding';

export interface ShareServiceConfig {
  baseUrl?: string;
  maxUrlLength?: number;
}

/**
 * Main service for creating shareable URLs from chat threads
 */
export class ShareService {
  private config: ShareServiceConfig;

  constructor(config: ShareServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
      maxUrlLength: config.maxUrlLength || 8000,
    };
  }

  /**
   * Generates a shareable URL for a chat thread
   */
  async generateShareableUrl(thread: ChatThread, projectName?: string, context?: LogContext): Promise<ShareResult> {
    const startTime = Date.now();
    const shareId = Math.random().toString(36).substring(7);
    
    const logContext: LogContext = {
      ...context,
      feature: 'chat-sharing',
      shareId,
      threadId: thread.id,
      messageCount: thread.messages?.length || 0
    };

    try {
      logger.info('Starting share URL generation', logContext);

      // Validate input
      if (!thread || !thread.messages || thread.messages.length === 0) {
        logger.warn('Share attempt with empty conversation', logContext);
        return {
          success: false,
          error: 'Cannot share empty conversation'
        };
      }

      if (!validateMessagesForSharing(thread.messages)) {
        logger.warn('Share attempt with invalid message format', logContext);
        return {
          success: false,
          error: 'Invalid message format'
        };
      }

      // Process the thread for sharing
      const sharedData = this.processThreadForSharing(thread, projectName);

      // Validate sanitized data
      if (!validateSanitizedData(sharedData)) {
        logger.error('Data sanitization failed', logContext);
        return {
          success: false,
          error: 'Data sanitization failed'
        };
      }

      // Check URL length
      if (isUrlTooLong(sharedData, this.config.baseUrl, this.config.maxUrlLength)) {
        logger.warn('Share URL too long', {
          ...logContext,
          urlLength: encodeShareData(sharedData).length
        });
        return {
          success: false,
          error: 'Conversation too large to share. Try sharing a shorter conversation.'
        };
      }

      // Generate the shareable URL
      const encoded = encodeShareData(sharedData);
      const url = `${this.config.baseUrl}/shared/${encoded}`;
      
      const duration = Date.now() - startTime;

      // Log successful share creation
      logger.shareCreated(shareId, {
        ...logContext,
        messageCount: sharedData.messages.length,
        truncated: sharedData.truncated || false,
        originalMessageCount: sharedData.originalMessageCount,
        urlLength: encoded.length,
        projectName
      });

      logger.performance('share_url_generation', duration, logContext);

      // Send metrics to monitoring endpoint
      if (process.env.METRICS_ENABLED === 'true') {
        this.sendShareMetrics('share_created', {
          messageCount: sharedData.messages.length,
          truncated: sharedData.truncated || false,
          duration,
          projectName
        }).catch(error => {
          logger.warn('Failed to send share metrics', logContext, error);
        });
      }

      return {
        success: true,
        url
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.shareError('Failed to generate shareable URL', logContext, error as Error);
      logger.performance('share_url_generation_failed', duration, logContext);

      // Send error metrics
      if (process.env.METRICS_ENABLED === 'true') {
        this.sendShareMetrics('share_error', {
          error: (error as Error).message,
          duration
        }).catch(metricsError => {
          logger.warn('Failed to send error metrics', logContext, metricsError);
        });
      }

      return {
        success: false,
        error: 'Failed to generate shareable URL: ' + (error as Error).message
      };
    }
  }

  /**
   * Processes a chat thread for sharing (truncation + sanitization)
   */
  processThreadForSharing(thread: ChatThread, projectName?: string): SharedChatData {
    // Apply truncation logic
    const truncationResult = truncateMessages(thread.messages);
    
    // Sanitize the messages
    const sanitizedMessages = sanitizeMessages(truncationResult.messages);
    
    // Sanitize thread metadata
    const sanitizedThread = sanitizeThreadForSharing(thread, projectName);
    
    // Combine into shared data structure
    return {
      ...sanitizedThread,
      messages: sanitizedMessages,
      truncated: truncationResult.truncated,
      originalMessageCount: truncationResult.truncated ? truncationResult.originalCount : undefined,
      originalUserMessageCount: truncationResult.truncated ? truncationResult.originalUserMessageCount : undefined
    };
  }

  /**
   * Copies text to clipboard with comprehensive fallback handling
   */
  async copyToClipboard(text: string): Promise<boolean> {
    // Validate input
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to copyToClipboard');
      return false;
    }

    try {
      // Try modern clipboard API first (preferred method)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers or non-secure contexts
      return this.fallbackCopyToClipboard(text);
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // If clipboard API fails, try fallback
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback clipboard method with enhanced error handling
   */
  private fallbackCopyToClipboard(text: string): boolean {
    try {
      // Check if document.execCommand is available
      if (!document.execCommand) {
        console.warn('document.execCommand not available');
        return false;
      }

      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea invisible but accessible
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // Attempt to copy
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      if (!successful) {
        console.warn('document.execCommand copy failed');
      }
      
      return successful;
    } catch (error) {
      console.error('Fallback copy method failed:', error);
      return false;
    }
  }

  /**
   * Checks if clipboard functionality is available
   */
  isClipboardAvailable(): boolean {
    return !!(
      (navigator.clipboard && window.isSecureContext) || 
      document.execCommand
    );
  }

  /**
   * Gets user-friendly error message for clipboard failures
   */
  getClipboardErrorMessage(): string {
    if (!this.isClipboardAvailable()) {
      return 'Clipboard access is not available in this browser. Please copy the link manually.';
    }
    
    if (!window.isSecureContext) {
      return 'Clipboard access requires a secure connection (HTTPS). Please copy the link manually.';
    }
    
    return 'Clipboard access failed. Please copy the link manually.';
  }

  /**
   * Sends metrics to the monitoring endpoint
   */
  private async sendShareMetrics(event: string, data: any): Promise<void> {
    if (typeof window === 'undefined' || process.env.METRICS_ENABLED !== 'true') {
      return;
    }

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      // Silently fail metrics - don't impact user experience
      console.warn('Failed to send metrics:', error);
    }
  }
}