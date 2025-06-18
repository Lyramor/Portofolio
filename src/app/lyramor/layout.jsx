'use client';
// src/app/lyramor/layout.js - Updated with new navigation order
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
  FiBriefcase
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Fetch current user info
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/admin/user');
        const data = await res.json();
        if (data.username) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/lyra');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Updated navigation links with the requested order
  const navLinks = [
    { name: 'Dashboard', path: '/lyramor', icon: <FiHome size={18} /> },
    { name: 'About', path: '/lyramor/about', icon: <FiInfo size={18} /> },
    { name: 'Counters', path: '/lyramor/counters', icon: <FiEdit size={18} /> },
    { name: 'Skills', path: '/lyramor/skills', icon: <FiCode size={18} /> },
    { name: 'Experience', path: '/lyramor/experience', icon: <FiBriefcase size={18} /> },
    { name: 'Projects', path: '/lyramor/projects', icon: <FiGrid size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-zinc-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-700">
          <h1 className="text-xl font-semibold text-sky-400">Portfolio Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-zinc-700 md:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-zinc-700">
          <p className="text-sm text-zinc-400">Logged in as</p>
          <p className="font-medium">{username || 'Admin'}</p>
        </div>

        <nav className="p-2 overflow-y-auto h-[calc(100%-8rem)]">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path || 
                (link.path !== '/lyramor' && pathname.startsWith(link.path));
              
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sky-600/20 text-sky-400'
                        : 'hover:bg-zinc-700/50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

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

      {/* Main content */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-zinc-800 border-b border-zinc-700 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-zinc-700 md:hidden"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex-1 px-4 md:px-8">
            <h2 className="text-xl font-medium">
              {pathname === '/lyramor'
                ? 'Dashboard'
                : navLinks.find(link => pathname.startsWith(link.path))?.name || 'Admin'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}