import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    content: v.string(),
    dateCreated: v.number(),
    dateUpdated: v.number(),
    isDeleted: v.boolean(),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "dateUpdated",])
    .index("by_user_and_deleted", ["userId", "isDeleted"]),
});
