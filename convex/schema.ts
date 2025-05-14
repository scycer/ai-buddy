import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_creation", ["createdAt"]),

  messages: defineTable({
    threadId: v.id("threads"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId", "createdAt"])
});
