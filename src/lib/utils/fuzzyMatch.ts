// Rakuraku_Silo Fuzzy Matching Utility
// Matches form field labels to profile field keywords

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = more similar
 */
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create distance matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill in the rest
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,     // deletion
                    dp[i][j - 1] + 1,     // insertion
                    dp[i - 1][j - 1] + 1  // substitution
                );
            }
        }
    }

    return dp[m][n];
}

/**
 * Calculate similarity score between 0 and 1
 * 1 = exact match, 0 = completely different
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 1;

    // Empty strings
    if (!s1 || !s2) return 0;

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
        const longerLen = Math.max(s1.length, s2.length);
        const shorterLen = Math.min(s1.length, s2.length);
        return shorterLen / longerLen;
    }

    // Calculate Levenshtein-based similarity
    const distance = levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);

    return 1 - (distance / maxLen);
}

/**
 * Check if a form label matches any of the keywords
 * Returns the best matching keyword and its score
 */
export function matchLabelToKeywords(
    label: string,
    keywords: string[],
    threshold: number = 0.7
): { matched: boolean; score: number; matchedKeyword: string | null } {
    const normalizedLabel = label.toLowerCase().trim();

    let bestScore = 0;
    let bestKeyword: string | null = null;

    for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();

        // Direct substring match (highest priority)
        if (normalizedLabel.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedLabel)) {
            const score = Math.max(0.9, calculateSimilarity(normalizedLabel, normalizedKeyword));
            if (score > bestScore) {
                bestScore = score;
                bestKeyword = keyword;
            }
        } else {
            // Fuzzy match
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

/**
 * Common form label patterns to field type mapping
 */
export function guessFieldTypeFromLabel(label: string): 'text' | 'email' | 'phone' | 'date' | 'url' | 'textarea' {
    const normalizedLabel = label.toLowerCase();

    if (/email|e-mail/.test(normalizedLabel)) return 'email';
    if (/phone|mobile|contact|tel/.test(normalizedLabel)) return 'phone';
    if (/date|birth|dob|expir/.test(normalizedLabel)) return 'date';
    if (/url|website|link|portfolio|github|linkedin/.test(normalizedLabel)) return 'url';
    if (/address|description|about|summary|letter|message|comments?|notes?/.test(normalizedLabel)) return 'textarea';

    return 'text';
}
