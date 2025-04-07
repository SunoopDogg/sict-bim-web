import {
  deleteDocumentInCollection,
  findDocumentsInCollection,
  insertJsonToCollection,
} from '../mongo/mongoService';

/**
 * BIM 객체의 각 값에 대해 유사도를 계산하는 함수
 *
 * @param token 토큰
 * @param bimObject BIM 객체
 * @param func 유사도 계산 함수
 * @returns 유사도 결과
 */
export function getSimilarityEachValues(
  token: string,
  bimObject: Record<string, any>,
  func: (token: string, value: any) => number,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [k, v] of Object.entries(bimObject)) {
    if (typeof v === 'object' && v !== null) {
      // 값이 객체인 경우 재귀 호출
      result[k] = getSimilarityEachValues(token, v, func);
    } else {
      if (v === '') {
        continue;
      } else {
        const similarity: Record<string, number> = {};

        similarity[token] = func(token, v);

        result[k] = { [String(v)]: func(token, v) };
      }
    }
  }

  return result;
}

/**
 * Name과 Method가 동일한 문서가 존재하는지 확인합니다.
 *
 * @param collectionName 컬렉션 이름
 * @param name 검색할 Name 값
 * @param method 검색할 Method 값
 * @returns 중복 문서가 존재하면 true, 그렇지 않으면 false
 */
export async function checkDuplicateBimSimilarity(
  collectionName: string,
  name: string,
  method: string,
  token: string,
): Promise<boolean> {
  try {
    // Name과 Method가 일치하는 문서 검색
    const query = { Name: name, Method: method, Token: token };
    const documents = await findDocumentsInCollection('similarity', collectionName, query);

    // 문서가 하나라도 존재하면 true 반환
    return documents.length > 0;
  } catch (error) {
    throw error;
  }
}

/**
 * 컬렉션에서 유사도 결과를 조회합니다.
 *
 * @param bimName 컬렉션 이름
 * @param objectName BIM 객체의 이름
 * @returns 유사도 결과 리스트
 */
export async function getBimSimilarityTable(bimName: string, objectName: string): Promise<any[]> {
  try {
    // 컬렉션의 모든 문서 조회
    const documents = await findDocumentsInCollection('similarity', bimName, {
      Name: objectName,
    });

    // SimilarityData 인터페이스에 맞게 데이터 변환
    const results: Array<{
      id: string;
      propertySet: string;
      propertyName: string;
      propertyValue: string;
      target: string;
      method: string;
      similarity: number;
    }> = [];

    for (const doc of documents) {
      const { _id, Name, Method, Token, ...properties } = doc;

      for (const [propertySet, first] of Object.entries(properties)) {
        if (typeof first === 'object' && first !== null) {
          for (const [propertyName, second] of Object.entries(first)) {
            if (typeof second === 'object' && second !== null) {
              for (const [propertyValue, third] of Object.entries(second)) {
                // if (third === null || third === undefined) {
                //   continue;
                // }

                results.push({
                  id: String(propertySet + propertyName + propertyValue + Token),
                  propertySet: String(propertySet),
                  propertyName: String(propertyName),
                  propertyValue: String(propertyValue),
                  target: String(Token),
                  method: String(Method),
                  similarity: Number(third),
                });
              }
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * BIM 객체의 유사도 결과를 MongoDB에 저장합니다.
 *
 * @param objectName BIM 객체의 이름
 * @param method 유사도 계산 방식
 * @param token 유사도 계산에 사용된 토큰
 * @param similarityObject 유사도 결과 객체
 * @param fileName 저장할 파일 이름
 */
export async function saveBimSimilarityResult(
  objectName: string,
  method: string,
  token: string,
  similarityObject: Record<string, any>,
  fileName: string,
): Promise<void> {
  try {
    // 결과 객체 생성
    const resultObject: Record<string, any> = {
      Name: objectName,
      Method: method,
      Token: token,
      ...similarityObject,
    };

    // 결과를 'similarity' 컬렉션에 삽입
    await insertJsonToCollection('similarity', fileName, [resultObject]);
  } catch (error) {
    throw error;
  }
}

/**
 * BIM 객체의 유사도 결과를 삭제
 *
 * @param collectionName 컬렉션 이름
 * @param objectName 삭제할 객체의 이름
 * @param method 삭제할 유사도 계산 방식
 */
export async function deleteBimSimilarityResult(
  collectionName: string,
  objectName: string,
  method: string,
  token: string,
): Promise<void> {
  try {
    // 결과 객체 삭제
    const query = { Name: objectName, Method: method, Token: token };
    await deleteDocumentInCollection('similarity', collectionName, query);
  } catch (error) {
    throw error;
  }
}
