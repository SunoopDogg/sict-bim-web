import { NextRequest, NextResponse } from 'next/server';

import { getAllDocumentsFromCollection } from '@/src/6shared/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const dbName = searchParams.get('dbName') || 'bim';
    const collectionName = searchParams.get('collectionName') || 'attribute-table';

    const documents = await getAllDocumentsFromCollection(dbName, collectionName);

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read the file.' }, { status: 500 });
  }
}
