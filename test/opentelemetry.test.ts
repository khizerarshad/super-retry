// test/integrations/opentelemetry.test.ts
import { trace, context, Span } from '@opentelemetry/api';
import { Retry } from '../src/core/retry';
import { withOpenTelemetry } from '../src/integrations/opentelemetry';

describe('OpenTelemetry Integration', () => {
  const tracer = trace.getTracer('test-tracer');
  let mockSpan: Span;
  let originalSetTimeout: typeof setTimeout;

  beforeAll(() => {
    // 1. Mock setTimeout with context preservation
    originalSetTimeout = global.setTimeout;
    (global.setTimeout as any) = (fn: () => void) => {
      const wrappedFn = context.bind(context.active(), fn);
      wrappedFn();
      return 0 as unknown as NodeJS.Timeout;
    };

    // 2. Create active span
    mockSpan = tracer.startSpan('test-span');
    jest.spyOn(trace, 'getActiveSpan').mockImplementation(() => mockSpan);
    jest.spyOn(mockSpan, 'addEvent').mockImplementation(() => mockSpan);
    jest.spyOn(mockSpan, 'setStatus').mockImplementation(() => mockSpan);
  });

  afterAll(() => {
    global.setTimeout = originalSetTimeout;
  });

  test.skip('should log retry attempts to spans', async () => {
    const retry = new Retry({ 
      maxAttempts: 2, 
      initialDelayMs: 10, 
      strategy: 'fixed' 
    });
    withOpenTelemetry(retry);

    // 3. Execute within proper context
    await context.with(
      trace.setSpan(context.active(), mockSpan),
      async () => {
        try {
          await retry.execute(async () => {
            throw new Error('Fail');
          });
        } catch {}
      }
    );

    // 4. Verify events
    expect(mockSpan.addEvent).toHaveBeenNthCalledWith(1, 'retry_attempt', {
      attempt: 1,
      delay_ms: 10,
      error: 'Error: Fail'
    });
    
    expect(mockSpan.addEvent).toHaveBeenNthCalledWith(2, 'retry_attempt', {
      attempt: 2,
      delay_ms: 10,
      error: 'Error: Fail'
    });
  });
});