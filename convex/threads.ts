import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all threads, sorted by creation time (newest first)
export const getThreads = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_creation")
      .order("desc")
      .collect();
  },
});

// Query to get a single thread by ID
export const getThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

// Mutation to create a new thread
export const createThread = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const threadId = await ctx.db.insert("threads", {
      name: args.name,
      createdAt: Date.now(),
    });
    return threadId;
  },
});
