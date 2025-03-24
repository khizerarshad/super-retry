// src/policy.ts
import yaml from 'js-yaml';
import { RetryOptions } from './types';

export function loadPolicyFromYAML(yamlContent: string): RetryOptions {
  const policy = yaml.load(yamlContent) as RetryOptions;
  
  // Add validation logic here
  if (!policy.maxAttempts || !policy.strategy) {
    throw new Error('Invalid policy: missing required fields');
  }
  
  return policy;
}