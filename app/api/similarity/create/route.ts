import { NextRequest, NextResponse } from 'next/server';

import { SimilarityMethod } from '@/src/5entities/similarity';
import {
  checkDuplicateBimSimilarity,
  deleteBimSimilarityResult,
  getSimilarityEachValues,
  saveBimSimilarityResult,
} from '@/src/6shared/db/bim';
import { findDocumentsInCollection } from '@/src/6shared/db/mongo';
import { combineTwoTokens, getToken, removeExceptParentheses } from '@/src/6shared/utils';
import {
  getCosineSimilarity,
  getJaccardSimilaritySimilarity,
  getNormalizedLevenshteinSimilarity,
} from '@/src/6shared/utils/similarity';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectionName, objectName, delimiter } = body;

    const documents = await findDocumentsInCollection('bim', collectionName, {
      Name: objectName,
    });

    for (const bimObject of documents) {
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

      for (const token of extendedTokens) {
        for (const method of Object.values(SimilarityMethod)) {
          const similarityFunction =
            method === SimilarityMethod.JACCARD
              ? getJaccardSimilaritySimilarity
              : method === SimilarityMethod.COSINE
                ? getCosineSimilarity
                : getNormalizedLevenshteinSimilarity;

          const similarityResults: Record<string, any> = getSimilarityEachValues(
            token,
            newBimObject,
            similarityFunction,
          );

          const isDuplicate = await checkDuplicateBimSimilarity(
            collectionName,
            objectName,
            method,
            token,
          );

          // 중복된 문서가 없을 경우에만 저장
          if (!isDuplicate) {
            await saveBimSimilarityResult(
              objectName,
              method,
              token,
              similarityResults,
              collectionName,
            );
          }
          // 중복된 문서가 있을 경우, 기존 문서에 유사도 결과를 추가
          else {
            await deleteBimSimilarityResult(collectionName, objectName, method, token);
            await saveBimSimilarityResult(
              objectName,
              method,
              token,
              similarityResults,
              collectionName,
            );
          }
        }
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
