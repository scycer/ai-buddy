import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
