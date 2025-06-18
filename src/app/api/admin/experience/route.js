// src/app/api/admin/experience/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if display_order column exists
    const checkColumn = await query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'experience' 
      AND COLUMN_NAME = 'display_order'
    `);
    
    // If display_order column doesn't exist, add it
    if (checkColumn[0].count === 0) {
      await query(`
        ALTER TABLE experience ADD COLUMN display_order INT DEFAULT NULL
      `);
    }

    // Get experiences ordered by display_order if exists, otherwise id
    const experiences = await query(`
      SELECT e.id, e.period, e.position, e.company, e.description, 
      GROUP_CONCAT(s.label SEPARATOR ', ') as technologies,
      e.display_order
      FROM experience e
      LEFT JOIN experience_skills es ON e.id = es.experience_id
      LEFT JOIN skills s ON es.skill_id = s.id
      GROUP BY e.id
      ORDER BY 
        CASE WHEN e.display_order IS NULL THEN 1 ELSE 0 END,
        e.display_order ASC, 
        e.id DESC
    `);

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period, position, company, description, technologies } = await request.json();
    
    // Validate required fields
    if (!period || !position || !company) {
      return NextResponse.json({ error: 'Period, position, and company are required' }, { status: 400 });
    }
    
    // Get the highest display_order to put this new item at the top
    const maxOrderResult = await query('SELECT MAX(display_order) as maxOrder FROM experience');
    const nextOrder = maxOrderResult[0].maxOrder ? maxOrderResult[0].maxOrder + 1 : 1;
    
    // Create the experience entry
    const result = await query(
      `INSERT INTO experience (period, position, company, description, display_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [period, position, company, description || null, nextOrder]
    );
    
    // If technologies were provided, associate them with skills
    if (technologies) {
      const techArray = technologies.split(',').map(tech => tech.trim());
      
      for (const tech of techArray) {
        // Check if the skill exists
        let skillQuery = await query('SELECT id FROM skills WHERE label = ?', [tech]);
        let skillId;
        
        if (skillQuery.length === 0) {
          // Create the skill if it doesn't exist
          const skillResult = await query(
            'INSERT INTO skills (label, imgSrc) VALUES (?, ?)',
            [tech, '/images/skills/default.svg']
          );
          skillId = skillResult.insertId;
        } else {
          skillId = skillQuery[0].id;
        }
        
        // Associate the skill with the experience
        await query(
          'INSERT INTO experience_skills (experience_id, skill_id) VALUES (?, ?)',
          [result.insertId, skillId]
        );
      }
    }
    
    return NextResponse.json({ 
      id: result.insertId,
      period,
      position,
      company,
      description,
      technologies
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}