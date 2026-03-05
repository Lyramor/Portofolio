import { getOrganizations, createOrganization } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await getOrganizations();
    return NextResponse.json({ organizations: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body.role || !body.organization) {
      return NextResponse.json({ error: 'Role and organization are required.' }, { status: 400 });
    }
    const id = await createOrganization(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
