'use client';

// src/app/lyramor/layout.jsx - Updated with new navigation order and CV link

import { useState, useEffect, Suspense } from 'react'; // Tambahkan Suspense
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
  FiLink
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/admin/user');

        if (res.ok) {
          const data = await res.json();
          if (data.username) {
            setUsername(data.username);
          }
        } else {
          console.error('Failed to fetch user info:', res.status, res.statusText);
          setUsername('');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUsername('');
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

  const navLinks = [
    { name: 'Dashboard', path: '/lyramor', icon: <FiHome size={18} /> },
    { name: 'About', path: '/lyramor/about', icon: <FiInfo size={18} /> },
    { name: 'CV Link', path: '/lyramor/cv', icon: <FiLink size={18} /> },
    { name: 'Counters', path: '/lyramor/counters', icon: <FiEdit size={18} /> },
    { name: 'Skills', path: '/lyramor/skills', icon: <FiCode size={18} /> },
    { name: 'Experience', path: '/lyramor/experience', icon: <FiBriefcase size={18} /> },
    { name: 'Projects', path: '/lyramor/projects', icon: <FiGrid size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
            aria-label="Close sidebar"
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
                    onClick={() => setSidebarOpen(false)}
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

      <div className="md:ml-64">
        <header className="sticky top-0 z-10 h-16 bg-zinc-800 border-b border-zinc-700 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-zinc-700 md:hidden"
            aria-label="Open sidebar"
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

        <main className="p-4 md:p-8">
          {/* Bungkus children dengan Suspense */}
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}