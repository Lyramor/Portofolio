// src/app/api/counters/experience/route.js (Public API)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mengambil nilai 'number' dari tabel counter_experience
    // Jika tidak ada record, default ke 0
    const counterResult = await query('SELECT number FROM counter_experience LIMIT 1');
    const number = counterResult.length > 0 ? counterResult[0].number : 0;
    
    return NextResponse.json({ number });
  } catch (error) {
    console.error('Error retrieving public experience counter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}