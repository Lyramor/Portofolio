'use client';
// src/app/lyra/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Redirect to admin dashboard on successful login
      router.push('/lyramor');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Portfolio Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg border border-zinc-700/30">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-sky-400">Portfolio Admin</h1>
              <p className="text-zinc-400 mt-2">Login to access dashboard</p>
            </div>

            {error && (
              <div className="bg-red-900/50 text-red-300 border border-red-700/50 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-zinc-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 bg-zinc-900/60 rounded-lg border border-zinc-700 text-zinc-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 bg-zinc-900/60 rounded-lg border border-zinc-700 text-zinc-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center text-zinc-400 text-sm">
              <Link href="/" className="text-sky-400 hover:underline">
                Return to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}