// src/app/api/skills/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Mengambil fungsi query dari db.js

export async function GET() {
  try {
    // Mengambil semua skill dari database yang TIDAK diarsipkan
    // Urutkan berdasarkan kolom 'order' (atau 'display_order') secara ascending.
    // Jika ada skill yang tidak memiliki nilai 'order' (misalnya NULL),
    // atau jika skill dengan nilai 'order' yang sama,
    // maka skill tersebut akan diurutkan berdasarkan 'label' secara alfabetis.
    const skills = await query('SELECT * FROM skills WHERE archived = 0 ORDER BY `order` ASC, label ASC'); 

    // Tambahkan header Cache-Control untuk caching di halaman utama
    return new NextResponse(JSON.stringify(skills), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Cache selama 5 menit
      },
    });
  } catch (error) {
    console.error('Error fetching public skills:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
