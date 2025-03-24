// test/middleware.test.ts
import { Retry } from '../src/core/retry';

describe('Middleware System', () => {
  test('should execute middleware in order', async () => {
    const calls: string[] = [];
    
    const retry = new Retry({ 
      maxAttempts: 2, 
      initialDelayMs: 10, 
      strategy: 'fixed' 
    }).use(async (task, ctx, next) => {
      calls.push(`pre (attempt ${ctx.attempt})`);
      try {
        const result = await next();
        calls.push(`post-success (attempt ${ctx.attempt})`);
        return result;
      } catch (err) {
        calls.push(`post-error (attempt ${ctx.attempt})`);
        throw err;
      }
    });

    try {
      await retry.execute(async () => {
        calls.push('execute');
        throw new Error('Fail');
      });
    } catch {}

    expect(calls).toEqual([
      'pre (attempt 0)', 'execute',
      'post-error (attempt 0)',
      'pre (attempt 1)', 'execute',
      'post-error (attempt 1)'
    ]);
  });
});