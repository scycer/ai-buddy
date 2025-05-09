import { z } from 'zod';

/**
 * Defines the type of node: 'io' (with side effects) or 'pure' (no side effects)
 */
export type NodeType = 'io' | 'pure';

/**
 * Defines the structure of a node in the flow system
 * @template I - Input type, validated by inputSchema
 * @template O - Output type, validated by outputSchema
 */
export interface NodeDefinition<I, O> {
  /** Unique name of the node */
  name: string;
  /** Type of the node (io or pure) */
  type: NodeType;
  /** Schema for validating input */
  inputSchema: z.ZodType<I>;
  /** Schema for validating output */
  outputSchema: z.ZodType<O>;
  /** Function that executes the node's logic */
  execute: (input: I) => O;
}

/**
 * Defines a connection between nodes in a graph
 */
export interface NodeConnection {
  /** Source node identifier */
  fromNode: string;
  /** Target node identifier */
  toNode: string;
  /** Output identifier from source node */
  fromOutput: string;
  /** Input identifier to target node */
  toInput: string;
}

/**
 * Defines a graph of connected nodes
 */
export interface NodeGraph {
  /** Map of node identifiers to node definitions */
  nodes: Record<string, NodeDefinition<any, any>>;
  /** List of connections between nodes */
  connections: NodeConnection[];
}
