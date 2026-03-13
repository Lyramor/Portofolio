// src/app/api/admin/cv/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';

// GET: Retrieve the current CV link
export async function GET() {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cvData = await query('SELECT link_cv FROM cv LIMIT 1');
    if (cvData.length === 0) return NextResponse.json({ link_cv: null });
    return NextResponse.json({ link_cv: cvData[0].link_cv });
  } catch (error) {
    console.error('Error fetching CV link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update — accepts JSON (link) or FormData (PDF file)
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';
    let link_cv;

    if (contentType.includes('multipart/form-data')) {
      // PDF file upload
      const formData = await request.formData();
      const file = formData.get('cv_file');

      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cv');
      await mkdir(uploadDir, { recursive: true });

      // Delete old PDF file if it was a local upload
      const existing = await query('SELECT link_cv FROM cv LIMIT 1');
      if (existing.length > 0 && existing[0].link_cv?.startsWith('/uploads/cv/')) {
        const oldPath = path.join(process.cwd(), 'public', existing[0].link_cv);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const timestamp  = Date.now();
      const randomStr  = Math.random().toString(36).substring(2, 8);
      const fileName   = `cv-${timestamp}-${randomStr}.pdf`;
      const filePath   = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      link_cv = `/uploads/cv/${fileName}`;
    } else {
      // JSON link
      const body = await request.json();
      link_cv = body.link_cv;
      if (!link_cv || typeof link_cv !== 'string' || link_cv.trim() === '') {
        return NextResponse.json({ error: 'CV link is required' }, { status: 400 });
      }
    }

    const existingCv = await query('SELECT id FROM cv LIMIT 1');
    if (existingCv.length === 0) {
      await query('INSERT INTO cv (link_cv) VALUES (?)', [link_cv]);
    } else {
      await query('UPDATE cv SET link_cv = ?, uploaded_at = CURRENT_TIMESTAMP WHERE id = ?', [link_cv, existingCv[0].id]);
    }

    return NextResponse.json({ success: true, link_cv });
  } catch (error) {
    console.error('Error saving CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove the CV link/file
export async function DELETE() {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await query('SELECT link_cv FROM cv LIMIT 1');
    if (existing.length > 0 && existing[0].link_cv?.startsWith('/uploads/cv/')) {
      const oldPath = path.join(process.cwd(), 'public', existing[0].link_cv);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await query('DELETE FROM cv');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
