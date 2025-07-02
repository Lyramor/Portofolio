// src/app/api/admin/experience/delete/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function DELETE(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }
    
    const existingExp = await query('SELECT id FROM experience WHERE id = ?', [id]);
    
    if (existingExp.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    await query('DELETE FROM experience WHERE id = ?', [id]);
    
    // Revalidate paths setelah delete
    revalidatePath('/lyramor/experience'); // Untuk halaman admin experience
    revalidatePath('/api/experiences'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan pengalaman langsung

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
