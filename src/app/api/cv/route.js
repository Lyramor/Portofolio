// src/app/api/cv/route.js (Public API)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cvData = await query('SELECT link_cv FROM cv LIMIT 1');
    
    // If no CV link exists, return an empty string or null
    if (cvData.length === 0) {
      return NextResponse.json({ link_cv: null });
    }

    return NextResponse.json({ link_cv: cvData[0].link_cv });
  } catch (error) {
    console.error('Error retrieving public CV link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}