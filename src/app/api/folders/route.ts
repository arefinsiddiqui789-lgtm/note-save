import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const folders = await db.folder.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { notes: true } } },
    });
    return NextResponse.json(folders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const max = await db.folder.findFirst({
      where: { parentId: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const folder = await db.folder.create({
      data: {
        name: name.trim(),
        color: color || '#22d3ee',
        order: (max?.order ?? -1) + 1,
      },
      include: { _count: { select: { notes: true } } },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
