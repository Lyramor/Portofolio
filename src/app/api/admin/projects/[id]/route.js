// src/app/api/admin/projects/[id]/route.js
import { NextResponse } from 'next/server';
import { getProjects, getProjectById, getProjectSkills, updateProject, deleteProject, updateProjectCounter } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Function to verify authentication
async function verifyAuth(request) {
  try {
    const user = await getSessionUser(request.cookies);
    if (!user) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth error in projects/[id] API:', error);
    return { authenticated: false, error: 'Authentication error' };
  }
}

// GET a specific project with its skills
export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;

    // Ambil project details, termasuk link, order, dan archived
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const skills = await getProjectSkills(id);

    project.skills = skills;

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 });
  }
}

// PUT - Update a project
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const link = formData.get('link'); // Ambil data link
    const order = parseInt(formData.get('order'), 10); // Ambil data order
    const archived = formData.get('archived') === 'true'; // Ambil data archived (boolean dari string)
    const selectedSkills = formData.get('skills') ? JSON.parse(formData.get('skills')) : [];

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const currentProject = await getProjectById(id);
    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let imagePath = currentProject.image;
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
      
      if (currentProject.image && currentProject.image.startsWith('/uploads/projects/')) {
        const oldImagePath = path.join(process.cwd(), 'public', currentProject.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (formData.get('image_cleared') === 'true') {
      // Jika frontend memberi sinyal bahwa gambar dihapus
      imagePath = null;
      if (currentProject.image && currentProject.image.startsWith('/uploads/projects/')) {
        const oldImagePath = path.join(process.cwd(), 'public', currentProject.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }


    // Perbarui project di database, termasuk link, order, dan archived
    await updateProject(id, {
      title,
      description,
      image: imagePath,
      link,
      order, // Perbarui order
      archived, // Perbarui archived
      skills: selectedSkills
    });
    
    revalidatePath('/lyramor/projects');
    revalidatePath(`/lyramor/projects/${id}`);
    revalidatePath('/lyramor');
    revalidatePath('/api/projects'); // Revalidate API publik
    
    return NextResponse.json({ 
      id: parseInt(id),
      title,
      description,
      image: imagePath,
      link,
      order,
      archived,
      skill_ids: selectedSkills
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Remove a project
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = params;

    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await deleteProject(id);
    
    if (project.image && project.image.startsWith('/uploads/projects/')) {
      const imagePath = path.join(process.cwd(), 'public', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const projects = await getProjects();
    await updateProjectCounter(projects.length);
    
    revalidatePath('/lyramor/projects');
    revalidatePath('/lyramor');
    revalidatePath('/api/projects'); // Revalidate API publik
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';