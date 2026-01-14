// Rakuraku_Silo Content Script
// Injected into Google Forms pages to detect and fill form fields

import { matchLabelToKeywords } from '$lib/utils/fuzzyMatch';
import type { FillFormMessage, ProfileField, FillFormResultMessage } from '$lib/types';

console.log('[Rakuraku_Silo] Content script loaded on:', window.location.href);

// Google Forms field selectors
const FORM_SELECTORS = {
  // Question containers
  questionContainer: '[role="listitem"]',
  questionTitle: '[role="heading"]',
  
  // Input types
  textInput: 'input[type="text"]',
  textArea: 'textarea',
  emailInput: 'input[type="email"]',
  
  // Radio/Checkbox
  radioOption: '[role="radio"]',
  checkboxOption: '[role="checkbox"]',
  
  // Dropdown
  dropdown: '[role="listbox"]',
  dropdownOption: '[role="option"]',
};

interface FormField {
  label: string;
  element: HTMLInputElement | HTMLTextAreaElement;
  type: 'text' | 'email' | 'textarea' | 'radio' | 'checkbox' | 'dropdown';
}

/**
 * Detect all fillable form fields on the page
 */
function detectFormFields(): FormField[] {
  const fields: FormField[] = [];
  const questionContainers = document.querySelectorAll(FORM_SELECTORS.questionContainer);

  questionContainers.forEach((container) => {
    // Find the question title/label
    const titleElement = container.querySelector(FORM_SELECTORS.questionTitle);
    const label = titleElement?.textContent?.trim() || '';

    if (!label) return;

    // Find text inputs
    const textInput = container.querySelector(FORM_SELECTORS.textInput) as HTMLInputElement;
    if (textInput) {
      fields.push({ label, element: textInput, type: 'text' });
      return;
    }

    // Find email inputs
    const emailInput = container.querySelector(FORM_SELECTORS.emailInput) as HTMLInputElement;
    if (emailInput) {
      fields.push({ label, element: emailInput, type: 'email' });
      return;
    }

    // Find textareas
    const textarea = container.querySelector(FORM_SELECTORS.textArea) as HTMLTextAreaElement;
    if (textarea) {
      fields.push({ label, element: textarea, type: 'textarea' });
      return;
    }

    // Note: Radio, checkbox, and dropdown require special handling
    // For now, we focus on text-based inputs
  });

  console.log('[Rakuraku_Silo] Detected fields:', fields.map(f => f.label));
  return fields;
}

/**
 * Fill a form field with a value and dispatch proper events
 * Google Forms is reactive - we must dispatch events for the form to recognize changes
 */
function fillField(element: HTMLInputElement | HTMLTextAreaElement, value: string): boolean {
  try {
    // Set the value
    element.value = value;

    // Dispatch events in the correct order for Google Forms to recognize the change
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    console.log('[Rakuraku_Silo] Filled field with value:', value.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('[Rakuraku_Silo] Error filling field:', error);
    return false;
  }
}

/**
 * Match and fill form fields with profile data
 */
function fillFormFields(profileFields: ProfileField[], threshold: number = 0.7): { filledCount: number; totalFields: number } {
  const formFields = detectFormFields();
  let filledCount = 0;

  for (const formField of formFields) {
    // Try to match this form field with a profile field
    for (const profileField of profileFields) {
      if (!profileField.value.trim()) continue; // Skip empty profile fields

      const match = matchLabelToKeywords(formField.label, profileField.keywords, threshold);
      
      if (match.matched) {
        const success = fillField(formField.element, profileField.value);
        if (success) {
          filledCount++;
          console.log(`[Rakuraku_Silo] Matched "${formField.label}" → "${profileField.label}" (score: ${match.score.toFixed(2)})`);
          break; // Move to next form field after successful match
        }
      }
    }
  }

  return {
    filledCount,
    totalFields: formFields.length
  };
}

/**
 * Listen for messages from the popup or background script
 */
chrome.runtime.onMessage.addListener((message: FillFormMessage, sender, sendResponse) => {
  console.log('[Rakuraku_Silo] Content script received message:', message.type);

  if (message.type === 'FILL_FORM') {
    const { fields } = message.payload;
    
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      const result = fillFormFields(fields);
      
      const response: FillFormResultMessage = {
        type: 'FILL_FORM_RESULT',
        payload: {
          success: result.filledCount > 0,
          filledCount: result.filledCount,
          totalFields: result.totalFields
        }
      };
      
      sendResponse(response.payload);
    }, 100);
    
    return true; // Will respond asynchronously
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

// Visual indicator that extension is active on this page
function showActiveIndicator() {
  // Create a small indicator in the corner
  const indicator = document.createElement('div');
  indicator.id = 'rakuraku-silo-indicator';
  indicator.innerHTML = '🔒';
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
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.1)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  indicator.addEventListener('click', () => {
    // Open popup (this will trigger the extension popup)
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  });
  
  document.body.appendChild(indicator);
}

// Show indicator after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showActiveIndicator);
} else {
  showActiveIndicator();
}
