// src/app/api/cv/route.js (Public API)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cvData = await query('SELECT link_cv FROM cv LIMIT 1');
    
    // If no CV link exists, return an empty string or null
    let link_cv = null;
    if (cvData.length > 0) {
      link_cv = cvData[0].link_cv;
    }

    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify({ link_cv }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error retrieving public CV link:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
