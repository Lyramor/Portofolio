// src/app/api/auth/logout/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Get the session token from cookies
    const sessionToken = cookies().get('lyra_session')?.value;

    if (sessionToken) {
      // Delete the session from the database
      await query('DELETE FROM sessions WHERE token = ?', [sessionToken]);
      
      // Delete the cookie
      cookies().delete('lyra_session');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}