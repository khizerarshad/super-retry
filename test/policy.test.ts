// test/policy.test.ts
import { loadPolicyFromYAML } from '../src/policy';

test('loads valid YAML policy', () => {
  const yaml = `
    maxAttempts: 3
    initialDelayMs: 100
    strategy: exponential
  `;
  
  const policy = loadPolicyFromYAML(yaml);
  expect(policy).toEqual({
    maxAttempts: 3,
    initialDelayMs: 100,
    strategy: 'exponential'
  });
});