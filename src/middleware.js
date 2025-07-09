// src/middleware.js - FINAL FIXED VERSION
import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get('lyra_session')?.value;
  
  // FIX: Use EXACT path matching for public paths to avoid prefix conflicts
  const publicPaths = ['/lyra', '/api/auth/login', '/api/auth/logout'];
  const isPublicPath = publicPaths.includes(path) || path.startsWith('/api/auth/login');
  
  console.log('Is public path:', isPublicPath);
  
  // 1. User trying to access admin area without session
  if (path.startsWith('/lyramor') && !session) {
    console.log('REDIRECT: No session, redirecting to login');
    return NextResponse.redirect(new URL('/lyra', request.url));
  }
  
  // 2. User with session trying to access login page
  if (path === '/lyra' && session) {
    console.log('REDIRECT: Has session, redirecting to dashboard');
    return NextResponse.redirect(new URL('/lyramor', request.url));
  }
  
  // 3. Allow everything else
  console.log('ALLOWING REQUEST');
  console.log('================');
  return NextResponse.next();
}

export const config = {
  matcher: ['/lyra', '/lyramor/:path*', '/api/admin/:path*']
};