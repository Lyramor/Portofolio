// src/app/api/about/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const aboutData = await query('SELECT * FROM about ORDER BY id ASC LIMIT 1');
    
    let content = "Welcome! I'm a web developer with a strong passion for building dynamic and user-friendly web applications. I focus on turning ideas into interactive digital experiences by blending creativity with solid technical skills.";
    if (aboutData.length > 0) {
      content = aboutData[0].content;
    }
    
    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error retrieving public about content:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
