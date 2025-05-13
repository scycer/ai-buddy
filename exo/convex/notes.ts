import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./auth";

// Query to list all notes for a user
export const list = query({
  args: {
    showDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const { showDeleted = false } = args;

    let notesQuery;

    if (!showDeleted) {
      // If we're not showing deleted notes, first filter by userId and isDeleted
      notesQuery = ctx.db
        .query("notes")
        .withIndex("by_user_and_deleted", (q) =>
          q.eq("userId", userId).eq("isDeleted", false)
        )
    } else {
      // If we're showing all notes including deleted ones, filter only by userId
      notesQuery = ctx.db
        .query("notes")
        .withIndex("by_user_and_date", (q) => q.eq("userId", userId));
    }

    // Fetch notes sorted by most recently updated
    const notes = await notesQuery.collect()
    const sortedNotes = notes.sort((a,b) => b.dateUpdated - a.dateUpdated);
    return sortedNotes;
  },
});

// Query to get a single note by ID
export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const note = await ctx.db.get(args.id);

    if (!note) {
      throw new Error("Note not found");
    }

    if (note.isDeleted) {
      throw new Error("Note has been deleted");
    }

    if (note.userId !== userId) {
      throw new Error("You can only access your own notes");
    }

    return note;
  },
});

// Mutation to create a new note
export const create = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const { content } = args;
    const now = Date.now();

    const noteId = await ctx.db.insert("notes", {
      content,
      userId,
      dateCreated: now,
      dateUpdated: now,
      isDeleted: false,
    });

    return noteId;
  },
});

// Mutation to update an existing note
export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const { id, content } = args;
    const note = await ctx.db.get(id);

    if (!note) {
      throw new Error("Note not found");
    }

    if (note.isDeleted) {
      throw new Error("Cannot update a deleted note");
    }

    if (note.userId !== userId) {
      throw new Error("You can only update your own notes");
    }

    await ctx.db.patch(id, {
      content,
      dateUpdated: Date.now()
    });

    return id;
  },
});

// Mutation to delete a note (soft delete)
export const remove = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const { id } = args;
    const note = await ctx.db.get(id);

    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== userId) {
      throw new Error("You can only delete your own notes");
    }

    await ctx.db.patch(id, {
      isDeleted: true,
      dateUpdated: Date.now()
    });

    return id;
  },
});
