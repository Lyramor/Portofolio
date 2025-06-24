'use client'; // This directive is crucial for using client-side hooks

// src/app/lyramor/layout.jsx - Updated with new navigation order and CV link

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiMenu,
  FiX,
  FiHome,
  FiEdit,
  FiCode,
  FiGrid,
  FiLogOut,
  FiInfo,
  FiBriefcase,
  FiLink // Import FiLink icon for CV Link
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // useEffect hook to fetch user information when the component mounts
  // and whenever the user's authentication state might change.
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Attempt to fetch user data from the admin user API route
        const res = await fetch('/api/admin/user');

        // Check if the response is successful (status 200 OK)
        if (res.ok) {
          const data = await res.json();
          // If user data contains a username, set it in the state
          if (data.username) {
            setUsername(data.username);
          }
        } else {
          // If fetching user info fails (e.g., 401 Unauthorized),
          // it likely means the session is invalid or expired.
          // Log the error but don't redirect here; the middleware handles redirects.
          console.error('Failed to fetch user info:', res.status, res.statusText);
          setUsername(''); // Clear username if fetch fails, so fallback 'Admin' is shown
        }
      } catch (error) {
        // Catch any network or parsing errors during the fetch operation
        console.error('Error fetching user info:', error);
        setUsername(''); // Clear username on error
      }
    };

    fetchUserInfo(); // Call the function to fetch user info
  }, []); // Empty dependency array ensures this runs once after initial render

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      // Send a POST request to the logout API route
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // Redirect the user to the login page after successful logout
      router.push('/lyra');
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally, show a toast notification for logout failure
    }
  };

  // Define navigation links for the admin sidebar
  // Each link includes a name, path, and an icon.
  const navLinks = [
    { name: 'Dashboard', path: '/lyramor', icon: <FiHome size={18} /> },
    { name: 'About', path: '/lyramor/about', icon: <FiInfo size={18} /> },
    { name: 'CV Link', path: '/lyramor/cv', icon: <FiLink size={18} /> }, // Added CV Link navigation item
    { name: 'Counters', path: '/lyramor/counters', icon: <FiEdit size={18} /> },
    { name: 'Skills', path: '/lyramor/skills', icon: <FiCode size={18} /> },
    { name: 'Experience', path: '/lyramor/experience', icon: <FiBriefcase size={18} /> },
    { name: 'Projects', path: '/lyramor/projects', icon: <FiGrid size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Mobile sidebar backdrop: appears when sidebar is open on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)} // Close sidebar when backdrop is clicked
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-zinc-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0' // Controls sidebar visibility
        }`}
      >
        {/* Sidebar Header: displays site title and close button for mobile */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-700">
          <h1 className="text-xl font-semibold text-sky-400">Portfolio Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-zinc-700 md:hidden" // Hidden on desktop
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* User Info Section */}
        <div className="px-4 py-2 border-b border-zinc-700">
          <p className="text-sm text-zinc-400">Logged in as</p>
          {/* Displays the fetched username or 'Admin' as a fallback */}
          <p className="font-medium">{username || 'Admin'}</p>
        </div>

        {/* Navigation Links List */}
        <nav className="p-2 overflow-y-auto h-[calc(100%-8rem)]"> {/* Adjusted height to account for header and footer/logout button */}
          <ul className="space-y-1">
            {navLinks.map((link) => {
              // Determine if the current link is active based on the pathname
              const isActive = pathname === link.path ||
                // For paths like /lyramor/skills/new, check if the path starts with the base link path
                (link.path !== '/lyramor' && pathname.startsWith(link.path));

              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400' // Active link styling
                        : 'hover:bg-zinc-700/50' // Hover styling for inactive links
                    }`}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after clicking a link
                  >
                    {link.icon} {/* Display the icon for the link */}
                    <span>{link.name}</span> {/* Display the name of the link */}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-left rounded-lg hover:bg-zinc-700/50 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="md:ml-64"> {/* Margin left on medium screens and up to accommodate sidebar */}
        {/* Main Header (Top Navbar for mobile, secondary header for desktop) */}
        <header className="sticky top-0 z-10 h-16 bg-zinc-800 border-b border-zinc-700 flex items-center px-4">
          {/* Hamburger menu button for mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-zinc-700 md:hidden"
            aria-label="Open sidebar"
          >
            <FiMenu size={20} />
          </button>
          {/* Current page title */}
          <div className="flex-1 px-4 md:px-8">
            <h2 className="text-xl font-medium">
              {/* Dynamically display the current page title based on the pathname */}
              {pathname === '/lyramor'
                ? 'Dashboard'
                : navLinks.find(link => pathname.startsWith(link.path))?.name || 'Admin'}
            </h2>
          </div>
        </header>

        {/* Render children (the actual page content) */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
