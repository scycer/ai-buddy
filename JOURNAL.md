# Journal Entry: Setting up a React TypeScript App with Convex
## June 12, 2024

Today I successfully set up a new React application using Vite with TypeScript support and integrated Convex for backend functionality.

## Initial Setup

I started by creating a new Vite project with React and TypeScript:

```bash
npm create vite@latest exo -- --template react-ts
cd exo
```

The project structure was clean and minimal, just as I wanted. Vite provides an excellent development experience with fast hot module replacement.

## Adding Convex

Next, I installed the Convex package to handle backend operations:

```bash
npm install convex
```

This will allow me to easily set up a backend with real-time data synchronization. The Convex package integrates well with React and TypeScript, providing type-safe queries and mutations.

## Next Steps

I plan to:
1. Set up the Convex client configuration
2. Create my first Convex schema
3. Implement basic CRUD operations for capturing notes
4. Connect the frontend React components to Convex data

The combination of React 19, TypeScript, Vite, and Convex should provide a solid foundation for building a modern, type-safe application with real-time capabilities.
