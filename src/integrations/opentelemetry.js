"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withOpenTelemetry = withOpenTelemetry;
// src/integrations/opentelemetry.ts
const api_1 = require("@opentelemetry/api");
function withOpenTelemetry(retry) {
    retry.on('retry', (event) => {
        var _a, _b;
        const activeSpan = api_1.trace.getActiveSpan();
        if (!activeSpan)
            return;
        switch (event.type) {
            case 'attempt':
                activeSpan.addEvent('retry_attempt', {
                    attempt: event.attempt,
                    delay_ms: event.delayMs,
                    error: (_a = event.error) === null || _a === void 0 ? void 0 : _a.toString(),
                });
                break;
            case 'success':
                activeSpan.addEvent('retry_success', { attempt: event.attempt });
                activeSpan.setStatus({ code: api_1.SpanStatusCode.OK });
                break;
            case 'failure':
                activeSpan.addEvent('retry_failure', {
                    attempt: event.attempt,
                    error: (_b = event.error) === null || _b === void 0 ? void 0 : _b.toString(),
                });
                activeSpan.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: 'Retries exhausted'
                });
                break;
        }
    });
}
