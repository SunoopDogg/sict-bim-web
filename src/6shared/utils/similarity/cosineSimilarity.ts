export function getCosineSimilarity(token: string, value: string): number {
  // null이나 undefined 값 처리
  if (!token || !value) return 0;

  // 문자열을 벡터로 변환
  const tokenChars = token.toLowerCase().split('');
  const valueChars = String(value).toLowerCase().split('');

  // 모든 고유 문자 추출
  const uniqueChars = [...new Set([...tokenChars, ...valueChars])];

  // 벡터 계산 최적화
  const tokenFreq: Record<string, number> = {};
  const valueFreq: Record<string, number> = {};

  // 빈도수 계산
  for (const char of tokenChars) {
    tokenFreq[char] = (tokenFreq[char] || 0) + 1;
  }

  for (const char of valueChars) {
    valueFreq[char] = (valueFreq[char] || 0) + 1;
  }

  // 코사인 유사도 계산
  let dotProduct = 0;
  let tokenMagnitude = 0;
  let valueMagnitude = 0;

  for (const char of uniqueChars) {
    const tokenCount = tokenFreq[char] || 0;
    const valueCount = valueFreq[char] || 0;

    dotProduct += tokenCount * valueCount;
    tokenMagnitude += tokenCount * tokenCount;
    valueMagnitude += valueCount * valueCount;
  }

  tokenMagnitude = Math.sqrt(tokenMagnitude);
  valueMagnitude = Math.sqrt(valueMagnitude);

  // 둘 중 하나의 magnitude가 0이면 유사도는 0
  if (tokenMagnitude === 0 || valueMagnitude === 0) return 0;

  return dotProduct / (tokenMagnitude * valueMagnitude);
}
