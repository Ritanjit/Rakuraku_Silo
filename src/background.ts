// Rakuraku_Silo Background Service Worker
// Handles message passing between popup and content scripts

import { localStore } from '$lib/services/LocalStoreService';
import type { ExtensionMessage, FillFormMessage } from '$lib/types';

console.log('[Rakuraku_Silo] Background service worker started');

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    console.log('[Rakuraku_Silo] Received message:', message.type);

    switch (message.type) {
        case 'FILL_FORM':
            handleFillForm(message as FillFormMessage, sender.tab?.id)
                .then(sendResponse)
                .catch(error => {
                    console.error('[Rakuraku_Silo] Fill form error:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Will respond asynchronously

        case 'GET_FORM_FIELDS':
            // Forward to content script
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, message)
                    .then(sendResponse)
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true;
            }
            sendResponse({ success: false, error: 'No active tab' });
            break;

        default:
            console.log('[Rakuraku_Silo] Unknown message type:', message.type);
    }
});

// Handle fill form request from popup
async function handleFillForm(message: FillFormMessage, tabId?: number): Promise<{ success: boolean; filledCount?: number; error?: string }> {
    if (!tabId) {
        return { success: false, error: 'No active tab' };
    }

    try {
        // Send fill command to content script
        const response = await chrome.tabs.sendMessage(tabId, message);
        return response;
    } catch (error) {
        console.error('[Rakuraku_Silo] Error sending to content script:', error);
        return { success: false, error: 'Could not reach the page. Make sure you are on a Google Form.' };
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Rakuraku_Silo] Extension installed:', details.reason);

    if (details.reason === 'install') {
        // First time install - create default profile
        try {
            const profile = await localStore.getProfile();
            if (!profile) {
                await localStore.createDefaultProfile();
                console.log('[Rakuraku_Silo] Default profile created');
            }
        } catch (error) {
            console.error('[Rakuraku_Silo] Error creating default profile:', error);
        }
    }
});
