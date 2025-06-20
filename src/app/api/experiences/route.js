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

    // Mengembalikan data pengalaman yang sudah diformat
    return NextResponse.json(formattedExperiences);
  } catch (error) {
    console.error('Error fetching public experiences:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}