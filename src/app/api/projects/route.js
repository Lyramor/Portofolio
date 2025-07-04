// src/app/api/projects/route.js (Public API)
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mengambil semua proyek beserta skill terkait yang TIDAK diarsipkan
    const projects = await query('SELECT * FROM projects WHERE archived = 0 ORDER BY `order` ASC, created_at DESC');
    
    // Memformat data agar 'technologies' berupa array label skill.
    // Asumsi: `project.skill_labels` adalah string yang digabungkan dari label skill.
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: project.skill_labels ? project.skill_labels.split(',') : [] 
    }));

    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify(formattedProjects), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error fetching public projects:', error);
    // Pastikan respons error juga dalam format JSON yang valid
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
