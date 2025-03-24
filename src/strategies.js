"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStrategy = registerStrategy;
exports.getStrategy = getStrategy;
const strategies = new Map();
function registerStrategy(name, strategyFn) {
    strategies.set(name, strategyFn);
}
function getStrategy(name) {
    return strategies.get(name);
}
