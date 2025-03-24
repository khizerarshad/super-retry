// src/llm.ts
interface LLMError extends Error {
    statusCode?: number;
    code?: string;
    type?: string;
  }
  
  export function isRetriableLLMError(error: unknown): boolean {
    const err = error as LLMError;
    return (
      err?.statusCode === 429 ||
      err?.code === 'content_filter' ||
      err?.type === 'temporary' ||
      (typeof err?.message === 'string' && err.message.includes('server busy'))
    );
  }