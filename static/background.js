// Rakuraku Background Service Worker
// Handles message passing between popup and content scripts

console.log('[Rakuraku] Background service worker started');

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Rakuraku] Received message:', message.type);

    switch (message.type) {
        case 'FILL_FORM':
            handleFillForm(message, sender.tab?.id)
                .then(sendResponse)
                .catch(error => {
                    console.error('[Rakuraku] Fill form error:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'GET_FORM_FIELDS':
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, message)
                    .then(sendResponse)
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true;
            }
            sendResponse({ success: false, error: 'No active tab' });
            break;

        default:
            console.log('[Rakuraku] Unknown message type:', message.type);
    }
});

// Handle fill form request from popup
async function handleFillForm(message, tabId) {
    if (!tabId) {
        return { success: false, error: 'No active tab' };
    }

    try {
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
    } catch (error) {
        console.error('[Rakuraku] Error sending to content script:', error);
        return { success: false, error: 'Could not reach the page. Make sure you are on a Google Form.' };
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Rakuraku] Extension installed:', details.reason);

    if (details.reason === 'install') {
        // Set default settings
        await chrome.storage.local.set({
            rakuraku_settings: { theme: 'dark', autofillEnabled: true }
        });
        console.log('[Rakuraku] Default settings created');
    }
});
