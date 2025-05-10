import { z } from 'zod';
import { NodeDefinition } from '../types/nodeTypes';

/**
 * A simple HelloWorld node that outputs "Hello, world!"
 * This is an IO node as it produces output without requiring input.
 */
const helloWorldNode: NodeDefinition<void, string> = {
  name: 'helloWorld',
  type: 'io',
  inputSchema: z.void(),
  outputSchema: z.string(),
  execute: () => 'Hello, world!'
};

export default helloWorldNode;

// In-source test suite for the helloWorld node
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('helloWorld node', () => {
    it('should return the correct greeting', () => {
      const result = helloWorldNode.execute();
      expect(result).toBe('Hello, world!');
    });

    it('should have the correct node type', () => {
      expect(helloWorldNode.type).toBe('io');
    });

    it('should have the correct name', () => {
      expect(helloWorldNode.name).toBe('helloWorld');
    });

    it('should have void input schema', () => {
      // Instead of comparing schema objects directly, check valid inputs
      expect(() => helloWorldNode.inputSchema.parse(undefined)).not.toThrow();
      expect(() => helloWorldNode.inputSchema.parse('string')).toThrow();
    });

    it('should have string output schema', () => {
      // Test that the schema validates strings correctly
      expect(() => helloWorldNode.outputSchema.parse('Hello')).not.toThrow();
      expect(() => helloWorldNode.outputSchema.parse(123)).toThrow();
    });
  });
}
