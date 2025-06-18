// src/app/api/auth/login/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Input validation
    if (!username || !password) {
      return Response.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Prevent SQL injection by using parameterized queries
    const users = await query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate a session token
    const sessionToken = uuidv4();

    // Store the session in database (you should create a sessions table for this)
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, sessionToken]
    );

    // Set secure HTTP-only cookie
    cookies().set({
      name: 'lyra_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Log successful login (for security auditing)
    console.log(`User ${user.id} logged in successfully`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}