import { NextRequest, NextResponse } from 'next/server';

import { getPaginatedCollections } from '@/src/6shared/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const dbName = searchParams.get('dbName') || 'bim';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';

    // 페이지네이션된 컬렉션 가져오기
    const { items: collectionNames, total } = await getPaginatedCollections(
      dbName,
      page,
      pageSize,
      search,
    );

    // 컬렉션 이름을 Table에 맞는 형식으로 변환
    const formattedCollections = collectionNames.map((name) => ({
      name,
    }));

    return NextResponse.json({
      items: formattedCollections,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '컬렉션 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
