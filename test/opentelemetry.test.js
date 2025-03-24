"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/integrations/opentelemetry.test.ts
const api_1 = require("@opentelemetry/api");
const retry_1 = require("../src/core/retry");
const opentelemetry_1 = require("../src/integrations/opentelemetry");
describe('OpenTelemetry Integration', () => {
    const tracer = api_1.trace.getTracer('test-tracer');
    let mockSpan;
    let originalSetTimeout;
    beforeAll(() => {
        // 1. Mock setTimeout with context preservation
        originalSetTimeout = global.setTimeout;
        global.setTimeout = (fn) => {
            const wrappedFn = api_1.context.bind(api_1.context.active(), fn);
            wrappedFn();
            return 0;
        };
        // 2. Create active span
        mockSpan = tracer.startSpan('test-span');
        jest.spyOn(api_1.trace, 'getActiveSpan').mockImplementation(() => mockSpan);
        jest.spyOn(mockSpan, 'addEvent').mockImplementation(() => mockSpan);
        jest.spyOn(mockSpan, 'setStatus').mockImplementation(() => mockSpan);
    });
    afterAll(() => {
        global.setTimeout = originalSetTimeout;
    });
    test.skip('should log retry attempts to spans', () => __awaiter(void 0, void 0, void 0, function* () {
        const retry = new retry_1.Retry({
            maxAttempts: 2,
            initialDelayMs: 10,
            strategy: 'fixed'
        });
        (0, opentelemetry_1.withOpenTelemetry)(retry);
        // 3. Execute within proper context
        yield api_1.context.with(api_1.trace.setSpan(api_1.context.active(), mockSpan), () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield retry.execute(() => __awaiter(void 0, void 0, void 0, function* () {
                    throw new Error('Fail');
                }));
            }
            catch (_a) { }
        }));
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
    }));
});
