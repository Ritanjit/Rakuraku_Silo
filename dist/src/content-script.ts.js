import { matchLabelToKeywords } from "/src/lib/utils/fuzzyMatch.ts.js";
console.log("[Rakuraku_Silo] Content script loaded on:", window.location.href);
const FORM_SELECTORS = {
  // Question containers
  questionContainer: '[role="listitem"]',
  questionTitle: '[role="heading"]',
  // Input types
  textInput: 'input[type="text"]',
  textArea: "textarea",
  emailInput: 'input[type="email"]',
  // Radio/Checkbox
  radioOption: '[role="radio"]',
  checkboxOption: '[role="checkbox"]',
  // Dropdown
  dropdown: '[role="listbox"]',
  dropdownOption: '[role="option"]'
};
function detectFormFields() {
  const fields = [];
  const questionContainers = document.querySelectorAll(FORM_SELECTORS.questionContainer);
  questionContainers.forEach((container) => {
    const titleElement = container.querySelector(FORM_SELECTORS.questionTitle);
    const label = titleElement?.textContent?.trim() || "";
    if (!label) return;
    const textInput = container.querySelector(FORM_SELECTORS.textInput);
    if (textInput) {
      fields.push({ label, element: textInput, type: "text" });
      return;
    }
    const emailInput = container.querySelector(FORM_SELECTORS.emailInput);
    if (emailInput) {
      fields.push({ label, element: emailInput, type: "email" });
      return;
    }
    const textarea = container.querySelector(FORM_SELECTORS.textArea);
    if (textarea) {
      fields.push({ label, element: textarea, type: "textarea" });
      return;
    }
  });
  console.log("[Rakuraku_Silo] Detected fields:", fields.map((f) => f.label));
  return fields;
}
function fillField(element, value) {
  try {
    element.value = value;
    element.dispatchEvent(new Event("focus", { bubbles: true }));
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
    console.log("[Rakuraku_Silo] Filled field with value:", value.substring(0, 20) + "...");
    return true;
  } catch (error) {
    console.error("[Rakuraku_Silo] Error filling field:", error);
    return false;
  }
}
function fillFormFields(profileFields, threshold = 0.7) {
  const formFields = detectFormFields();
  let filledCount = 0;
  for (const formField of formFields) {
    for (const profileField of profileFields) {
      if (!profileField.value.trim()) continue;
      const match = matchLabelToKeywords(formField.label, profileField.keywords, threshold);
      if (match.matched) {
        const success = fillField(formField.element, profileField.value);
        if (success) {
          filledCount++;
          console.log(`[Rakuraku_Silo] Matched "${formField.label}" → "${profileField.label}" (score: ${match.score.toFixed(2)})`);
          break;
        }
      }
    }
  }
  return {
    filledCount,
    totalFields: formFields.length
  };
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Rakuraku_Silo] Content script received message:", message.type);
  if (message.type === "FILL_FORM") {
    const { fields } = message.payload;
    setTimeout(() => {
      const result = fillFormFields(fields);
      const response = {
        type: "FILL_FORM_RESULT",
        payload: {
          success: result.filledCount > 0,
          filledCount: result.filledCount,
          totalFields: result.totalFields
        }
      };
      sendResponse(response.payload);
    }, 100);
    return true;
  }
  if (message.type === "GET_FORM_FIELDS") {
    const fields = detectFormFields();
    sendResponse({
      success: true,
      fields: fields.map((f) => ({ label: f.label, type: f.type }))
    });
    return true;
  }
});
function showActiveIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "rakuraku-silo-indicator";
  indicator.innerHTML = "🔒";
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8B5CF6, #06B6D4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    z-index: 999999;
    cursor: pointer;
    transition: transform 0.2s ease;
  `;
  indicator.addEventListener("mouseenter", () => {
    indicator.style.transform = "scale(1.1)";
  });
  indicator.addEventListener("mouseleave", () => {
    indicator.style.transform = "scale(1)";
  });
  indicator.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });
  document.body.appendChild(indicator);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", showActiveIndicator);
} else {
  showActiveIndicator();
}
