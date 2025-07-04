// src/app/api/auth/login/route.js - CLEAN VERSION
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('Login request received');
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    console.log('Checking user credentials for:', username);
    
    const users = await query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Username atau password tidak valid' },
        { status: 401 }
      );
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Username atau password tidak valid' },
        { status: 401 }
      );
    }

    const sessionToken = uuidv4();
    console.log('Creating session for user:', user.id);

    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, sessionToken]
    );

    // Create JSON response
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      redirectTo: '/lyramor'
    });

    // Set cookie
    response.cookies.set('lyra_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    console.log('Login successful for user:', user.id);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server internal' },
      { status: 500 }
    );
  }
}