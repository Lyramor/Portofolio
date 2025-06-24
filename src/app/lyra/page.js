'use client';
// src/app/lyra/page.js - FIXED VERSION
import { useState } from 'react'; // Mengimpor hook useState untuk state komponen
import Head from 'next/head'; // Mengimpor komponen Head dari Next.js untuk metadata halaman
import Link from 'next/link'; // Mengimpor komponen Link dari Next.js untuk navigasi
import { useRouter } from 'next/navigation'; // Mengimpor useRouter untuk navigasi programatis

export default function LoginPage() {
  // State untuk menyimpan data form username dan password
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // State untuk menyimpan pesan error yang akan ditampilkan ke pengguna
  const [error, setError] = useState('');
  // State untuk menunjukkan apakah proses login sedang berlangsung
  const [isLoading, setIsLoading] = useState(false);
  // Menginisialisasi router dari Next.js
  const router = useRouter(); 

  // Fungsi untuk menangani perubahan input pada form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value // Memperbarui state form sesuai input
    }));
  };

  // Fungsi untuk menangani submit form login - DIPERBAIKI
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah perilaku default form (refresh halaman)
    setError('');       // Menghapus pesan error sebelumnya
    setIsLoading(true); // Mengatur status loading menjadi true
    
    try {
      // Mengirim kredensial login ke API route login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Parse response JSON
      const data = await response.json();

      // Memeriksa apakah respons dari server TIDAK OK (misalnya status 400, 401, 500)
      if (!response.ok) {
        // Melemparkan error dengan pesan dari server atau pesan default jika tidak ada
        throw new Error(data.message || 'Login gagal. Silakan coba lagi.'); 
      }

      // PERBAIKAN: Handle redirect di client-side
      // Jika login berhasil dan ada redirectTo dalam response
      if (data.success && data.redirectTo) {
        console.log('Login berhasil, redirecting ke:', data.redirectTo);
        
        // Tunggu sebentar untuk memastikan cookie ter-set dengan benar
        setTimeout(() => {
          // Gunakan window.location.href untuk hard redirect
          // Ini memastikan middleware dapat membaca cookie yang baru saja di-set
          window.location.href = data.redirectTo;
        }, 100);
      }

    } catch (err) {
      // Menangkap dan menampilkan error yang terjadi selama proses fetch atau parsing
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false); // Mengatur ulang status loading menjadi false
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Portfolio Dashboard</title>
        <meta name="robots" content="noindex,nofollow" /> {/* Mencegah halaman ini diindeks oleh mesin pencari */}
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg border border-zinc-700/30">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-sky-400">Portfolio Admin</h1>
              <p className="text-zinc-400 mt-2">Login untuk mengakses dashboard</p>
            </div>

            {/* Menampilkan pesan error jika ada */}
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
                  placeholder="Masukkan username Anda"
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
                  placeholder="Masukkan password Anda"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading} // Tombol dinonaktifkan saat loading
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sedang Login...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center text-zinc-400 text-sm">
              <Link href="/" className="text-sky-400 hover:underline">
                Kembali ke Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}