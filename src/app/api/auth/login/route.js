// src/app/api/auth/login/route.js
import { query } from '@/lib/db'; // Mengimpor fungsi query database
import { cookies } from 'next/headers'; // Mengimpor fungsi untuk mengelola cookies
import bcrypt from 'bcryptjs'; // Mengimpor library bcryptjs untuk hashing password
import { v4 as uuidv4 } from 'uuid'; // Mengimpor uuid untuk membuat token sesi unik
import { NextResponse } from 'next/server'; // Mengimpor NextResponse untuk respons HTTP dan redirect

export async function POST(request) {
  try {
    // Mengurai body permintaan untuk mendapatkan username dan password
    const body = await request.json();
    const { username, password } = body;

    // Validasi input: memastikan username dan password disediakan
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password wajib diisi' },
        { status: 400 } // Bad Request
      );
    }

    // Mengambil data pengguna dari database berdasarkan username
    const users = await query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    // Jika pengguna tidak ditemukan, kembalikan error
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Username atau password tidak valid' },
        { status: 401 } // Unauthorized
      );
    }

    const user = users[0]; // Mengambil objek pengguna yang ditemukan

    // Memverifikasi password yang diberikan dengan hash password di database
    const isValidPassword = await bcrypt.compare(password, user.password);

    // Jika password tidak valid, kembalikan error
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Username atau password tidak valid' },
        { status: 401 } // Unauthorized
      );
    }

    // Membuat token sesi unik menggunakan UUID v4
    const sessionToken = uuidv4();

    // Menyimpan sesi di database dengan waktu kadaluarsa (24 jam dari sekarang)
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, sessionToken]
    );

    // Membuat URL untuk redirect ke dashboard admin
    const redirectUrl = new URL('/lyramor', request.url);
    // Membuat objek respons redirect
    const response = NextResponse.redirect(redirectUrl);

    // Menetapkan cookie sesi pada objek respons redirect
    // Ini memastikan cookie diatur di browser SEBELUM browser dialihkan ke URL baru.
    response.cookies.set({
      name: 'lyra_session', // Nama cookie sesi
      value: sessionToken,   // Token sesi yang dihasilkan
      httpOnly: true,        // Membuat cookie tidak dapat diakses oleh JavaScript sisi klien (untuk keamanan)
      secure: process.env.NODE_ENV === 'production', // Hanya mengirim cookie melalui HTTPS di lingkungan produksi
      sameSite: 'strict',    // Mencegah serangan CSRF (Cross-Site Request Forgery)
      maxAge: 60 * 60 * 24,  // Waktu kadaluarsa cookie dalam detik (24 jam)
      path: '/',             // Jalur URL di mana cookie valid
    });

    // Mencatat login yang berhasil untuk tujuan audit
    console.log(`Pengguna ${user.id} berhasil login, mengalihkan ke ${redirectUrl.pathname}`);
    
    // Mengembalikan respons redirect, yang akan diikuti secara otomatis oleh browser
    return response;
  } catch (error) {
    // Menangani error yang mungkin terjadi selama proses login
    console.error('Login error:', error);
    // Mengembalikan error server internal untuk masalah yang tidak terduga
    return NextResponse.json(
      { message: 'Terjadi kesalahan server internal' },
      { status: 500 } // Internal Server Error
    );
  }
}
