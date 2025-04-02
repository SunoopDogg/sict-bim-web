/**
 * 소괄호 내부를 제외하고 특수문자를 공백으로 치환합니다.
 * @param text 처리할 텍스트
 * @returns 특수문자가 제거된 텍스트
 */
export function removeExceptParentheses(text: string): string {
  // 소괄호 내부를 제외하고 특수문자를 공백으로 치환
  return text.replace(/(?<!\()[^\w\s()](?![^(]*\))/g, ' ');
}

/**
 * 소괄호 내부를 보호하면서 텍스트를 토큰화합니다.
 * @param text 토큰화할 텍스트
 * @returns 토큰 배열
 */
export function getToken(text: string): string[] {
  // 소괄호 내부를 제외하고 토큰화
  const protectedText: string[] = [];

  // 괄호 안의 모든 내용 찾기
  const matches = text.match(/\([^)]*\)/g) || [];
  let processedText = text;

  // 괄호 내용을 임시로 대체
  matches.forEach((match, i) => {
    processedText = processedText.replace(match, `protected_text_${i}`);
    protectedText.push(match);
  });

  // 공백으로 분리
  let tokens = processedText.split(/\s+/).filter((token) => token.length > 0);

  // 보호된 텍스트 다시 복원
  tokens = tokens.map((token) => {
    let result = token;
    protectedText.forEach((originalText, i) => {
      result = result.replace(`protected_text_${i}`, originalText);
    });
    return result;
  });

  return tokens;
}

/**
 * 토큰 리스트에서 두 개의 토큰을 주어진 구분자로 결합하는 함수
 *
 * @param tokens 토큰 리스트
 * @param delimiter 토큰을 결합할 구분자
 * @returns 두 개의 토큰이 결합된 새로운 토큰 리스트
 */
export function combineTwoTokens(tokens: string[], delimiter: string): string[] {
  const combinedTokens: string[] = [];

  // Python의 permutations를 JavaScript로 구현
  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      if (i !== j) {
        combinedTokens.push(tokens[i] + delimiter + tokens[j]);
      }
    }
  }

  return combinedTokens;
}
