import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notes - list notes, optionally filter by folderId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    const where: { folderId?: string | null } = {};
    if (folderId === 'unorganized') {
      where.folderId = null;
    } else if (folderId) {
      where.folderId = folderId;
    }

    const notes = await db.note.findMany({
      where,
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      include: {
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST /api/notes - create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, folderId } = body;

    // Get max order
    const whereClause: { folderId?: string | null } = {};
    if (folderId === 'unorganized') {
      whereClause.folderId = null;
    } else if (folderId) {
      whereClause.folderId = folderId;
    } else {
      whereClause.folderId = null;
    }

    const maxOrder = await db.note.findFirst({
      where: whereClause,
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const note = await db.note.create({
      data: {
        title: (title || 'Untitled Note').trim(),
        content: content || '',
        folderId: folderId === 'unorganized' ? null : (folderId || null),
        order: (maxOrder?.order ?? -1) + 1,
      },
      include: {
        folder: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
