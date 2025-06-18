// src/app/api/admin/projects/[id]/route.js
import { NextResponse } from 'next/server';
import { getProjects, getProjectById, getProjectSkills, updateProject, deleteProject, updateProjectCounter } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Function to verify authentication
async function verifyAuth() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { authenticated: false };
    }
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth error:', error);
    return { authenticated: false };
  }
}

// GET a specific project with its skills
export async function GET(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get project details
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get skills for this project
    const skills = await getProjectSkills(id);

    // Add skills to project object
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
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const selectedSkills = formData.get('skills') ? JSON.parse(formData.get('skills')) : [];

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get current project data
    const currentProject = await getProjectById(id);
    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let imagePath = currentProject.image;
    const image = formData.get('image');
    
    // If there's a new image file, save it
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
      
      // Delete old image if it exists
      if (currentProject.image && currentProject.image.startsWith('/uploads/projects/')) {
        const oldImagePath = path.join(process.cwd(), 'public', currentProject.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Update project in database
    await updateProject(id, {
      title,
      description,
      image: imagePath,
      skills: selectedSkills
    });
    
    // Revalidate the page cache
    revalidatePath('/lyramor/projects');
    revalidatePath(`/lyramor/projects/${id}`);
    revalidatePath('/lyramor');
    
    return NextResponse.json({ 
      id: parseInt(id),
      title,
      description,
      image: imagePath,
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
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the project first to get the image path
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the project (this will also delete associated skills due to ON DELETE CASCADE)
    await deleteProject(id);
    
    // Delete the image if exists
    if (project.image && project.image.startsWith('/uploads/projects/')) {
      const imagePath = path.join(process.cwd(), 'public', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Update the counter - get current count
    const projects = await getProjects();
    await updateProjectCounter(projects.length);
    
    // Revalidate the page cache
    revalidatePath('/lyramor/projects');
    revalidatePath('/lyramor');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}