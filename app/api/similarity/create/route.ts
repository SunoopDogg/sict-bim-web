import { NextRequest, NextResponse } from 'next/server';

import { SimilarityMethod } from '@/src/5entities/similarity';
import {
  checkDuplicateBimSimilarity,
  deleteBimSimilarityResult,
  getSimilarityEachValues,
  saveBimSimilarityResult,
} from '@/src/6shared/db/bim';
import { getAllDocumentsFromCollection } from '@/src/6shared/db/mongo';
import { combineTwoTokens, getToken, removeExceptParentheses } from '@/src/6shared/utils';
import {
  getCosineSimilarity,
  getJaccardSimilaritySimilarity,
} from '@/src/6shared/utils/similarity';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbName, collectionName, delimiter, method } = body;

    // 유효한 method 값인지 검증
    if (!Object.values(SimilarityMethod).includes(method as SimilarityMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid similarity method. Supported methods: ${Object.values(SimilarityMethod).join(', ')}`,
        },
        { status: 400 },
      );
    }

    const documents = await getAllDocumentsFromCollection(dbName, collectionName);

    for (const bimObject of documents.slice(0, 1)) {
      // BIM 객체의 이름 가져오기
      const objectName = bimObject['Name'];

      // 객체 이름에서 토큰 추출
      const tokens = getToken(removeExceptParentheses(objectName));
      // 토큰 조합하여 확장
      const extendedTokens = [...tokens];
      for (const del of delimiter) {
        extendedTokens.push(...combineTwoTokens(tokens, del));
      }

      // 특정 키를 제외한 새로운 BIM 객체 생성
      const newBimObject = Object.fromEntries(
        Object.entries(bimObject).filter(
          ([k]) => !['_id', 'Name', 'ObjectType', 'GlobalID', 'PredefinedType'].includes(k),
        ),
      );

      // method에 따라 적절한 유사도 함수 선택
      const similarityFunction =
        method === SimilarityMethod.COSINE ? getCosineSimilarity : getJaccardSimilaritySimilarity;

      const similarityResults: Record<string, any> = getSimilarityEachValues(
        extendedTokens,
        newBimObject,
        similarityFunction,
      );

      const isDuplicate = await checkDuplicateBimSimilarity(collectionName, objectName, method);

      // 중복된 문서가 없을 경우에만 저장
      if (!isDuplicate) {
        await saveBimSimilarityResult(objectName, similarityResults, method, collectionName);
      }
      // 중복된 문서가 있을 경우, 기존 문서에 유사도 결과를 추가
      else {
        await deleteBimSimilarityResult(collectionName, objectName, method);
        await saveBimSimilarityResult(objectName, similarityResults, method, collectionName);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Similarity results saved successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while calculating similarity.',
      },
      { status: 500 },
    );
  }
}
