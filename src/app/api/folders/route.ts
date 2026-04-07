import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/folders - list all folders
export async function GET() {
  try {
    const folders = await db.folder.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { notes: true } },
      },
    });
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

// POST /api/folders - create a new folder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, parentId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Get the max order for siblings
    const maxOrder = await db.folder.findFirst({
      where: parentId ? { parentId } : { parentId: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const folder = await db.folder.create({
      data: {
        name: name.trim(),
        color: color || '#6366f1',
        parentId: parentId || null,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
