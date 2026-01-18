/**
 * AEGIS Background Service Worker
 * Handles extension lifecycle, message routing, and API coordination
 */

console.log('AEGIS Background Service Worker Loaded');

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});

/**
 * Message handler for communication between components
 * @param {Object} message - Message object
 * @param {chrome.runtime.MessageSender} sender - Message sender
 * @param {Function} sendResponse - Response callback
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    switch (message.type) {
        case 'PING':
            sendResponse({ status: 'pong' });
            break;

        case 'GET_STORAGE':
            chrome.storage.local.get(message.keys, (result) => {
                sendResponse({ data: result });
            });
            return true; // Keep channel open for async response

        case 'SET_STORAGE':
            chrome.storage.local.set(message.data, () => {
                sendResponse({ success: true });
            });
            return true;

        default:
            console.warn('Unknown message type:', message.type);
            sendResponse({ error: 'Unknown message type' });
    }
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('AegisOSINT installed for the first time');
        // Initialize default settings
        chrome.storage.local.set({
            settings: {
                theme: 'dark',
                apiKeys: {},
                stealth: {
                    userAgentRotation: true,
                    requestThrottling: true,
                    passiveMode: false,
                },
            },
        });
    } else if (details.reason === 'update') {
        console.log('AegisOSINT updated to version:', chrome.runtime.getManifest().version);
    }
});
