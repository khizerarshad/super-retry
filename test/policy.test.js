"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// test/policy.test.ts
const policy_1 = require("../src/policy");
test('loads valid YAML policy', () => {
    const yaml = `
    maxAttempts: 3
    initialDelayMs: 100
    strategy: exponential
  `;
    const policy = (0, policy_1.loadPolicyFromYAML)(yaml);
    expect(policy).toEqual({
        maxAttempts: 3,
        initialDelayMs: 100,
        strategy: 'exponential'
    });
});
