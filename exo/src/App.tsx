import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from "convex/react-clerk";

import NotesList from './components/NotesList'
import NoteEditor from './components/NoteEditor'
import Layout from './components/Layout'

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Router>
          <SignedOut>
            <Routes>
              <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
              <Route path="*" element={<Navigate to="/sign-in" replace />} />
            </Routes>
          </SignedOut>
          <SignedIn>
            <Layout>
              <Routes>
                <Route path="/" element={<NotesList />} />
                <Route path="/new" element={<NoteEditor />} />
                <Route path="/edit/:id" element={<NoteEditor />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </SignedIn>
        </Router>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

export default App
