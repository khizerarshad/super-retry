import { isRetriableLLMError } from '../src/llm';

describe('LLM Error Handling', () => {
  test('identifies retriable errors', () => {
    const rateLimitError = { statusCode: 429 };
    const contentFilterError = { code: 'content_filter' };
    const temporaryError = { type: 'temporary' };
    const serverBusyError = new Error('server busy');

    expect(isRetriableLLMError(rateLimitError)).toBe(true);
    expect(isRetriableLLMError(contentFilterError)).toBe(true);
    expect(isRetriableLLMError(temporaryError)).toBe(true);
    expect(isRetriableLLMError(serverBusyError)).toBe(true);
  });

  test('ignores non-retriable errors', () => {
    const authError = { statusCode: 401 };
    const permanentError = new Error('invalid request');
    
    expect(isRetriableLLMError(authError)).toBe(false);
    expect(isRetriableLLMError(permanentError)).toBe(false);
  });
});