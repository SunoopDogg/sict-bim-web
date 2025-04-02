import { NextRequest, NextResponse } from 'next/server';

import { getSimilarityEachValues, saveBimSimilarityResult } from '@/src/6shared/db/bim';
import { getAllDocumentsFromCollection } from '@/src/6shared/db/mongo';
import { combineTwoTokens, getToken, removeExceptParentheses } from '@/src/6shared/utils';
import { getJaccardSimilaritySimilarity } from '@/src/6shared/utils/similarity';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbName, collectionName, delimiter, method } = body;

    const documents = await getAllDocumentsFromCollection(dbName, collectionName);

    for (const bimObject of documents.slice(0, 1)) {
      // BIM 객체의 이름 가져오기
      const objectName = bimObject['Name'];

      // 특정 키를 제외한 새로운 BIM 객체 생성
      const newBimObject = Object.fromEntries(
        Object.entries(bimObject).filter(
          ([k]) => !['_id', 'Name', 'ObjectType', 'GlobalID', 'PredefinedType'].includes(k),
        ),
      );

      // 객체 이름에서 토큰 추출
      const tokens = getToken(removeExceptParentheses(objectName));
      // 토큰 조합하여 확장
      const extendedTokens = [...tokens];
      for (const del of delimiter) {
        extendedTokens.push(...combineTwoTokens(tokens, del));
      }

      const similarityResults: Record<string, any> = getSimilarityEachValues(
        extendedTokens,
        newBimObject,
        (token, value) => getJaccardSimilaritySimilarity(token, value),
      );

      // 유사도 결과를 MongoDB에 저장
      await saveBimSimilarityResult(
        objectName,
        similarityResults,
        'Jaccard Similarity',
        collectionName,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
