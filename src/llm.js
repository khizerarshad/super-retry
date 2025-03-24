"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetriableLLMError = isRetriableLLMError;
function isRetriableLLMError(error) {
    const err = error;
    return ((err === null || err === void 0 ? void 0 : err.statusCode) === 429 ||
        (err === null || err === void 0 ? void 0 : err.code) === 'content_filter' ||
        (err === null || err === void 0 ? void 0 : err.type) === 'temporary' ||
        (typeof (err === null || err === void 0 ? void 0 : err.message) === 'string' && err.message.includes('server busy')));
}
