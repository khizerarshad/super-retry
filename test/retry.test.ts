import { Retry } from '../src/core/retry';
import { BackoffStrategy } from '../src/types';
import { registerStrategy } from '../src/strategies';

describe('Retry', () => {
  // Test 1: Success on first attempt
  test('should succeed without retries', async () => {
    const retry = new Retry({ maxAttempts: 3, initialDelayMs: 100, strategy: 'fixed' });
    const result = await retry.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  // Test 2: Retry with fixed backoff
  test('should retry 2 times with fixed delay', async () => {
    const start = Date.now();
    let attempts = 0;
    
    const retry = new Retry({ maxAttempts: 3, initialDelayMs: 100, strategy: 'fixed' });
    
    try {
      await retry.execute(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Flaky');
        return 'success';
      });
    } catch {}

    const duration = Date.now() - start;
    expect(attempts).toBe(3); // 1 initial + 2 retries
    expect(duration).toBeGreaterThanOrEqual(200); // ~100ms * 2 delays
  });

  // Test 3: Exponential backoff
  test('should use exponential delays', async () => {
    const retry = new Retry({ 
      maxAttempts: 3, 
      initialDelayMs: 100, 
      strategy: 'exponential' 
    });
    const delays: number[] = [];
    
    // Mock setTimeout to execute the callback IMMEDIATELY
    const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay!);
      fn(); // <--- KEY FIX: Trigger the callback right away
      return 0 as unknown as NodeJS.Timeout;
    });
  
    try {
      await retry.execute(() => Promise.reject(new Error('Fail')));
    } catch {}
  
    expect(delays).toEqual([100, 200]); 
    spy.mockRestore();
  });
  // Test 4: Randomness test
  test('jitter strategy adds randomness', async () => {
    const retry = new Retry({ 
      maxAttempts: 3, 
      initialDelayMs: 100, 
      strategy: 'jitter' 
    });
    const delays: number[] = [];
    
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // Mock randomness
    const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay!);
      fn();
      return 0 as unknown as NodeJS.Timeout;
    });
  
    try {
      await retry.execute(() => Promise.reject(new Error('Fail')));
    } catch {}
  
    // Jitter formula: initialDelay * 2^(attempt-1) * (0.5 + 0.5) = initialDelay * 2^(attempt-1)
    expect(delays).toEqual([100 * 1 * 1, 100 * 2 * 1]); // 100, 200
    spy.mockRestore();
    jest.spyOn(global.Math, 'random').mockRestore();
  });


});

describe('Retry with Custom Strategies', () => {
  // Cleanup registered strategies after each test
  afterEach(() => {
    // Clear all registered strategies
    // (Assuming you add a `clearStrategies()` function in strategies.ts)
  });

  test('should use custom Fibonacci strategy', async () => {
    // Register a Fibonacci backoff strategy
    registerStrategy('fibonacci', (attempt, initialDelay) => {
      const fibSequence = [1, 1, 2, 3, 5]; // Fibonacci sequence
      return fibSequence[attempt - 1] * initialDelay; // attempt starts at 1
    });

    const retry = new Retry({
      maxAttempts: 5,
      initialDelayMs: 100,
      strategy: 'fibonacci', // Use custom strategy
    });

    const delays: number[] = [];
    const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
      delays.push(delay!);
      fn();
      return 0 as unknown as NodeJS.Timeout;
    });

    try {
      await retry.execute(() => Promise.reject(new Error('Fail')));
    } catch {}

    expect(delays).toEqual([100, 100, 200, 300]); // 100*1, 100*1, 100*2, 100*3
    spy.mockRestore();
  });
});