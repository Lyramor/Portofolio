// src/app/api/admin/counters/experience/route.js
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Get the current experience counter value
export async function GET() {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counter value
    const counterResult = await query('SELECT * FROM counter_experience LIMIT 1');
    
    if (counterResult.length === 0) {
      // Create default counter if none exists
      await query('INSERT INTO counter_experience (number) VALUES (?)', [0]);
      return NextResponse.json({ number: 0 });
    }
    
    return NextResponse.json({ number: counterResult[0].number });
  } catch (error) {
    console.error('Error retrieving experience counter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update the experience counter value
export async function PUT(request) {
  try {
    // Authentication
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { number } = await request.json();
    
    // Validate input
    if (typeof number !== 'number' || number < 0) {
      return NextResponse.json({ error: 'Invalid counter value' }, { status: 400 });
    }

    // Check if counter exists
    const counterResult = await query('SELECT * FROM counter_experience LIMIT 1');
    
    if (counterResult.length === 0) {
      // Create new counter
      await query('INSERT INTO counter_experience (number) VALUES (?)', [number]);
    } else {
      // Update existing counter
      await query('UPDATE counter_experience SET number = ? WHERE id = ?', [number, counterResult[0].id]);
    }
    
    return NextResponse.json({ success: true, number });
  } catch (error) {
    console.error('Error updating experience counter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}