import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { generateText, type Message } from "ai";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Define the message format for Convex messages
type ConvexMessage = {
  _id: Id<"messages">;
  _creationTime: number;
  threadId: Id<"threads">;
  content: string;
  createdAt: number;
};

// Define return type for the action
type AIResponse = {
  userMessageId: Id<"messages">;
  aiMessageId: Id<"messages">;
};

// Query to get messages for a specific thread
export const getMessages = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

// Action to generate an AI response using OpenAI o4-mini and add it to a thread
export const generateAIResponse = action({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<AIResponse> => {
    // First add the user message to the thread
    const userMessageId: Id<"messages"> = await ctx.runMutation(api.messages.addMessage, {
      threadId: args.threadId,
      content: args.content,
    });

    // Get conversation history to provide context to the AI
    const messages: ConvexMessage[] = await ctx.runQuery(api.messages.getMessages, {
      threadId: args.threadId,
    });

    // Format messages for the AI SDK
    // Using type assertion to ensure proper typing for the AI SDK
    const aiMessages: Message[] = [];

    // Add past messages as context with proper role alternation
    for (let i = 0; i < messages.length; i++) {
      aiMessages.push({
        id: messages[i]._id,
        role: i % 2 === 0 ? "user" : "assistant",
        content: messages[i].content
      });
    }

    // Add the current user message
    aiMessages.push({
      id: userMessageId,
      role: "user",
      content: args.content
    });

    // Generate the AI response using o4-mini
    const { text }: { text: string } = await generateText({
      model: openai("o4-mini"),
      messages: aiMessages,
      // Optional parameters for controlling reasoning effort
      providerOptions: {
        openai: { reasoningEffort: "low" },
      },
    });

    // Add the AI response as a new message
    const aiMessageId: Id<"messages"> = await ctx.runMutation(api.messages.addMessage, {
      threadId: args.threadId,
      content: text,
    });

    return { userMessageId, aiMessageId };
  },
});
// Mutation to add a message to a thread
export const addMessage = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      content: args.content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});
