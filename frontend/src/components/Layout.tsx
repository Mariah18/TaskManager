import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

// Layout component provides the main page structure, including header and content area
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Header section */}
      <header className="bg-blue-600 text-white p-4 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white">
            Welcome, {user?.name || user?.email}
          </span>
          <Link
            to="/profile"
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      {/* Main content area */}
      <main className="py-8 px-4 w-full">{children}</main>
    </div>
  );
};

export default Layout;
