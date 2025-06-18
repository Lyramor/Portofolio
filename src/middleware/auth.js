// src/middleware/auth.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Get session token from cookies
  const session = request.cookies.get('lyra_session')?.value;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/lyra', '/api/auth/login'];
  const isPublicPath = publicPaths.some(pp => path.startsWith(pp));
  
  // Check if user is accessing admin routes without authentication
  if (path.startsWith('/lyramor') && !session) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/lyra', request.url));
  }
  
  // Prevent authenticated users from accessing login page
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL('/lyramor', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ['/lyra', '/lyramor/:path*', '/api/admin/:path*']
};