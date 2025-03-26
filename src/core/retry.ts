import { EventEmitter } from 'events';
import { 
  RetryEvent, 
  BuiltInBackoffStrategy, 
  BackoffStrategy 
} from '../types';
import { getStrategy } from '../strategies';

interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  strategy: BackoffStrategy;
  retryIf?: (error: unknown) => boolean;
}

export type Middleware<T = unknown> = (
    task: () => Promise<T>,
    context: { attempt: number; error?: unknown },
    next: () => Promise<T> // Explicit return type
  ) => Promise<T>;

export class Retry {
  private attempts = 0;
  private middlewares: Middleware[] = [];
  private emitter = new EventEmitter();
  private options: RetryOptions;

  constructor(options: RetryOptions) {
    this.options = options;
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  on(event: 'retry', listener: (event: RetryEvent) => void) {
    this.emitter.on(event, listener);
  }

  async execute<T>(originalTask: () => Promise<T>): Promise<T> {
    let currentTask = originalTask;

    for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const mw = this.middlewares[i] as Middleware<T>;
        const next = currentTask;
        currentTask = () => mw(
          next,
          { attempt: this.attempts, error: undefined },
          () => next() // TypeScript now understands this returns Promise<T>
        );
      }

    while (true) {
      try {
        return await currentTask();
      } catch (err) {
        this.attempts++;
        
        // Check exit conditions
        if (this.shouldStop(err)) {
          throw err;
        }

        // Emit events
        const delay = this.calculateDelay();
        this.emitter.emit('retry', { 
          type: 'attempt', 
          attempt: this.attempts,
          delayMs: delay,
          error: err 
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private shouldStop(err: unknown): boolean {
    const exceededAttempts = this.attempts >= this.options.maxAttempts;
    const shouldNotRetry = this.options.retryIf 
      ? !this.options.retryIf(err)
      : false;
    
    return exceededAttempts || shouldNotRetry;
  }

  private calculateDelay(): number {
    const { strategy, initialDelayMs } = this.options;
    
    // Handle string-based strategies (built-in or registered)
    if (typeof strategy === 'string') {
      const strategyFn = getStrategy(strategy);
      return strategyFn(this.attempts, initialDelayMs);
    }
  
    // Handle direct strategy functions
    if (typeof strategy === 'function') {
      return strategy(this.attempts, initialDelayMs);
    }
  
    throw new Error(`Invalid strategy type: ${typeof strategy}`);
  }
}