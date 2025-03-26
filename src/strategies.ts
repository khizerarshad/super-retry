import { BackoffStrategyFn } from './types';

// Initialize with built-in strategies
const strategyRegistry = new Map<string, BackoffStrategyFn>([
  ['fixed', (_, base) => base],
  ['exponential', (attempt, base) => base * Math.pow(2, attempt)],
  ['jitter', (attempt, base) => base * Math.pow(2, attempt) * (0.5 + Math.random())]
]);

export function registerStrategy(name: string, strategyFn: BackoffStrategyFn) {
  strategyRegistry.set(name, strategyFn);
}

export function getStrategy(name: string): BackoffStrategyFn {
  const strategy = strategyRegistry.get(name);
  if (!strategy) throw new Error(`Strategy "${name}" not registered`);
  return strategy;
}