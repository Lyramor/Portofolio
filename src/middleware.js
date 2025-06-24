// D:\laragon\www\cylia_tech\src\middleware.js

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Mengambil jalur URL dari permintaan saat ini
  const path = request.nextUrl.pathname;
  
  // Mengambil token sesi dari cookie 'lyra_session'
  const session = request.cookies.get('lyra_session')?.value;
  
  // Mendefinisikan jalur publik yang tidak memerlukan otentikasi
  const publicPaths = ['/lyra', '/api/auth/login'];
  // Memeriksa apakah jalur saat ini adalah salah satu dari jalur publik
  const isPublicPath = publicPaths.some(pp => path.startsWith(pp));
  
  // Logika utama middleware:
  // 1. Jika pengguna mencoba mengakses jalur admin ('/lyramor') DAN belum ada sesi (belum login):
  //    Maka, alihkan (redirect) pengguna ke halaman login '/lyra'.
  if (path.startsWith('/lyramor') && !session) {
    return NextResponse.redirect(new URL('/lyra', request.url));
  }
  
  // 2. Jika pengguna sudah login (ada sesi) DAN mencoba mengakses jalur publik (seperti '/lyra' atau '/api/auth/login'):
  //    Maka, alihkan (redirect) pengguna ke dashboard admin '/lyramor'.
  //    Ini mencegah pengguna yang sudah login untuk tetap berada di halaman login atau mengakses API login.
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL('/lyramor', request.url));
  }
  
  // Jika tidak ada kondisi di atas yang terpenuhi, biarkan permintaan berlanjut normal.
  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan jalur mana saja yang akan diproses oleh middleware ini.
// Middleware akan berjalan untuk:
// - '/lyra' (halaman login)
// - Semua jalur yang diawali dengan '/lyramor' (misalnya /lyramor, /lyramor/projects)
// - Semua jalur API yang diawali dengan '/api/admin' (misalnya /api/admin/user)
export const config = {
  matcher: ['/lyra', '/lyramor/:path*', '/api/admin/:path*']
};
