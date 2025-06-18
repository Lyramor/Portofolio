import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// GET handler to retrieve the about content
export async function GET(request) {
  try {
    // Autentikasi dengan sistem lyra_session
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const aboutData = await query('SELECT * FROM about ORDER BY id ASC LIMIT 1');
    
    if (aboutData.length === 0) {
      // Create default about content if none exists
      const defaultContent = "Welcome! I'm a web developer with a passion for building dynamic and user-friendly web applications. I focus on turning ideas into interactive digital experiences by blending creativity with solid technical skills.";
      
      const result = await query(
        'INSERT INTO about (content) VALUES (?)',
        [defaultContent]
      );
      
      return NextResponse.json({ 
        content: defaultContent, 
        id: result.insertId,
        isNewlyCreated: true
      });
    }
    
    return NextResponse.json({ 
      content: aboutData[0].content, 
      id: aboutData[0].id,
      created_at: aboutData[0].created_at,
      updated_at: aboutData[0].updated_at
    });
  } catch (error) {
    console.error('Error retrieving about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update the about content
export async function PUT(request) {
  try {
    // Autentikasi dengan sistem lyra_session
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required and cannot be empty' }, { status: 400 });
    }
    
    // Check if about record exists
    const existingData = await query('SELECT id FROM about LIMIT 1');
    
    if (existingData.length === 0) {
      // Create new about record
      const result = await query(
        'INSERT INTO about (content) VALUES (?)',
        [content]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'About content created successfully',
        id: result.insertId
      });
    } else {
      // Update existing record
      await query(
        'UPDATE about SET content = ? WHERE id = ?',
        [content, existingData[0].id]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'About content updated successfully',
        id: existingData[0].id
      });
    }
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}