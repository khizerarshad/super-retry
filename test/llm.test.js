"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const llm_1 = require("../src/llm");
describe('LLM Error Handling', () => {
    test('identifies retriable errors', () => {
        const rateLimitError = { statusCode: 429 };
        const contentFilterError = { code: 'content_filter' };
        const temporaryError = { type: 'temporary' };
        const serverBusyError = new Error('server busy');
        expect((0, llm_1.isRetriableLLMError)(rateLimitError)).toBe(true);
        expect((0, llm_1.isRetriableLLMError)(contentFilterError)).toBe(true);
        expect((0, llm_1.isRetriableLLMError)(temporaryError)).toBe(true);
        expect((0, llm_1.isRetriableLLMError)(serverBusyError)).toBe(true);
    });
    test('ignores non-retriable errors', () => {
        const authError = { statusCode: 401 };
        const permanentError = new Error('invalid request');
        expect((0, llm_1.isRetriableLLMError)(authError)).toBe(false);
        expect((0, llm_1.isRetriableLLMError)(permanentError)).toBe(false);
    });
});
