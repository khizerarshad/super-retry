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
// test/middleware.test.ts
const retry_1 = require("../src/core/retry");
describe('Middleware System', () => {
    test('should execute middleware in order', () => __awaiter(void 0, void 0, void 0, function* () {
        const calls = [];
        const retry = new retry_1.Retry({
            maxAttempts: 2,
            initialDelayMs: 10,
            strategy: 'fixed'
        }).use((task, ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
            calls.push(`pre (attempt ${ctx.attempt})`);
            try {
                const result = yield next();
                calls.push(`post-success (attempt ${ctx.attempt})`);
                return result;
            }
            catch (err) {
                calls.push(`post-error (attempt ${ctx.attempt})`);
                throw err;
            }
        }));
        try {
            yield retry.execute(() => __awaiter(void 0, void 0, void 0, function* () {
                calls.push('execute');
                throw new Error('Fail');
            }));
        }
        catch (_a) { }
        expect(calls).toEqual([
            'pre (attempt 0)', 'execute',
            'post-error (attempt 0)',
            'pre (attempt 1)', 'execute',
            'post-error (attempt 1)'
        ]);
    }));
});
