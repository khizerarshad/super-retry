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
exports.Retry = void 0;
const events_1 = require("events");
const strategies_1 = require("../strategies");
class Retry {
    constructor(options) {
        this.attempts = 0;
        this.middlewares = [];
        this.emitter = new events_1.EventEmitter();
        this.options = options;
    }
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    execute(originalTask) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTask = originalTask;
            for (let i = this.middlewares.length - 1; i >= 0; i--) {
                const mw = this.middlewares[i];
                const next = currentTask;
                currentTask = () => mw(next, { attempt: this.attempts, error: undefined }, () => next() // TypeScript now understands this returns Promise<T>
                );
            }
            while (true) {
                try {
                    return yield currentTask();
                }
                catch (err) {
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
                    yield new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        });
    }
    shouldStop(err) {
        const exceededAttempts = this.attempts >= this.options.maxAttempts;
        const shouldNotRetry = this.options.retryIf
            ? !this.options.retryIf(err)
            : false;
        return exceededAttempts || shouldNotRetry;
    }
    calculateDelay() {
        const { strategy, initialDelayMs } = this.options;
        // Check for built-in strategies first
        switch (strategy) {
            case 'fixed':
                return initialDelayMs;
            case 'exponential':
                return initialDelayMs * (2 ** (this.attempts - 1));
            case 'jitter':
                return initialDelayMs * (2 ** (this.attempts - 1)) * (0.5 + Math.random());
            default:
                // Check for custom strategy
                const customStrategy = (0, strategies_1.getStrategy)(strategy);
                if (customStrategy) {
                    return customStrategy(this.attempts, initialDelayMs);
                }
                throw new Error(`Unknown strategy: ${strategy}`);
        }
    }
}
exports.Retry = Retry;
