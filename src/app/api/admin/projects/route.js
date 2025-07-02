// src/app/api/admin/projects/route.js - GET and POST endpoints
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Fungsi bantuan untuk memverifikasi autentikasi
async function verifyAuth(request) {
  try {
    const user = await getSessionUser(request.cookies);
    if (!user) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth error in projects API:', error);
    return { authenticated: false, error: 'Authentication error' };
  }
}

// GET all projects with their associated skills
export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'active', 'archived', or 'all'

    let whereClause = '';
    if (filter === 'active') {
      whereClause = 'WHERE p.archived = 0';
    } else if (filter === 'archived') {
      whereClause = 'WHERE p.archived = 1';
    }
    // Jika filter adalah 'all' atau tidak ada filter, tidak perlu klausa WHERE tambahan

    // Pastikan kolom `link`, `order`, dan `archived` diambil di sini
    const projects = await db.query(`
      SELECT 
        p.*, 
        GROUP_CONCAT(s.id) as skill_ids,
        GROUP_CONCAT(s.label) as skill_labels
      FROM projects p
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.\`order\` ASC, p.created_at DESC
    `);

    const formattedProjects = projects.map(project => {
      return {
        ...project,
        skill_ids: project.skill_ids ? project.skill_ids.split(',').map(id => parseInt(id)) : [],
        skill_labels: project.skill_labels ? project.skill_labels.split(',') : []
      };
    });

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error getting projects:', error);
    return NextResponse.json({ error: 'Failed to get projects' }, { status: 500 });
  }
}

// POST - Create a new project
export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const link = formData.get('link'); // Ambil data link
    const selectedSkills = formData.get('skills') ? JSON.parse(formData.get('skills')) : [];
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let imagePath = null;
    const image = formData.get('image');
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      imagePath = `/uploads/projects/${fileName}`;
    }

    // Dapatkan order tertinggi yang ada untuk proyek baru
    const maxOrderResult = await db.query('SELECT MAX(`order`) as maxOrder FROM projects');
    const nextOrder = maxOrderResult[0].maxOrder !== null ? maxOrderResult[0].maxOrder + 1 : 0;

    // Masukkan project ke database, termasuk link, order, dan archived (default 0)
    const result = await db.query(
      'INSERT INTO projects (title, description, image, link, `order`, archived) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, imagePath, link || null, nextOrder, 0] // Simpan order dan default archived ke 0
    );
    
    const projectId = result.insertId;
    
    if (selectedSkills.length > 0) {
      const skillInserts = selectedSkills.map(skillId => {
        return db.query(
          'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)',
          [projectId, skillId]
        );
      });
      
      await Promise.all(skillInserts);
    }
    
    await db.query('UPDATE counter_projects SET number = (SELECT COUNT(*) FROM projects)');
    
    revalidatePath('/lyramor/projects');
    revalidatePath('/lyramor');
    revalidatePath('/api/projects'); // Revalidate API publik
    
    return NextResponse.json({ 
      id: projectId,
      title,
      description,
      image: imagePath,
      link, // Kembalikan link
      skill_ids: selectedSkills
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
