import { Retry } from './core/retry';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  strategy: BackoffStrategy;
  retryIf?: (error: unknown) => boolean;
}

export type RetryEvent = 
  | { type: 'attempt'; attempt: number; delayMs: number; error: unknown }
  | { type: 'success'; attempt: number; result: unknown }
  | { type: 'failure'; attempt: number; error: unknown };

export type BackoffStrategyFn = (attempt: number, initialDelayMs: number) => number;

export type BuiltInBackoffStrategy = 'fixed' | 'exponential' | 'jitter';

export type BackoffStrategy = BuiltInBackoffStrategy | string; // Allow custom strategies

export interface RetryWithTelemetry extends Retry {
  on(event: 'retry', listener: (event: RetryEvent) => void): void;
}