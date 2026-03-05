import { getAwardById, updateAward, deleteAward } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(_, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await getAwardById(params.id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ award: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Award title is required.' }, { status: 400 });
    }
    await updateAward(params.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await deleteAward(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
