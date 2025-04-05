import { NextRequest, NextResponse } from 'next/server';

import { getBimSimilarityTable } from '@/src/6shared/db/bim/bimService';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const collectionName = searchParams.get('collectionName');

    if (!collectionName) {
      return NextResponse.json({ error: 'collectionName을 입력해주세요.' }, { status: 400 });
    }

    // 유사도 결과 조회
    const results = await getBimSimilarityTable(collectionName);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: '유사도 분석 결과를 불러오는데 실패했습니다.' },
      { status: 500 },
    );
  }
}
