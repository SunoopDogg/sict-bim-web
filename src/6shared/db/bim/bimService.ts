import { insertJsonToCollection } from '../mongo/mongoService';

/**
 * BIM 객체의 각 값에 대해 유사도를 계산하는 함수
 *
 * @param tokens 토큰 리스트
 * @param bimObject BIM 객체
 * @param func 유사도 계산 함수
 * @returns 유사도 결과
 */
export function getSimilarityEachValues(
  tokens: string[],
  bimObject: Record<string, any>,
  func: (token: string, value: any) => number,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [k, v] of Object.entries(bimObject)) {
    if (typeof v === 'object' && v !== null) {
      // 값이 객체인 경우 재귀 호출
      result[k] = getSimilarityEachValues(tokens, v, func);
    } else {
      if (v === '') {
        continue;
      } else {
        const similarity: Record<string, number> = {};

        for (const token of tokens) {
          similarity[token] = func(token, v);
        }

        result[k] = { [String(v)]: similarity };
      }
    }
  }

  return result;
}

/**
 * BIM 객체의 유사도 결과를 MongoDB에 저장합니다.
 *
 * @param objectName 객체 이름
 * @param similarityObject 유사도 결과 객체
 * @param method 유사도 계산 방식 ('Jaccard Similarity' 또는 다른 방법)
 * @param fileName 컬렉션 이름으로 사용될 파일 이름
 */
export async function saveBimSimilarityResult(
  objectName: string,
  similarityObject: Record<string, any>,
  method: string = 'Jaccard Similarity',
  fileName: string,
): Promise<void> {
  try {
    // 결과 객체 생성
    const resultObject: Record<string, any> = {
      Name: objectName,
      Method: method,
      ...similarityObject,
    };

    // 결과를 'similarity' 컬렉션에 삽입
    await insertJsonToCollection('similarity', fileName, [resultObject]);
  } catch (error) {
    throw error;
  }
}
