// src/app/api/admin/experience/reorder/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { experienceIds } = await request.json();
    
    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return NextResponse.json({ error: 'Invalid experience IDs' }, { status: 400 });
    }
    
    // Baris ini redundan jika kolom sudah ditambahkan oleh GET route atau secara manual,
    // tetapi tidak berbahaya untuk tetap ada.
    // Pastikan kolom `display_order` sudah ada di tabel `experience` di database Anda.
    await query(`
      ALTER TABLE experience ADD COLUMN IF NOT EXISTS display_order INT DEFAULT NULL
    `);
    
    // Loop melalui setiap ID pengalaman dan perbarui display_order-nya
    for (let i = 0; i < experienceIds.length; i++) {
      await query(
        'UPDATE experience SET display_order = ? WHERE id = ?',
        [i + 1, experienceIds[i]] // Mengatur urutan baru (dimulai dari 1)
      );
    }
    
    // Revalidate paths untuk memastikan data terbaru ditampilkan di frontend
    revalidatePath('/lyramor/experience'); // Untuk halaman admin experience
    revalidatePath('/api/experiences'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan pengalaman langsung

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering experiences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
