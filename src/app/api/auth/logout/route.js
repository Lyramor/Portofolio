// src/app/api/auth/logout/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Logout request received');
    
    // Get the session token from cookies
    const sessionToken = cookies().get('lyra_session')?.value;

    if (sessionToken) {
      console.log('Deleting session from database');
      // Delete the session from the database
      await query('DELETE FROM sessions WHERE token = ?', [sessionToken]);
      
      console.log('Deleting cookie');
      // Delete the cookie
      cookies().delete('lyra_session');
    }

    console.log('Logout successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}