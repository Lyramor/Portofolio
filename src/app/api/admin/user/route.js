// src/app/api/admin/user/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('lyra_session')?.value;

    if (!sessionToken) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session
    const sessions = await query(
      `SELECT u.id, u.username, u.email 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );

    if (sessions.length === 0) {
      // Invalid or expired session
      cookies().delete('lyra_session');
      return Response.json({ message: 'Session expired' }, { status: 401 });
    }

    const user = sessions[0];

    // Return user info (excluding sensitive data)
    return Response.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 