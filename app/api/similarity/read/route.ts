import { NextRequest, NextResponse } from 'next/server';

import { getBimSimilarityTable } from '@/src/6shared/db/bim';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const bim = searchParams.get('bim');
    const on = searchParams.get('on');

    if (!bim || !on) {
      return NextResponse.json({ error: 'bim과 on 파라미터는 필수입니다.' }, { status: 400 });
    }

    // 유사도 결과 조회
    const results = await getBimSimilarityTable(bim, on);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: '유사도 분석 결과를 불러오는데 실패했습니다.' },
      { status: 500 },
    );
  }
}
