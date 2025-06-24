// src/app/api/admin/cv/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// GET: Retrieve the current CV link
export async function GET() {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cvData = await query('SELECT link_cv FROM cv LIMIT 1');
    
    // If no CV link exists, return an empty string or null
    if (cvData.length === 0) {
      return NextResponse.json({ link_cv: null });
    }

    return NextResponse.json({ link_cv: cvData[0].link_cv });
  } catch (error) {
    console.error('Error fetching CV link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update the CV link
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { link_cv } = await request.json();

    if (!link_cv || typeof link_cv !== 'string' || link_cv.trim() === '') {
      return NextResponse.json({ error: 'CV link is required' }, { status: 400 });
    }

    const existingCv = await query('SELECT id FROM cv LIMIT 1');

    if (existingCv.length === 0) {
      // No CV link exists, insert a new one
      await query('INSERT INTO cv (link_cv) VALUES (?)', [link_cv]);
      return NextResponse.json({ success: true, message: 'CV link added successfully' }, { status: 201 });
    } else {
      // CV link exists, update it
      await query('UPDATE cv SET link_cv = ?, uploaded_at = CURRENT_TIMESTAMP WHERE id = ?', [link_cv, existingCv[0].id]);
      return NextResponse.json({ success: true, message: 'CV link updated successfully' });
    }
  } catch (error) {
    console.error('Error saving CV link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove the CV link
export async function DELETE(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await query('DELETE FROM cv'); // Delete all (should only be one)
    return NextResponse.json({ success: true, message: 'CV link deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}