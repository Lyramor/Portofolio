// src/app/api/about/route.js
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const aboutData = await query('SELECT * FROM about ORDER BY id ASC LIMIT 1');
    
    if (aboutData.length === 0) {
      return NextResponse.json({ 
        content: "Welcome! I'm a web developer with a passion for building dynamic and user-friendly web applications. I focus on turning ideas into interactive digital experiences by blending creativity with solid technical skills."
      });
    }
    
    return NextResponse.json({ content: aboutData[0].content });
  } catch (error) {
    console.error('Error retrieving about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}