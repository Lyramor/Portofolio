// src/app/api/admin/skills/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Get all skills (with optional filtering for archived status)
export async function GET(request) {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'active', 'archived', or 'all'

    let whereClause = '';
    if (filter === 'active') {
      whereClause = 'WHERE archived = 0';
    } else if (filter === 'archived') {
      whereClause = 'WHERE archived = 1';
    }
    // Jika filter adalah 'all' atau tidak ada filter, tidak perlu klausa WHERE tambahan

    // Get all skills from the database, order by the order field if it exists, otherwise by label
    // Menggunakan kolom `order` untuk pengurutan, dan `label` sebagai fallback
    const skills = await query(`SELECT * FROM skills ${whereClause} ORDER BY \`order\` ASC, label ASC`);
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new skill (Tidak ada perubahan pada POST)
export async function POST(request) {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { label, imgSrc, description } = await request.json();
    
    // Validate required fields
    if (!label || label.trim() === '') {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    // Get the maximum order value to place the new skill at the end
    const maxOrderResult = await query('SELECT MAX(`order`) as maxOrder FROM skills');
    const nextOrder = maxOrderResult[0].maxOrder !== null ? maxOrderResult[0].maxOrder + 1 : 0;

    // Insert skill into database with the next order value, default archived to 0
    const result = await query(
      'INSERT INTO skills (label, imgSrc, description, `order`, archived) VALUES (?, ?, ?, ?, ?)',
      [label, imgSrc || null, description || null, nextOrder, 0] // Default archived to 0 (false)
    );
    
    // Get the newly created skill
    const newSkill = await query('SELECT * FROM skills WHERE id = ?', [result.insertId]);
    
    return NextResponse.json(newSkill[0], { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
