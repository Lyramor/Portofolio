// src/app/api/admin/experience/detail/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get id from URL search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }
    
    const experiences = await query(`
      SELECT e.id, e.period, e.position, e.company, e.description, 
      GROUP_CONCAT(s.label SEPARATOR ', ') as technologies
      FROM experience e
      LEFT JOIN experience_skills es ON e.id = es.experience_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);
    
    if (experiences.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    return NextResponse.json(experiences[0]);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, period, position, company, description, technologies } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }
    
    // Validate required fields
    if (!period || !position || !company) {
      return NextResponse.json({ error: 'Period, position, and company are required' }, { status: 400 });
    }
    
    // Check if the experience exists
    const existingExp = await query('SELECT id FROM experience WHERE id = ?', [id]);
    
    if (existingExp.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    // Update the experience
    await query(
      `UPDATE experience 
       SET period = ?, position = ?, company = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [period, position, company, description || null, id]
    );
    
    // Remove existing skill associations
    await query('DELETE FROM experience_skills WHERE experience_id = ?', [id]);
    
    // Add new skill associations if technologies are provided
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
          [id, skillId]
        );
      }
    }
    
    return NextResponse.json({ 
      id: parseInt(id),
      period,
      position,
      company,
      description,
      technologies
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}