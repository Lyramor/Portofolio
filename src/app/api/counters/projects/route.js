// src/app/api/counters/projects/route.js (Public API)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mengambil nilai 'number' dari tabel counter_projects
    // Jika tidak ada record, default ke 0
    const counterResult = await query('SELECT number FROM counter_projects LIMIT 1');
    const number = counterResult.length > 0 ? counterResult[0].number : 0;
    
    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify({ number }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error retrieving public project counter:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
