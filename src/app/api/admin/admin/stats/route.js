// src/app/api/admin/stats/route.js

import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    // Autentikasi dengan sistem lyra_session
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get count of all entities 
    const projectsCount = await query('SELECT COUNT(*) as count FROM projects');
    const skillsCount = await query('SELECT COUNT(*) as count FROM skills');
    const aboutCount = await query('SELECT COUNT(*) as count FROM about');
    const experienceCount = await query('SELECT COUNT(*) as count FROM experience');
    const counterProjectsCount = await query('SELECT COUNT(*) as count FROM counter_projects');
    const counterExperienceCount = await query('SELECT COUNT(*) as count FROM counter_experience');
    const usersCount = await query('SELECT COUNT(*) as count FROM users');

    return NextResponse.json({ 
      projects: projectsCount[0].count, 
      skills: skillsCount[0].count, 
      about: aboutCount[0].count, 
      experience: experienceCount[0].count, 
      counterProjects: counterProjectsCount[0].count, 
      counterExperience: counterExperienceCount[0].count, 
      users: usersCount[0].count 
    });
  } catch (error) {
    console.error('Error retrieving dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';