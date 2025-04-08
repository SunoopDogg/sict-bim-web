/**
 * Levenshtein Distance 알고리즘을 통해 두 문자열 사이의 편집 거리를 계산합니다.
 * @param str1 첫 번째 문자열
 * @param str2 두 번째 문자열
 * @returns 두 문자열 간의 편집 거리
 */
export function getLevenshteinDistance(str1: string, str2: string): number {
  // null이나 undefined 값 처리
  if (!str1) return str2 ? str2.length : 0;
  if (!str2) return str1.length;

  // 행렬 초기화
  const matrix: number[][] = [];

  // 행렬 크기는 (str1.length+1) x (str2.length+1)
  const len1 = str1.length;
  const len2 = str2.length;

  // 첫 번째 행 초기화
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  // 첫 번째 열 초기화
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 행렬 값 채우기
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      // 문자가 같으면 대각선 값 그대로 사용
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // 다르면 삽입, 삭제, 대체 중 최소값 + 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 삭제
          matrix[i][j - 1] + 1, // 삽입
          matrix[i - 1][j - 1] + 1, // 대체
        );
      }
    }
  }

  // 최종 편집 거리 반환
  return matrix[len1][len2];
}

/**
 * 두 문자열의 유사도를 0~1 사이 값으로 정규화하여 반환합니다.
 * 1에 가까울수록 유사하고, 0에 가까울수록 다릅니다.
 * @param str1 첫 번째 문자열
 * @param str2 두 번째 문자열
 * @returns 정규화된 유사도 점수 (0~1)
 */
export function getNormalizedLevenshteinSimilarity(str1: string, str2: string): number {
  // null이나 undefined 값 처리
  if (!str1 && !str2) return 1; // 둘 다 비어있으면 완전히 같음
  if (!str1 || !str2) return 0; // 하나만 비어있으면 완전히 다름

  const distance = getLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  // 최대 길이로 나눠 정규화하고, 유사도로 변환 (1에서 빼기)
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * 두 문자열의 유사도를 백분율(%)로 반환합니다.
 * 100%에 가까울수록 유사하고, 0%에 가까울수록 다릅니다.
 * @param str1 첫 번째 문자열
 * @param str2 두 번째 문자열
 * @returns 백분율로 표시된 유사도 점수 (0~100%)
 */
export function getLevenshteinSimilarityPercentage(str1: string, str2: string): number {
  const similarity = getNormalizedLevenshteinSimilarity(str1, str2);
  return Math.round(similarity * 100);
}
