// src/app/api/admin/projects/reorder/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectIds } = await request.json();
    
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json({ error: 'Invalid project IDs' }, { status: 400 });
    }
    
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = parseInt(projectIds[i], 10);
      if (isNaN(projectId)) {
          console.warn(`Invalid project ID found during reorder: ${projectIds[i]}`);
          continue;
      }

      await query(
        'UPDATE projects SET `order` = ? WHERE id = ?',
        [i, projectId] // Mengatur urutan baru (dimulai dari 0)
      );
    }
    
    revalidatePath('/lyramor/projects'); // Untuk halaman admin projects
    revalidatePath('/api/projects'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan proyek langsung

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return NextResponse.json({ error: 'Internal server error during reorder' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';