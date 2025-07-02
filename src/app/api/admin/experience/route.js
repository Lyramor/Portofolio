// src/app/api/admin/experience/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function GET() {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkColumn = await query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'experience' 
      AND COLUMN_NAME = 'display_order'
    `);
    
    if (checkColumn[0].count === 0) {
      await query(`
        ALTER TABLE experience ADD COLUMN display_order INT DEFAULT NULL
      `);
    }

    const experiences = await query(`
      SELECT e.id, e.period, e.position, e.company, e.description, 
      GROUP_CONCAT(s.label SEPARATOR ', ') as technologies, 
      e.display_order,
      GROUP_CONCAT(s.id) as skill_ids_raw 
      FROM experience e
      LEFT JOIN experience_skills es ON e.id = es.experience_id
      LEFT JOIN skills s ON es.skill_id = s.id
      GROUP BY e.id
      ORDER BY 
        CASE WHEN e.display_order IS NULL THEN 1 ELSE 0 END,
        e.display_order ASC, 
        e.id DESC
    `);

    const formattedExperiences = experiences.map(exp => ({
      ...exp,
      skill_ids: exp.skill_ids_raw ? exp.skill_ids_raw.split(',').map(id => parseInt(id)) : []
    }));

    return NextResponse.json({ experiences: formattedExperiences });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { period, position, company, description, skillIds } = await request.json(); 
    
    if (!period || !position || !company) {
      return NextResponse.json({ error: 'Period, position, and company are required.' }, { status: 400 });
    }
    
    const maxOrderResult = await query('SELECT MAX(display_order) as maxOrder FROM experience');
    const nextOrder = maxOrderResult[0].maxOrder ? maxOrderResult[0].maxOrder + 1 : 1;
    
    const result = await query(
      `INSERT INTO experience (period, position, company, description, display_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [period, position, company, description || null, nextOrder]
    );
    
    const experienceId = result.insertId;

    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await query(
          'INSERT INTO experience_skills (experience_id, skill_id) VALUES (?, ?)',
          [experienceId, skillId]
        );
      }
    }
    
    // Revalidate paths setelah membuat pengalaman baru
    revalidatePath('/lyramor/experience'); // Untuk halaman admin experience
    revalidatePath('/api/experiences'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan pengalaman langsung

    return NextResponse.json({ 
      id: experienceId,
      period,
      position,
      company,
      description,
      skillIds 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
