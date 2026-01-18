/**
 * AEGIS Content Script
 * Runs on web pages to enable page interaction and data extraction
 */

console.log('AEGIS Content Script Loaded');

/**
 * Extract visible text from the current page
 * @returns {string} Page text content
 */
function extractPageText() {
    return document.body.innerText;
}

/**
 * Extract all links from the current page
 * @returns {Array<string>} Array of URLs
 */
function extractLinks() {
    return Array.from(document.querySelectorAll('a[href]')).map(
        (a) => a.href
    );
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'EXTRACT_PAGE_TEXT':
            sendResponse({ text: extractPageText() });
            break;

        case 'EXTRACT_LINKS':
            sendResponse({ links: extractLinks() });
            break;

        default:
            sendResponse({ error: 'Unknown command' });
    }
});
