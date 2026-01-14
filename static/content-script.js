// Rakuraku Content Script
// Injected into Google Forms pages to detect and fill form fields

console.log('[Rakuraku] Content script loaded on:', window.location.href);

// Google Forms field selectors
const FORM_SELECTORS = {
  questionContainer: '[role="listitem"]',
  questionTitle: '[role="heading"]',
  textInput: 'input[type="text"]',
  textArea: 'textarea',
  emailInput: 'input[type="email"]',
};

/**
 * Calculate Levenshtein distance between two strings
 */
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
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function similarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

/**
 * Match a form label to profile field keywords
 */
function matchLabelToKeywords(label, keywords, threshold = 0.7) {
  const normalizedLabel = label.toLowerCase().trim();
  let bestScore = 0;
  let bestKeyword = '';

  for (const keyword of keywords) {
    // Exact match
    if (normalizedLabel === keyword.toLowerCase()) {
      return { matched: true, score: 1, keyword };
    }
    // Contains match
    if (normalizedLabel.includes(keyword.toLowerCase())) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestKeyword = keyword;
      }
      continue;
    }
    // Fuzzy match
    const score = similarity(normalizedLabel, keyword);
    if (score > bestScore) {
      bestScore = score;
      bestKeyword = keyword;
    }
  }

  return {
    matched: bestScore >= threshold,
    score: bestScore,
    keyword: bestKeyword
  };
}

/**
 * Detect all fillable form fields on the page
 */
function detectFormFields() {
  const fields = [];
  const questionContainers = document.querySelectorAll(FORM_SELECTORS.questionContainer);

  questionContainers.forEach((container) => {
    const titleElement = container.querySelector(FORM_SELECTORS.questionTitle);
    const label = titleElement?.textContent?.trim() || '';
    if (!label) return;

    const textInput = container.querySelector(FORM_SELECTORS.textInput);
    if (textInput) {
      fields.push({ label, element: textInput, type: 'text' });
      return;
    }

    const emailInput = container.querySelector(FORM_SELECTORS.emailInput);
    if (emailInput) {
      fields.push({ label, element: emailInput, type: 'email' });
      return;
    }

    const textarea = container.querySelector(FORM_SELECTORS.textArea);
    if (textarea) {
      fields.push({ label, element: textarea, type: 'textarea' });
      return;
    }
  });

  console.log('[Rakuraku] Detected fields:', fields.map(f => f.label));
  return fields;
}

/**
 * Fill a form field with a value and dispatch proper events
 */
function fillField(element, value) {
  try {
    element.value = value;
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[Rakuraku] Filled field with:', value.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('[Rakuraku] Error filling field:', error);
    return false;
  }
}

/**
 * Match and fill form fields with profile data
 */
function fillFormFields(profileFields, threshold = 0.7) {
  const formFields = detectFormFields();
  let filledCount = 0;

  for (const formField of formFields) {
    for (const profileField of profileFields) {
      if (!profileField.value?.trim()) continue;

      const match = matchLabelToKeywords(formField.label, profileField.keywords || [], threshold);
      
      if (match.matched) {
        const success = fillField(formField.element, profileField.value);
        if (success) {
          filledCount++;
          console.log(`[Rakuraku] Matched "${formField.label}" → "${profileField.label}" (score: ${match.score.toFixed(2)})`);
          break;
        }
      }
    }
  }

  return { filledCount, totalFields: formFields.length };
}

/**
 * Listen for messages from the popup or background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Rakuraku] Content script received message:', message.type);

  if (message.type === 'FILL_FORM') {
    const { fields } = message.payload;
    
    setTimeout(() => {
      const result = fillFormFields(fields);
      sendResponse({
        success: result.filledCount > 0,
        filledCount: result.filledCount,
        totalFields: result.totalFields
      });
    }, 100);
    
    return true;
  }

  if (message.type === 'GET_FORM_FIELDS') {
    const fields = detectFormFields();
    sendResponse({
      success: true,
      fields: fields.map(f => ({ label: f.label, type: f.type }))
    });
    return true;
  }
});

// Visual indicator that extension is active
function showActiveIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'rakuraku-indicator';
  indicator.innerHTML = '🔒';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e85d5d, #d94a4a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 15px rgba(232, 93, 93, 0.4);
    z-index: 999999;
    cursor: pointer;
    transition: transform 0.2s ease;
  `;
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.1)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(indicator);
}

// Show indicator after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showActiveIndicator);
} else {
  showActiveIndicator();
}
