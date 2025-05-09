import { NodeGraph } from './types/nodeTypes';
import helloWorldNode from './nodes/helloWorld.io';

/**
 * Executes a node graph starting from a specified node
 * @param graph The node graph to execute
 * @param startNodeName The name of the node to start execution from
 * @returns The output of the starting node
 */
function executeGraph(graph: NodeGraph, startNodeName: string) {
  const startNode = graph.nodes[startNodeName];
  if (!startNode) {
    throw new Error(`Node '${startNodeName}' not found in the graph`);
  }

  // For simplicity, just execute the start node without handling connections
  const output = startNode.execute(undefined);
  console.log(`Node '${startNodeName}' output:`, output);
  return output;
}

// Create a simple graph with just the hello world node
const simpleGraph: NodeGraph = {
  nodes: {
    'helloWorld': helloWorldNode
  },
  connections: []
};

// Execute the graph
console.log('Executing graph...');
executeGraph(simpleGraph, 'helloWorld');