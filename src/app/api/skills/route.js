// src/app/api/skills/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Mengambil fungsi query dari db.js

export async function GET() {
  try {
    // Mengambil semua skill dari database yang TIDAK diarsipkan
    // Urutkan berdasarkan kolom 'order' (atau 'display_order') secara ascending.
    // Jika ada skill yang tidak memiliki nilai 'order' (misalnya NULL),
    // atau jika ada skill dengan nilai 'order' yang sama,
    // maka skill tersebut akan diurutkan berdasarkan 'label' secara alfabetis.
    const skills = await query('SELECT * FROM skills WHERE archived = 0 ORDER BY `order` ASC, label ASC'); 

    // Mengembalikan data skill
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching public skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}
