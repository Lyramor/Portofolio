// src/app/api/projects/route.js (Public API)
import { NextResponse } from 'next/server';
import { getProjectsWithSkills } from '@/lib/db'; // Mengambil fungsi dari db.js

export async function GET() {
  try {
    // Mengambil semua proyek beserta skill terkait
    const projects = await getProjectsWithSkills();
    
    // Memformat data agar 'technologies' berupa array label skill
    const formattedProjects = projects.map(project => ({
      ...project,
      // Jika ada skill, ambil labelnya dan jadikan array, jika tidak, array kosong
      technologies: project.skills ? project.skills.map(skill => skill.label) : []
    }));

    // Mengembalikan data proyek yang sudah diformat
    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}