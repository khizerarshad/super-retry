// src/integrations/opentelemetry.ts
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { Retry } from '../core/retry';
import { RetryEvent } from '../types';

export function withOpenTelemetry(retry: Retry): void {
  retry.on('retry', (event) => {
    const activeSpan = trace.getActiveSpan();
    if (!activeSpan) return;

    switch (event.type) {
      case 'attempt':
        activeSpan.addEvent('retry_attempt', {
          attempt: event.attempt,
          delay_ms: event.delayMs,
          error: event.error?.toString(),
        });
        break;
      case 'success':
        activeSpan.addEvent('retry_success', { attempt: event.attempt });
        activeSpan.setStatus({ code: SpanStatusCode.OK });
        break;
      case 'failure':
        activeSpan.addEvent('retry_failure', {
          attempt: event.attempt,
          error: event.error?.toString(),
        });
        activeSpan.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: 'Retries exhausted' 
        });
        break;
    }
  });
}