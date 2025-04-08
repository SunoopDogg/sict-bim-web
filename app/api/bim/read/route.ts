import { NextRequest, NextResponse } from 'next/server';

import { getSearchedPaginatedDocuments } from '@/src/6shared/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const dbName = searchParams.get('dbName') || 'bim';
    const collectionName = searchParams.get('collectionName') || 'attribute-table';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const searchField = searchParams.get('searchField') || 'Name';

    const { items: documents, total } = await getSearchedPaginatedDocuments(
      dbName,
      collectionName,
      page,
      pageSize,
      search,
      searchField,
    );

    return NextResponse.json({
      items: documents,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to read the documents.' }, { status: 500 });
  }
}
