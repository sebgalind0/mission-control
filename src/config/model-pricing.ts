/**
 * Model Pricing Configuration
 * 
 * All costs are per million tokens (M).
 * Update these rates when providers change pricing.
 */

export interface ModelPricing {
  input: number;        // Cost per 1M input tokens
  output: number;       // Cost per 1M output tokens
  cacheRead: number;    // Cost per 1M cache read tokens
  cacheWrite: number;   // Cost per 1M cache write tokens
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Anthropic Claude
  'claude-opus-4-6': {
    input: 15.00,
    output: 75.00,
    cacheRead: 1.50,
    cacheWrite: 18.75,
  },
  'claude-sonnet-4-5': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheWrite: 3.75,
  },
  'claude-sonnet-3-5': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheWrite: 3.75,
  },
  'claude-haiku-3-5': {
    input: 0.80,
    output: 4.00,
    cacheRead: 0.08,
    cacheWrite: 1.00,
  },
  
  // OpenAI GPT-4
  'gpt-4-turbo': {
    input: 10.00,
    output: 30.00,
    cacheRead: 0.00,
    cacheWrite: 0.00,
  },
  'gpt-4': {
    input: 30.00,
    output: 60.00,
    cacheRead: 0.00,
    cacheWrite: 0.00,
  },
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
    cacheRead: 0.00,
    cacheWrite: 0.00,
  },
  
  // Default fallback (Claude Sonnet rates)
  'default': {
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheWrite: 3.75,
  },
};

/**
 * Calculate cost for a set of token usage
 */
export function calculateCost(
  model: string,
  tokens: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
  }
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
  
  const inputCost = (tokens.input || 0) * pricing.input / 1_000_000;
  const outputCost = (tokens.output || 0) * pricing.output / 1_000_000;
  const cacheReadCost = (tokens.cacheRead || 0) * pricing.cacheRead / 1_000_000;
  const cacheWriteCost = (tokens.cacheWrite || 0) * pricing.cacheWrite / 1_000_000;
  
  return inputCost + outputCost + cacheReadCost + cacheWriteCost;
}

/**
 * Get pricing info for display
 */
export function getPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] || MODEL_PRICING['default'];
}
