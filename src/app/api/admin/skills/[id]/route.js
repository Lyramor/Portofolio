// src/app/api/admin/skills/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Menggunakan named export 'query'
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Helper function to verify authentication (adapted from existing patterns)
async function verifyAuth(request) {
  try {
    const user = await getSessionUser(request.cookies);
    if (!user) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth error in skill API:', error);
    return { authenticated: false, error: 'Authentication error' };
  }
}

// GET: Mengambil satu skill berdasarkan ID (Tidak ada perubahan)
export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;

    const skill = await query('SELECT * FROM skills WHERE id = ?', [id]);

    if (skill.length === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json(skill[0]);
  } catch (error) {
    console.error('Error getting skill by ID:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Memperbarui satu skill berdasarkan ID
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;
    // Tambahkan 'archived' ke sini
    const body = await request.json(); 
    const { label, imgSrc, description, archived } = body;

    // Validasi dasar
    if (!label || label.trim() === '') {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    // Periksa apakah skill ada
    const existingSkill = await query('SELECT imgSrc FROM skills WHERE id = ?', [id]);
    if (existingSkill.length === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Perbarui skill di database, termasuk status archived
    await query(
      'UPDATE skills SET label = ?, imgSrc = ?, description = ?, archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [label, imgSrc || null, description || null, archived, id] // Perbarui kolom 'archived'
    );

    // Revalidate the page cache jika diperlukan
    revalidatePath('/lyramor/skills');
    revalidatePath('/lyramor'); // Dashboard juga mungkin menampilkan skill
    revalidatePath('/api/skills'); // Revalidate API publik agar perubahan terlihat

    return NextResponse.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Menghapus satu skill berdasarkan ID (Tidak ada perubahan)
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;

    // Periksa apakah skill ada dan dapatkan imgSrc-nya jika ada file yang terkait
    const existingSkill = await query('SELECT imgSrc FROM skills WHERE id = ?', [id]);
    if (existingSkill.length === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const skillImgSrc = existingSkill[0].imgSrc;

    // Hapus skill dari database (junction table experience_skills dan project_skills akan ditangani oleh ON DELETE CASCADE)
    await query('DELETE FROM skills WHERE id = ?', [id]);

    // Hapus file gambar terkait jika ada dan itu adalah file yang diunggah secara lokal
    if (skillImgSrc && skillImgSrc.startsWith('/uploads/skills/')) {
      const imagePath = path.join(process.cwd(), 'public', skillImgSrc);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted old skill image: ${imagePath}`);
        }
      } catch (fileError) {
        console.warn(`Could not delete old skill image file ${imagePath}:`, fileError);
      }
    }
    
    // Revalidate the page cache
    revalidatePath('/lyramor/skills');
    revalidatePath('/lyramor'); // Dashboard juga mungkin menampilkan skill
    revalidatePath('/api/skills'); // Revalidate API publik agar perubahan terlihat

    return NextResponse.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';