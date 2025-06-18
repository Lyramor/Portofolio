// src/app/api/admin/skills/reorder/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Reorder skills
export async function PUT(request) {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { skills } = await request.json();
    
    // Validate skills array
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Invalid skills array' }, { status: 400 });
    }

    // Update each skill's order in the database
    const updatePromises = skills.map(skill => {
      const { id, order } = skill;
      
      if (!id || isNaN(parseInt(id)) || order === undefined || isNaN(parseInt(order))) {
        throw new Error('Invalid skill ID or order');
      }
      
      return query('UPDATE skills SET `order` = ? WHERE id = ?', [order, id]);
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Skills reordered successfully' 
    });
  } catch (error) {
    console.error('Error reordering skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}