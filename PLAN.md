# “Story-Writer” – a complete Convex crash-course
Below is a step-by-step tutorial that reproduces (and cleans up) everything you saw in the video transcript:

0.  Prerequisites
    • Node ≥ 18, Git, a GitHub account
    • (Optional) TailwindCSS for quick styling

---

## 1  Boot-strap a Convex + Vite project

```bash
npx  create-convex@latest  my-convex-app
# choose “Vite”, “Convex Auth”, TypeScript
cd my-convex-app
npm run dev          # starts BOTH Vite and the Convex dev server
```

During the first `npm run dev` Convex asks you to create a project in the
browser and to pick an auth provider (choose GitHub as shown in the video).
The CLI prints an OAuth callback-URL – copy & paste it into a new **GitHub
OAuth App** and provide the Client-ID / Client-Secret when prompted [1].

You can now Sign-in with GitHub; Convex automatically creates a `users`
table and stores your identity.

---

## 2  Define your schema – `convex/schema.ts`

```ts
import { defineSchema, defineTable, v } from "convex/server";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    text:   v.string()
  }).index("by_userId", ["userId"]),   // <— for authorization later
});
```

Hit *save* – the dev server hot-reloads and the **Notes** table immediately
appears in the dashboard [1].

---

## 3  Create backend functions – `convex/notes.ts`

```ts
import {
  mutation, query, internalMutation, internalAction,
  type MutationCtx, type QueryCtx
} from "./_generated/server";
import { v, Id } from "convex/values";

/* ---------- helpers ---------- */
async function getUserId(ctx: MutationCtx | QueryCtx) {
  const id = await ctx.auth.getUserIdentity();
  if (!id) throw new Error("Not authenticated");
  return id.subject;            // same field Convex Auth stores
}

/* ---------- mutation: create note ---------- */
export const createNote = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const userId = await getUserId(ctx);
    return await ctx.db.insert("notes", { userId, text });
  },
});

/* ---------- query: live list ---------- */
export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/* ---------- mutation: delete note ---------- */
export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});

/* ---------- internal mutation: delete ALL notes ---------- */
export const deleteAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    await Promise.all(notes.map((n) => ctx.db.delete(n._id)));
  },
});

/* ---------- internal action: store note to file ---------- */
export const storeNoteFile = internalAction({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await ctx.storage.store(new Blob([text], { type: "text/plain" }));
  },
});
```

---

## 4  Wire the React UI

`src/App.tsx`

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { NotesForm } from "./NotesForm";
import { NotesList } from "./NotesList";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <Authenticated>
        <main className="container mx-auto p-8 space-y-6">
          <NotesForm />
          <NotesList />
        </main>
      </Authenticated>

      <Unauthenticated>
        <div className="h-screen flex items-center justify-center">
          <a href="/api/auth/login">Sign-in</a>
        </div>
      </Unauthenticated>
    </ConvexProvider>
  );
}
```

`src/NotesForm.tsx`

```tsx
import { FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function NotesForm() {
  const createNote = useMutation(api.notes.createNote);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = (form.elements.namedItem("note") as HTMLInputElement).value;
    await createNote({ text });
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        name="note"
        placeholder="Write something…"
        className="border rounded px-3 py-1 flex-1"
      />
      <button className="bg-indigo-600 text-white rounded px-4">Add</button>
    </form>
  );
}
```

`src/NotesList.tsx`

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function NotesList() {
  const notes = useQuery(api.notes.listNotes) ?? [];
  const remove = useMutation(api.notes.deleteNote);

  return (
    <ul className="space-y-2">
      {notes.map((n) => (
        <li
          key={n._id}
          className="bg-yellow-200 text-black rounded p-3 flex justify-between"
        >
          <span>{n.text}</span>
          <button
            onClick={() => remove({ id: n._id })}
            className="px-2 text-red-600"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
```

Open two browser tabs – add a note in one tab and watch it pop up instantly in
the other. That’s Convex’ “sync engine” in action (query subscriptions use
web-sockets under the hood) [1].

---

## 5  Add a *Rate Limiter* component (optional)

```bash
npm i @convex-dev/rate-limiter
```

`convex/convex.config.ts`

```ts
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(rateLimiter);       // enables global helpers
export default app;
```

Inside `createNote`:

```ts
import { fixedWindow } from "@convex-dev/rate-limiter/server";

const limit = fixedWindow({ windowMs: 60_000, limit: 1 }); // 1/min

export const createNote = mutation({
  /* … */
  handler: async (ctx, { text }) => {
    const userId = await getUserId(ctx);
    await limit.assert(ctx, { key: userId, throws: true });

    return await ctx.db.insert("notes", { userId, text });
  },
});
```

Trying to add a second note within one minute throws an error that you can
catch in the UI.

---

## 6  Cron job – wipe the table every 10 s

`convex/crons.ts`

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear notes table",
  { seconds: 10 },
  internal.notes.deleteAll
);

export default crons;
```

Cron jobs are listed and manually trigger-able in the Convex dashboard
Scheduling → Cron Jobs view [1].

---

## 7  Store every note as a file (asynchronously)

Add to `createNote` (right after insertion):

```ts
  // fire-and-forget: schedule action, do NOT block user
  await ctx.scheduler.runAfter(0, internal.notes.storeNoteFile, { text });
```

Uploaded blobs appear under *Files* in the dashboard.

---

## 8  Extra goodies you can turn on later

| Feature | How |
|---------|-----|
| Vector search | `table.vectorIndex("embedding")`, then use `ctx.db.search(...)` |
| Full-text search | `table.searchIndex("by_text", { searchField: "text" })` |
| Pagination | `usePaginatedQuery` / `ctx.db.paginate` |
| Other clients | React-Native, Vue, Svelte, Python, Swift… just install the matching package |

---

## 9  Deploy

```bash
npm run convex deploy          # pushes functions & schema
npm run build                  # Vite build
# host the static files wherever you like (Netlify, Vercel, Cloudflare…)
```

---

### That’s it!
In ~150 lines of code you now have:

* **Auth** (GitHub OAuth & Convex Auth)
* A live-synced **database** (mutations + queries)
* **Rate limiting**, **Cron jobs**, **File storage**, **Authorization**
* Fully-typed React hooks generated for you

Play around for 30 minutes – once you’ve felt the *sync engine* you’ll never
want to wire sockets manually again. Happy building 🚀

---

References
[1] Convex Quickstart & Cron-Jobs documentation (https://docs.convex.dev)