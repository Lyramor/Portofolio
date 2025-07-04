// src/app/api/admin/skills/list/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Verify authentication using getSessionUser
    const user = await getSessionUser(cookies());
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all skills ordered by their display order and then by label
    const skills = await db.query(
      'SELECT id, label, imgSrc FROM skills ORDER BY `order`, label'
    );

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error getting skills list:', error);
    return NextResponse.json({ error: 'Failed to get skills list' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';