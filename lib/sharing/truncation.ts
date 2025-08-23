import type { ChatMessage } from '@/lib/types';
import type { TruncationConfig, TruncationResult } from './types';

export const DEFAULT_TRUNCATION_CONFIG: TruncationConfig = {
  maxMessages: 20,
  preserveOrder: true,
  includeMetadata: true,
};

/**
 * Truncates messages to the last N messages while preserving complete conversation turns
 */
export function truncateMessages(
  messages: ChatMessage[], 
  config: TruncationConfig = DEFAULT_TRUNCATION_CONFIG
): TruncationResult {
  const originalCount = messages.length;
  
  if (originalCount <= config.maxMessages) {
    return {
      messages,
      truncated: false,
      originalCount
    };
  }
  
  // Try to preserve complete conversation turns
  const selectedMessages = truncatePreservingTurns(messages, config.maxMessages);
  
  return {
    messages: selectedMessages,
    truncated: true,
    originalCount
  };
}

/**
 * Truncates messages while trying to preserve complete conversation turns
 * (user message + all associated assistant responses)
 */
function truncatePreservingTurns(messages: ChatMessage[], maxMessages: number): ChatMessage[] {
  // If we can fit all messages, return them all
  if (messages.length <= maxMessages) {
    return messages;
  }
  
  // Group messages into conversation turns
  const turns: ChatMessage[][] = [];
  let currentTurn: ChatMessage[] = [];
  
  for (const message of messages) {
    if (message.role === 'user') {
      // Start a new turn
      if (currentTurn.length > 0) {
        turns.push(currentTurn);
      }
      currentTurn = [message];
    } else if (message.role === 'assistant') {
      // Add to current turn
      currentTurn.push(message);
    }
  }
  
  // Don't forget the last turn
  if (currentTurn.length > 0) {
    turns.push(currentTurn);
  }
  
  // Select the last complete turns that fit within maxMessages
  let selectedMessages: ChatMessage[] = [];
  let messageCount = 0;
  
  // Start from the end and work backwards
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    if (messageCount + turn.length <= maxMessages) {
      selectedMessages = [...turn, ...selectedMessages];
      messageCount += turn.length;
    } else {
      // If we can't fit this complete turn, stop here
      break;
    }
  }
  
  // If we couldn't fit any complete turns, fall back to simple truncation
  if (selectedMessages.length === 0) {
    selectedMessages = messages.slice(-maxMessages);
  }
  
  return selectedMessages;
}

/**
 * Validates that messages array is suitable for sharing
 */
export function validateMessagesForSharing(messages: ChatMessage[]): boolean {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0) return false;
  
  // Check that all messages have required fields
  return messages.every(msg => 
    msg.role && 
    typeof msg.content === 'string' && 
    msg.content.trim().length > 0
  );
}