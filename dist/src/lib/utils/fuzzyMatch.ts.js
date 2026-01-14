function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          // deletion
          dp[i][j - 1] + 1,
          // insertion
          dp[i - 1][j - 1] + 1
          // substitution
        );
      }
    }
  }
  return dp[m][n];
}
export function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerLen = Math.max(s1.length, s2.length);
    const shorterLen = Math.min(s1.length, s2.length);
    return shorterLen / longerLen;
  }
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}
export function matchLabelToKeywords(label, keywords, threshold = 0.7) {
  const normalizedLabel = label.toLowerCase().trim();
  let bestScore = 0;
  let bestKeyword = null;
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (normalizedLabel.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedLabel)) {
      const score = Math.max(0.9, calculateSimilarity(normalizedLabel, normalizedKeyword));
      if (score > bestScore) {
        bestScore = score;
        bestKeyword = keyword;
      }
    } else {
      const score = calculateSimilarity(normalizedLabel, normalizedKeyword);
      if (score > bestScore) {
        bestScore = score;
        bestKeyword = keyword;
      }
    }
  }
  return {
    matched: bestScore >= threshold,
    score: bestScore,
    matchedKeyword: bestScore >= threshold ? bestKeyword : null
  };
}
export function guessFieldTypeFromLabel(label) {
  const normalizedLabel = label.toLowerCase();
  if (/email|e-mail/.test(normalizedLabel)) return "email";
  if (/phone|mobile|contact|tel/.test(normalizedLabel)) return "phone";
  if (/date|birth|dob|expir/.test(normalizedLabel)) return "date";
  if (/url|website|link|portfolio|github|linkedin/.test(normalizedLabel)) return "url";
  if (/address|description|about|summary|letter|message|comments?|notes?/.test(normalizedLabel)) return "textarea";
  return "text";
}
