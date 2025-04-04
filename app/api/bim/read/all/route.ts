import { NextRequest, NextResponse } from 'next/server';

import { getAllCollections } from '@/src/6shared/db/mongo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const dbName = searchParams.get('dbName') || 'bim';

    const collections = await getAllCollections(dbName);

    // 컬렉션 이름을 Table에 맞는 형식으로 변환
    const formattedCollections = collections.map((name) => ({
      name,
    }));

    return NextResponse.json(formattedCollections);
  } catch (error) {
    return NextResponse.json({ error: '컬렉션 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
