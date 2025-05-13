import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get the user ID from the auth context
export const getUserId = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();


  console.log("identity", identity);

  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action"
    });
  }

  return identity.subject;
};
