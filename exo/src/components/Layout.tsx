import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser, SignOutButton } from '@clerk/clerk-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link to="/">Notes App</Link>
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm">
                Hello, {user.firstName || user.username}
              </span>
            )}
            <button
              onClick={() => navigate('/new')}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              New Note
            </button>
            <SignOutButton>
              <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container mx-auto">
          <p>Notes App &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
