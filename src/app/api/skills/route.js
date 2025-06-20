// src/app/api/skills/route.js
import { NextResponse } from 'next/server';
import { getSkills } from '@/lib/db'; // Mengambil fungsi getSkills dari db.js

export async function GET() {
  try {
    // Mengambil semua skill dari database
    // Fungsi getSkills sudah mengurutkan berdasarkan label secara default
    const skills = await getSkills(); 

    // Mengembalikan data skill
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching public skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}