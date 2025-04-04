export function getCosineSimilarity(token: string, value: string): number {
  // 문자열을 벡터로 변환
  const tokenChars = token.toLowerCase().split('');
  const valueChars = String(value).toLowerCase().split('');

  // 모든 고유 문자 추출
  const uniqueChars = [...new Set([...tokenChars, ...valueChars])];

  // 각 문자열에 대한 벡터 생성
  const tokenVector: number[] = [];
  const valueVector: number[] = [];

  for (const char of uniqueChars) {
    tokenVector.push(tokenChars.filter((c) => c === char).length);
    valueVector.push(valueChars.filter((c) => c === char).length);
  }

  // 코사인 유사도 계산
  let dotProduct = 0;
  let tokenMagnitude = 0;
  let valueMagnitude = 0;

  for (let i = 0; i < uniqueChars.length; i++) {
    dotProduct += tokenVector[i] * valueVector[i];
    tokenMagnitude += tokenVector[i] * tokenVector[i];
    valueMagnitude += valueVector[i] * valueVector[i];
  }

  tokenMagnitude = Math.sqrt(tokenMagnitude);
  valueMagnitude = Math.sqrt(valueMagnitude);

  return dotProduct / (tokenMagnitude * valueMagnitude) || 0;
}
