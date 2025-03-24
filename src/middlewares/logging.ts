import type { Middleware } from '../core/retry';

export const loggingMiddleware: Middleware = async (task, context, next) => {
    console.log(`Attempt #${context.attempt + 1} started`);
    try {
      const result = await next();
      console.log(`Attempt #${context.attempt + 1} succeeded`);
      return result;
    } catch (err) {
      console.log(`Attempt #${context.attempt + 1} failed: ${err}`);
      throw err;
    }
  };