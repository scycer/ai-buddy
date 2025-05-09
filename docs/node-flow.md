# Node Flow System Documentation

## Overview

The Node Flow System is a TypeScript-based framework for creating modular, reusable functions (nodes) that can be composed together in a graph. Each node is self-contained and is classified as either "IO" (with side effects) or "Pure" (without side effects).

## Core Concepts

### Nodes

A node is a self-contained function with:
- Well-defined inputs and outputs, validated by Zod schemas
- A clear designation as either "IO" or "Pure"
- A unique name

#### Naming Convention

Nodes follow a specific file naming convention:
```
<node-name>.<type>.ts
```

Where:
- `<node-name>` is the name of the node (e.g., `helloWorld`)
- `<type>` is either `io` or `pure`

### Node Types

- **IO Nodes**: Perform operations with side effects (e.g., file I/O, network requests, console output)
- **Pure Nodes**: Perform operations without side effects, always producing the same output for the same input

### Node Graph

Nodes can be connected together in a graph, where:
- Each node is identified by its unique name
- Connections define how data flows between nodes
- The graph can be executed starting from any node

## System Architecture

### NodeDefinition Interface

The core interface for defining nodes:

```typescript
interface NodeDefinition<I, O> {
  name: string;
  type: NodeType; // 'io' | 'pure'
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  execute: (input: I) => O;
}
```

### NodeGraph Interface

Defines how nodes are connected:

```typescript
interface NodeGraph {
  nodes: Record<string, NodeDefinition<any, any>>;
  connections: NodeConnection[];
}

interface NodeConnection {
  fromNode: string;
  toNode: string;
  fromOutput: string;
  toInput: string;
}
```

## Usage

### Creating a Node

1. Define your node's input and output types
2. Create a Zod schema for validation
3. Implement the node's execution logic
4. Export the node

Example:

```typescript
// helloWorld.io.ts
import { z } from 'zod';
import { NodeDefinition } from '../types/nodeTypes';

const helloWorldNode: NodeDefinition<void, string> = {
  name: 'helloWorld',
  type: 'io',
  inputSchema: z.void(),
  outputSchema: z.string(),
  execute: () => 'Hello, world!'
};

export default helloWorldNode;
```

### Creating a Graph

1. Import your nodes
2. Define connections between nodes
3. Create a graph object

Example:

```typescript
import { NodeGraph } from './types/nodeTypes';
import helloWorldNode from './nodes/helloWorld.io';

const simpleGraph: NodeGraph = {
  nodes: {
    'helloWorld': helloWorldNode
  },
  connections: []
};
```

### Executing a Graph

Use the `executeGraph` function to run a graph starting from a specified node:

```typescript
function executeGraph(graph: NodeGraph, startNodeName: string) {
  const startNode = graph.nodes[startNodeName];
  if (!startNode) {
    throw new Error(`Node '${startNodeName}' not found in the graph`);
  }

  // Execute the starting node
  const output = startNode.execute(undefined);
  return output;
}

// Execute the graph
executeGraph(simpleGraph, 'helloWorld');
```

## Development Workflow

1. Define requirements for a node (input/output schemas and acceptance criteria)
2. Determine if the node should be "IO" or "Pure"
3. Implement the node in its own file following the naming convention
4. Test the node independently
5. Integrate the node into a graph

## Future Enhancements

- Expand the graph executor to support connections between nodes
- Add error handling and validation during graph execution
- Implement data transformation between connected nodes
- Support for parallel execution of independent nodes
- Visualization of node graphs
