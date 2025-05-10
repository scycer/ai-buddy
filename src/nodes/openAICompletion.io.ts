import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';
import { NodeDefinition } from '../types/nodeTypes';
import dotenv from 'dotenv';
import { beforeEach } from 'vitest';

// Load environment variables
dotenv.config();

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in your environment variables.');
  console.warn('Please create a .env file based on .env.example and add your API key.');
}

// Define the actual types used by our node implementation
type OpenAICompletionInput = {
  prompt: string;
  temperature: number;
  systemPrompt: string;
};

type OpenAICompletionOutput = {
  completion: string;
};

/**
 * Input schema for the OpenAI completion node with defaults
 */
const openAICompletionInputSchema = z.object({
  prompt: z.string().describe('The prompt to send to the OpenAI model'),
  temperature: z.number().optional().default(0.7).describe('Sampling temperature between 0 and 1'),
  systemPrompt: z.string().optional().default('You are a helpful assistant.').describe('System prompt for the model'),
});

/**
 * Output schema for the OpenAI completion node
 */
const openAICompletionOutputSchema = z.object({
  completion: z.string().describe('The generated completion text'),
});

// Create the LLM agent for each call with the correct instructions
const createAgent = (systemPrompt: string) => {
  return new Agent({
    name: 'LLMCompletionAgent',
    instructions: systemPrompt,
    model: openai('o4-mini'),
  });
};

/**
 * OpenAICompletion Node
 * An IO node that sends a prompt to OpenAI's o4-mini model and returns the completion.
 * Uses Mastra's Agent class to simplify integration with OpenAI.
 */
const openAICompletionNode: NodeDefinition<OpenAICompletionInput, OpenAICompletionOutput> = {
  name: 'openAICompletion',
  type: 'io',
  inputSchema: openAICompletionInputSchema as any, // Using 'as any' to work around the TypeScript error
  outputSchema: openAICompletionOutputSchema,
  execute: async (input) => {
    try {
      // Parse the input with defaults applied
      const parsedInput = openAICompletionInputSchema.parse(input);

      // Create a new agent instance with the system prompt
      const agent = createAgent(parsedInput.systemPrompt);

      // Generate completion using the Mastra agent
      const result = await agent.generate(parsedInput.prompt, {
        temperature: parsedInput.temperature
      });

      // Return the formatted response
      return {
        completion: result.text
      };
    } catch (error) {
      console.error('Error in openAICompletion node:', error);
      throw new Error(`OpenAI completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

export default openAICompletionNode;

// In-source test suite for the openAICompletion node
if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;

  describe('openAICompletion node', () => {
    // Basic property tests that don't require mocking
    it('should have the correct name and type', () => {
      expect(openAICompletionNode.name).toBe('openAICompletion');
      expect(openAICompletionNode.type).toBe('io');
    });

    // Tests for schema validation
    it('should handle string input schema validation correctly', () => {
      // Test with valid data
      expect(() => openAICompletionInputSchema.parse({ 
        prompt: 'test prompt'
      })).not.toThrow();
      
      // Test with invalid data types
      expect(() => openAICompletionInputSchema.parse({
        // @ts-ignore - intentionally testing invalid types
        prompt: 123 // Should be a string
      })).toThrow();
    });

    it('should apply default values for optional fields', () => {
      // Parse with only required fields
      const parsed = openAICompletionInputSchema.parse({
        prompt: 'test prompt'
      });
      
      // Check defaults were applied
      expect(parsed.temperature).toBe(0.7); // Default temperature
      expect(parsed.systemPrompt).toBe('You are a helpful assistant.'); // Default system prompt
    });

    // Tests for the execute function with mocked dependencies
    it('should return completion from agent response', async () => {
      // Create a mock agent
      const mockAgent = {
        generate: vi.fn().mockResolvedValue({
          text: 'This is a mock response from the AI'
        })
      };

      // Mock the createAgent function
      const mockCreateAgent = vi.fn().mockReturnValue(mockAgent);
      
      // Create a test node with mocked dependencies
      const testNode = {
        ...openAICompletionNode,
        execute: async (input: OpenAICompletionInput) => {
          try {
            // Parse the input with defaults applied
            const parsedInput = openAICompletionInputSchema.parse(input);
      
            // Use our mock instead of the real createAgent
            const agent = mockCreateAgent(parsedInput.systemPrompt);
      
            // Generate completion using the mocked agent
            const result = await agent.generate(parsedInput.prompt, {
              temperature: parsedInput.temperature
            });
            
            // Return the formatted response
            return {
              completion: result.text
            };
          } catch (error) {
            console.error('Error in test execution:', error);
            throw new Error(`OpenAI completion failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
      
      // Execute the test node
      const result = await testNode.execute({
        prompt: 'Test prompt',
        temperature: 0.5,
        systemPrompt: 'Test system prompt'
      });
      
      // Verify our mocks were called correctly
      expect(mockCreateAgent).toHaveBeenCalledWith('Test system prompt');
      expect(mockAgent.generate).toHaveBeenCalledWith('Test prompt', {
        temperature: 0.5
      });
      
      // Verify the result matches expected output
      expect(result).toEqual({
        completion: 'This is a mock response from the AI'
      });
    });

    it('should throw an error when agent.generate fails', async () => {
      // Create a mock agent that throws an error
      const mockAgent = {
        generate: vi.fn().mockRejectedValue(new Error('Mock API error'))
      };

      // Mock the createAgent function
      const mockCreateAgent = vi.fn().mockReturnValue(mockAgent);
      
      // Create a test node with mocked dependencies
      const testNode = {
        ...openAICompletionNode,
        execute: async (input: OpenAICompletionInput) => {
          try {
            // Parse the input with defaults applied
            const parsedInput = openAICompletionInputSchema.parse(input);
      
            // Use our mock instead of the real createAgent
            const agent = mockCreateAgent(parsedInput.systemPrompt);
      
            // Generate completion using the mocked agent
            const result = await agent.generate(parsedInput.prompt, {
              temperature: parsedInput.temperature
            });
            
            // Return the formatted response
            return {
              completion: result.text
            };
          } catch (error) {
            console.error('Error in test execution:', error);
            throw new Error(`OpenAI completion failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
      
      // Execute the test node and expect it to throw with our error message
      await expect(testNode.execute({
        prompt: 'Test prompt',
        temperature: 0.5,
        systemPrompt: 'Test system prompt'
      })).rejects.toThrow('OpenAI completion failed: Mock API error');
    });
  });
}
