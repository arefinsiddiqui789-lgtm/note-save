import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      include: { folder: { select: { id: true, name: true, color: true } } },
    });

    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, folderId } = await request.json();

    const whereClause: { folderId?: string | null } = { folderId: null };
    if (folderId && folderId !== 'unorganized') {
      whereClause.folderId = folderId;
    }

    const max = await db.note.findFirst({
      where: whereClause,
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const note = await db.note.create({
      data: {
        title: (title || 'Untitled Note').trim(),
        content: content || '',
        folderId: folderId === 'unorganized' ? null : (folderId || null),
        order: (max?.order ?? -1) + 1,
      },
      include: { folder: { select: { id: true, name: true, color: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
