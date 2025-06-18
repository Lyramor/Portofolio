// src/app/api/admin/skills/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Get all skills
export async function GET() {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all skills from the database, order by the order field if it exists, otherwise by label
    const skills = await query('SELECT * FROM skills ORDER BY `order` ASC, label ASC');
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new skill
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

    // Insert skill into database with the next order value
    const result = await query(
      'INSERT INTO skills (label, imgSrc, description, `order`) VALUES (?, ?, ?, ?)',
      [label, imgSrc || null, description || null, nextOrder]
    );
    
    // Get the newly created skill
    const newSkill = await query('SELECT * FROM skills WHERE id = ?', [result.insertId]);
    
    return NextResponse.json(newSkill[0], { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}