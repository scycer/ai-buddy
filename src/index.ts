import { NodeGraph } from './types/nodeTypes';
import helloWorldNode from './nodes/helloWorld.io';
import openAICompletionNode from './nodes/openAICompletion.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Executes a node graph starting from a specified node
 * @param graph The node graph to execute
 * @param startNodeName The name of the node to start execution from
 * @param input Optional input data for the starting node
 * @returns The output of the starting node
 */
async function executeGraph(graph: NodeGraph, startNodeName: string, input?: any) {
  const startNode = graph.nodes[startNodeName];
  if (!startNode) {
    throw new Error(`Node '${startNodeName}' not found in the graph`);
  }

  // Execute the starting node with provided input
  console.log(`Executing node '${startNodeName}'...`);
  const output = await startNode.execute(input);
  console.log(`Node '${startNodeName}' output:`, output);
  return output;
}

// Create a graph with our nodes
const nodeGraph: NodeGraph = {
  nodes: {
    'helloWorld': helloWorldNode,
    'openAICompletion': openAICompletionNode
  },
  connections: []
};

// Run different examples based on command line arguments
async function main() {
  console.log('Node Flow System - Example Runner');
  console.log('---------------------------------');
  
  // Example 1: Simple Hello World Node
  if (process.argv.includes('--hello') || process.argv.length === 2) {
    console.log('\nExample 1: Hello World Node');
    await executeGraph(nodeGraph, 'helloWorld');
  }
  
  // Example 2: OpenAI Completion Node
  if (process.argv.includes('--openai') || process.argv.length === 2) {
    if (!process.env.OPENAI_API_KEY) {
      console.error('\nError: OPENAI_API_KEY is not set. Please add it to your .env file.');
      console.error('Create a .env file based on .env.example and add your API key.');
    } else {
      console.log('\nExample 2: OpenAI Completion Node');
      const input = {
        prompt: 'Explain what a node flow system is in one sentence.',
        temperature: 0.7,
        systemPrompt: 'You are a concise technical assistant.'
      };
      
      try {
        await executeGraph(nodeGraph, 'openAICompletion', input);
      } catch (error) {
        console.error('Error executing OpenAI completion node:', error.message);
      }
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main execution:', error);
  process.exit(1);
});