import React, { type ReactNode } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm">
                Hello, {user.firstName || user.username}
              </span>
            )}
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
    </div>
  );
};

export default Layout;
