import { BackoffStrategyFn } from './types';

const strategies = new Map<string, BackoffStrategyFn>();

export function registerStrategy(name: string, strategyFn: BackoffStrategyFn) {
  strategies.set(name, strategyFn);
}

export function getStrategy(name: string): BackoffStrategyFn | undefined {
  return strategies.get(name);
}