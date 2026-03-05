import { getOrganizationById, updateOrganization, deleteOrganization } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(_, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await getOrganizationById(params.id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ organization: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body.role || !body.organization) {
      return NextResponse.json({ error: 'Role and organization are required.' }, { status: 400 });
    }
    await updateOrganization(params.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const user = await getSessionUser(cookies());
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await deleteOrganization(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
