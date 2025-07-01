// 文件路径: src/app/api/notes/[id]/route.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    const client = await db.connect();
    await client.query('DELETE FROM notes WHERE id = $1;', [id]);
    client.release();
    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}