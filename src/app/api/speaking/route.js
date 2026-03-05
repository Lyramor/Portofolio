import { getSpeaking } from '@/lib/db';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSpeaking();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
