// src/app/api/experiences/route.js
import { NextResponse } from 'next/server';
import { getExperiencesWithSkills } from '@/lib/db'; // Mengambil fungsi dari db.js

export async function GET() {
  try {
    // Mengambil data pengalaman beserta skill terkait dari database
    const experiences = await getExperiencesWithSkills();
    
    // Memformat data agar 'technologies' berupa array label skill
    const formattedExperiences = experiences.map(exp => ({
      ...exp,
      // Jika ada skill, ambil labelnya dan jadikan array, jika tidak, array kosong
      technologies: exp.skills ? exp.skills.map(skill => skill.label) : []
    }));

    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify(formattedExperiences), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error fetching public experiences:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
