// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // Get current user from the token in cookies
    const cookieStore = cookies();
    const user = await getCurrentUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Return user info (excluding sensitive data)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({
      message: 'Authentication error'
    }, { status: 401 });
  }
}