// src/app/api/admin/experience/delete/route.js
export async function DELETE(request) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const user = await getSessionUser(cookieStore);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }
    
    // Check if the experience exists
    const existingExp = await query('SELECT id FROM experience WHERE id = ?', [id]);
    
    if (existingExp.length === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    // Delete the experience
    await query('DELETE FROM experience WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}