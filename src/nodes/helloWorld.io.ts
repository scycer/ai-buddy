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
