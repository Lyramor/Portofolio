// src/app/api/admin/experience/reorder/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { experienceIds } = await request.json();
    
    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return NextResponse.json({ error: 'Invalid experience IDs' }, { status: 400 });
    }
    
    // First, add display_order column if it doesn't exist
    await query(`
      ALTER TABLE experience ADD COLUMN IF NOT EXISTS display_order INT DEFAULT NULL
    `);
    
    // Update the display order for each experience
    for (let i = 0; i < experienceIds.length; i++) {
      await query(
        'UPDATE experience SET display_order = ? WHERE id = ?',
        [i + 1, experienceIds[i]]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering experiences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}