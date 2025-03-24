"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPolicyFromYAML = loadPolicyFromYAML;
// src/policy.ts
const js_yaml_1 = __importDefault(require("js-yaml"));
function loadPolicyFromYAML(yamlContent) {
    const policy = js_yaml_1.default.load(yamlContent);
    // Add validation logic here
    if (!policy.maxAttempts || !policy.strategy) {
        throw new Error('Invalid policy: missing required fields');
    }
    return policy;
}
