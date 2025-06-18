// src/app/api/admin/projects/route.js - GET and POST endpoints
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser, withAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// GET all projects with their associated skills
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get projects with their skills
    const projects = await db.query(`
      SELECT 
        p.*, 
        GROUP_CONCAT(s.id) as skill_ids,
        GROUP_CONCAT(s.label) as skill_labels
      FROM projects p
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN skills s ON ps.skill_id = s.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Format the projects data to include skills as an array
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
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const selectedSkills = formData.get('skills') ? JSON.parse(formData.get('skills')) : [];
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let imagePath = null;
    const image = formData.get('image');
    
    // If there's an image file, save it
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate a unique filename
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Write the file
      fs.writeFileSync(filePath, buffer);
      imagePath = `/uploads/projects/${fileName}`;
    }

    // Insert project into database
    const result = await db.query(
      'INSERT INTO projects (title, description, image) VALUES (?, ?, ?)',
      [title, description, imagePath]
    );
    
    const projectId = result.insertId;
    
    // Insert skill associations if any
    if (selectedSkills.length > 0) {
      const skillInserts = selectedSkills.map(skillId => {
        return db.query(
          'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)',
          [projectId, skillId]
        );
      });
      
      await Promise.all(skillInserts);
    }
    
    // Update the counter
    await db.query('UPDATE counter_projects SET number = (SELECT COUNT(*) FROM projects)');
    
    // Revalidate the page cache
    revalidatePath('/lyramor/projects');
    revalidatePath('/lyramor');
    
    return NextResponse.json({ 
      id: projectId,
      title,
      description,
      image: imagePath,
      skill_ids: selectedSkills
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}