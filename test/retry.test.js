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
const retry_1 = require("../src/core/retry");
const strategies_1 = require("../src/strategies");
describe('Retry', () => {
    // Test 1: Success on first attempt
    test('should succeed without retries', () => __awaiter(void 0, void 0, void 0, function* () {
        const retry = new retry_1.Retry({ maxAttempts: 3, initialDelayMs: 100, strategy: 'fixed' });
        const result = yield retry.execute(() => Promise.resolve(42));
        expect(result).toBe(42);
    }));
    // Test 2: Retry with fixed backoff
    test('should retry 2 times with fixed delay', () => __awaiter(void 0, void 0, void 0, function* () {
        const start = Date.now();
        let attempts = 0;
        const retry = new retry_1.Retry({ maxAttempts: 3, initialDelayMs: 100, strategy: 'fixed' });
        try {
            yield retry.execute(() => __awaiter(void 0, void 0, void 0, function* () {
                attempts++;
                if (attempts < 3)
                    throw new Error('Flaky');
                return 'success';
            }));
        }
        catch (_a) { }
        const duration = Date.now() - start;
        expect(attempts).toBe(3); // 1 initial + 2 retries
        expect(duration).toBeGreaterThanOrEqual(200); // ~100ms * 2 delays
    }));
    // Test 3: Exponential backoff
    test('should use exponential delays', () => __awaiter(void 0, void 0, void 0, function* () {
        const retry = new retry_1.Retry({
            maxAttempts: 3,
            initialDelayMs: 100,
            strategy: 'exponential'
        });
        const delays = [];
        // Mock setTimeout to execute the callback IMMEDIATELY
        const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
            delays.push(delay);
            fn(); // <--- KEY FIX: Trigger the callback right away
            return 0;
        });
        try {
            yield retry.execute(() => Promise.reject(new Error('Fail')));
        }
        catch (_a) { }
        expect(delays).toEqual([100, 200]);
        spy.mockRestore();
    }));
    // Test 4: Randomness test
    test('jitter strategy adds randomness', () => __awaiter(void 0, void 0, void 0, function* () {
        const retry = new retry_1.Retry({
            maxAttempts: 3,
            initialDelayMs: 100,
            strategy: 'jitter'
        });
        const delays = [];
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // Mock randomness
        const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
            delays.push(delay);
            fn();
            return 0;
        });
        try {
            yield retry.execute(() => Promise.reject(new Error('Fail')));
        }
        catch (_a) { }
        // Jitter formula: initialDelay * 2^(attempt-1) * (0.5 + 0.5) = initialDelay * 2^(attempt-1)
        expect(delays).toEqual([100 * 1 * 1, 100 * 2 * 1]); // 100, 200
        spy.mockRestore();
        jest.spyOn(global.Math, 'random').mockRestore();
    }));
});
describe('Retry with Custom Strategies', () => {
    // Cleanup registered strategies after each test
    afterEach(() => {
        // Clear all registered strategies
        // (Assuming you add a `clearStrategies()` function in strategies.ts)
    });
    test('should use custom Fibonacci strategy', () => __awaiter(void 0, void 0, void 0, function* () {
        // Register a Fibonacci backoff strategy
        (0, strategies_1.registerStrategy)('fibonacci', (attempt, initialDelay) => {
            const fibSequence = [1, 1, 2, 3, 5]; // Fibonacci sequence
            return fibSequence[attempt - 1] * initialDelay; // attempt starts at 1
        });
        const retry = new retry_1.Retry({
            maxAttempts: 5,
            initialDelayMs: 100,
            strategy: 'fibonacci', // Use custom strategy
        });
        const delays = [];
        const spy = jest.spyOn(global, 'setTimeout').mockImplementation((fn, delay) => {
            delays.push(delay);
            fn();
            return 0;
        });
        try {
            yield retry.execute(() => Promise.reject(new Error('Fail')));
        }
        catch (_a) { }
        expect(delays).toEqual([100, 100, 200, 300]); // 100*1, 100*1, 100*2, 100*3
        spy.mockRestore();
    }));
});
