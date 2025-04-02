import { getToken, removeExceptParentheses } from '../preProcessing';

/**
 * 두 집합 간의 자카드 유사도를 계산합니다.
 * @param A 첫 번째 집합
 * @param B 두 번째 집합
 * @returns 자카드 유사도 (0~1 사이 값)
 */
export function jaccardSim(A: Set<string>, B: Set<string>): number {
  const intersection = new Set([...A].filter((x) => B.has(x)));
  const union = new Set([...A, ...B]);
  return intersection.size / union.size;
}

/**
 * 이름 목록과 값 목록에 대한 자카드 유사도를 계산합니다.
 * @param names 이름 목록
 * @param values 값 목록의 2차원 배열
 * @returns 각 이름에 대한 유사도 결과 배열
 */
export function getJaccardSimilarity(names: string[], values: (string | null)[][]): any[] {
  const result: any[] = [];

  for (let idx = 0; idx < names.length; idx++) {
    const name = names[idx];
    const tokens = getToken(removeExceptParentheses(name));

    const similarity: { [key: string]: number[] } = {};

    for (const token of tokens) {
      if (!similarity[token]) {
        similarity[token] = [];
      } else {
        continue;
      }

      for (const value of values[idx]) {
        if (value === null || value === undefined) {
          similarity[token].push(0);
        } else {
          const valueTokens = getToken(removeExceptParentheses(String(value)));
          similarity[token].push(jaccardSim(new Set(valueTokens), new Set([token])));
        }
      }
    }

    // TypeScript에서는 pandas DataFrame을 직접 사용할 수 없으므로
    // 데이터 구조를 JavaScript 객체로 변환합니다.
    const df: { [key: string]: { [token: string]: number } } = {};

    Object.keys(similarity).forEach((token) => {
      similarity[token].forEach((sim, i) => {
        const valueKey = values[idx][i] || 'null'; // null 값 처리
        if (!df[valueKey]) {
          df[valueKey] = {};
        }
        df[valueKey][token] = sim;
      });
    });

    result.push(df);
  }

  return result;
}

/**
 * 토큰과 값 사이의 자카드 유사도를 계산합니다.
 * @param token 토큰
 * @param value 비교할 값
 * @returns 자카드 유사도 값
 */
export function getJaccardSimilaritySimilarity(token: string, value: string | null): number {
  if (value === null) return 0;

  return jaccardSim(new Set(getToken(removeExceptParentheses(String(value)))), new Set([token]));
}
