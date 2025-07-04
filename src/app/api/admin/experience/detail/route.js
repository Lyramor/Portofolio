// src/app/api/admin/experience/detail/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

export async function GET(request) {
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
    
    const experiences = await query(`
      SELECT e.id, e.period, e.position, e.company, e.description, 
      GROUP_CONCAT(s.id) as skill_ids_raw 
      FROM experience e
      LEFT JOIN experience_skills es ON e.id = es.experience_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);
    
    if (experiences.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    const experienceData = experiences[0];
    const formattedSkillIds = experienceData.skill_ids_raw ? experienceData.skill_ids_raw.split(',').map(sId => parseInt(sId)) : [];

    return NextResponse.json({
      ...experienceData,
      skill_ids: formattedSkillIds 
    });
  } catch (error) {
    console.error('Error fetching experience detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, period, position, company, description, skillIds } = await request.json(); 
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }
    
    if (!period || !position || !company) {
      return NextResponse.json({ error: 'Period, position, and company are required.' }, { status: 400 });
    }
    
    const existingExp = await query('SELECT id FROM experience WHERE id = ?', [id]);
    
    if (existingExp.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    await query(
      `UPDATE experience 
       SET period = ?, position = ?, company = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [period, position, company, description || null, id]
    );
    
    await query('DELETE FROM experience_skills WHERE experience_id = ?', [id]);
    
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await query(
          'INSERT INTO experience_skills (experience_id, skill_id) VALUES (?, ?)',
          [id, skillId]
        );
      }
    }

    // Revalidate paths setelah update
    revalidatePath('/lyramor/experience'); // Untuk halaman admin experience
    revalidatePath('/api/experiences'); // Untuk API publik yang digunakan di halaman utama
    revalidatePath('/'); // Untuk halaman utama jika menampilkan pengalaman langsung
    
    return NextResponse.json({ 
      id: parseInt(id),
      period,
      position,
      company,
      description,
      skillIds 
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';