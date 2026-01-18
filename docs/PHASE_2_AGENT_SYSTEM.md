# Phase 2: Core Agent System & LLM Integration

**Duration:** Weeks 3-4  
**Goal:** Implement "The Inquisitor" agent with Gemini integration and conversation flow.

---

## Prerequisites

- Phase 1 completed successfully
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Extension running in development mode

---

## Task 2.1: LLM Integration (Gemini)

### Step 1: Install Vercel AI SDK
```bash
npm install ai @ai-sdk/google
```

### Step 2: Create Gemini Client (`src/lib/llm/gemini-client.js`)
```javascript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

/**
 * Gemini LLM Client for AegisOSINT
 */
export class GeminiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
    this.model = google('gemini-1.5-pro', { apiKey });
  }

  /**
   * Stream a chat completion
   * @param {Array<{role: string, content: string}>} messages - Conversation history
   * @param {Object} options - Additional options
   * @returns {Promise<ReadableStream>} Text stream
   */
  async streamChat(messages, options = {}) {
    try {
      const result = await streamText({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 2048,
      });

      return result.textStream;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.message?.includes('API key')) {
      return new Error('Invalid API key. Please check your Gemini API key in settings.');
    }
    if (error.message?.includes('quota')) {
      return new Error('API quota exceeded. Please check your Gemini usage limits.');
    }
    if (error.message?.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    return new Error(`Gemini API Error: ${error.message}`);
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Is valid
   */
  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.length > 20;
  }
}
```

### Step 3: Create API Key Storage Utility (`src/lib/utils/storage.js`)
```javascript
/**
 * Chrome Storage Utilities
 */

/**
 * Get value from chrome.storage.local
 * @param {string|string[]} keys - Storage keys
 * @returns {Promise<Object>} Stored values
 */
export async function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

/**
 * Set value in chrome.storage.local
 * @param {Object} items - Key-value pairs to store
 * @returns {Promise<void>}
 */
export async function setStorage(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

/**
 * Remove keys from chrome.storage.local
 * @param {string|string[]} keys - Keys to remove
 * @returns {Promise<void>}
 */
export async function removeStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
}

/**
 * Get API key from storage
 * @param {string} service - Service name (e.g., 'gemini', 'tavily')
 * @returns {Promise<string|null>} API key or null
 */
export async function getApiKey(service) {
  const result = await getStorage(['settings']);
  return result.settings?.apiKeys?.[service] || null;
}

/**
 * Save API key to storage
 * @param {string} service - Service name
 * @param {string} apiKey - API key
 * @returns {Promise<void>}
 */
export async function saveApiKey(service, apiKey) {
  const result = await getStorage(['settings']);
  const settings = result.settings || { apiKeys: {} };
  settings.apiKeys[service] = apiKey;
  await setStorage({ settings });
}
```

### Step 4: Create Settings Modal (`src/sidepanel/components/SettingsModal.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Zap } from 'lucide-react';
import { getApiKey, saveApiKey } from '../../lib/utils/storage';
import { GeminiClient } from '../../lib/llm/gemini-client';

function SettingsModal({ isOpen, onClose }) {
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    tavily: '',
    hibp: '',
    whois: '',
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen]);

  const loadApiKeys = async () => {
    const keys = {};
    for (const service of Object.keys(apiKeys)) {
      keys[service] = (await getApiKey(service)) || '';
    }
    setApiKeys(keys);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [service, key] of Object.entries(apiKeys)) {
        if (key) {
          await saveApiKey(service, key);
        }
      }
      alert('Settings saved successfully!');
      onClose();
    } catch (error) {
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const validateGeminiKey = async () => {
    if (!apiKeys.gemini) {
      setValidationStatus({ gemini: 'error', message: 'API key is required' });
      return;
    }

    setValidating(true);
    setValidationStatus({ gemini: 'validating' });

    try {
      const client = new GeminiClient(apiKeys.gemini);
      const stream = await client.streamChat([
        { role: 'user', content: 'Say "OK" if you can read this.' },
      ]);

      // Consume stream to verify it works
      for await (const chunk of stream) {
        // Just checking if we can read
      }

      setValidationStatus({ gemini: 'success', message: 'API key is valid!' });
    } catch (error) {
      setValidationStatus({ gemini: 'error', message: error.message });
    } finally {
      setValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-aegis-surface border border-aegis-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-aegis-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-aegis-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-aegis-primary" />
              <h3 className="text-md font-semibold">API Keys</h3>
            </div>

            <div className="space-y-4">
              {/* Gemini API Key */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Gemini API Key *
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeys.gemini}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, gemini: e.target.value })
                    }
                    placeholder="AIza..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={validateGeminiKey}
                    disabled={validating || !apiKeys.gemini}
                    className="btn-secondary disabled:opacity-50"
                  >
                    {validating ? 'Validating...' : 'Validate'}
                  </button>
                </div>
                {validationStatus.gemini && (
                  <p
                    className={`text-xs mt-1 ${
                      validationStatus.gemini === 'success'
                        ? 'text-aegis-accent'
                        : validationStatus.gemini === 'error'
                        ? 'text-aegis-danger'
                        : 'text-aegis-text-muted'
                    }`}
                  >
                    {validationStatus.message}
                  </p>
                )}
                <p className="text-xs text-aegis-text-muted mt-1">
                  Required for The Inquisitor agent.{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-aegis-primary hover:underline"
                  >
                    Get API key
                  </a>
                </p>
              </div>

              {/* Tavily API Key */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tavily AI API Key
                </label>
                <input
                  type="password"
                  value={apiKeys.tavily}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, tavily: e.target.value })
                  }
                  placeholder="tvly-..."
                  className="input-field w-full"
                />
                <p className="text-xs text-aegis-text-muted mt-1">
                  Optional. Used by The Scout for web search.
                </p>
              </div>

              {/* Other API Keys */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  HaveIBeenPwned API Key
                </label>
                <input
                  type="password"
                  value={apiKeys.hibp}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, hibp: e.target.value })
                  }
                  placeholder="Optional"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  WhoisXML API Key
                </label>
                <input
                  type="password"
                  value={apiKeys.whois}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, whois: e.target.value })
                  }
                  placeholder="Optional"
                  className="input-field w-full"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-aegis-border">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
```

### Step 5: Update Header to Open Settings (`src/sidepanel/components/Header.jsx`)
```javascript
import React, { useState } from 'react';
import { Shield, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-aegis-border bg-aegis-surface">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-aegis-primary" />
          <h1 className="text-lg font-semibold">AegisOSINT</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-aegis-bg rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

export default Header;
```

---

## Task 2.2: The Inquisitor Agent

### Step 1: Create Agent System Prompt (`src/agents/prompts.js`)
```javascript
/**
 * System prompts for AegisOSINT agents
 */

export const INQUISITOR_SYSTEM_PROMPT = `You are The Inquisitor, the Mission Control agent for AegisOSINT, an advanced OSINT investigation framework.

YOUR ROLE:
- Parse user queries and formulate investigation plans
- Detect ambiguous queries and ask clarifying questions
- Coordinate with other specialized agents (The Scout, The Auditor, The Cartographer)
- Maintain conversation context and guide the investigation

CAPABILITIES:
- Intent Classification: Determine if the user wants to search, verify, visualize, or report
- Disambiguation: When a query is too broad (e.g., "Find John Doe"), ask specific questions to narrow down the target
- Investigation Planning: Break down complex requests into actionable steps

DISAMBIGUATION PROTOCOL:
When you detect a common name or broad query:
1. Acknowledge the ambiguity
2. Ask 2-3 specific questions to narrow down the target (location, profession, age range, known affiliations)
3. Wait for user response before proceeding

RESPONSE STYLE:
- Professional but conversational
- Concise and actionable
- Always cite sources when presenting findings
- Use confidence scores (0-100%) when appropriate

EXAMPLE DISAMBIGUATION:
User: "Find information about Robert Smith"
You: "I found multiple individuals named Robert Smith. To ensure accuracy, please help me narrow this down:
1. What is their approximate location or country?
2. Do you know their profession or industry?
3. Any known affiliations (company, university, social media handle)?"

Remember: Accuracy is paramount. When in doubt, ask for clarification rather than guessing.`;

export const SCOUT_SYSTEM_PROMPT = `You are The Scout, the data acquisition specialist for AegisOSINT.

YOUR ROLE:
- Execute searches across multiple OSINT sources
- Extract and structure data from web pages
- Apply stealth techniques to avoid detection

TOOLS AT YOUR DISPOSAL:
- Tavily AI (web search)
- GitHub API (for .patch trick)
- HaveIBeenPwned (breach data)
- WhoisXML (domain intelligence)

Always attribute findings to their sources.`;

// More agent prompts will be added in later phases
```

### Step 2: Create The Inquisitor Agent (`src/agents/inquisitor.js`)
```javascript
import { GeminiClient } from '../lib/llm/gemini-client';
import { getApiKey } from '../lib/utils/storage';
import { INQUISITOR_SYSTEM_PROMPT } from './prompts';

/**
 * The Inquisitor - Mission Control Agent
 */
export class InquisitorAgent {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
  }

  /**
   * Initialize the agent with API key
   * @returns {Promise<void>}
   */
  async initialize() {
    const apiKey = await getApiKey('gemini');
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please add it in Settings.');
    }
    this.client = new GeminiClient(apiKey);
  }

  /**
   * Process a user query and stream the response
   * @param {string} userMessage - User's message
   * @param {Function} onChunk - Callback for each text chunk
   * @param {Function} onComplete - Callback when stream completes
   * @returns {Promise<void>}
   */
  async processQuery(userMessage, onChunk, onComplete) {
    if (!this.client) {
      await this.initialize();
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Prepare messages with system prompt
    const messages = [
      { role: 'system', content: INQUISITOR_SYSTEM_PROMPT },
      ...this.conversationHistory,
    ];

    try {
      const stream = await this.client.streamChat(messages);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        onChunk(chunk);
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });

      onComplete(fullResponse);
    } catch (error) {
      console.error('Inquisitor processing error:', error);
      throw error;
    }
  }

  /**
   * Classify user intent
   * @param {string} query - User query
   * @returns {'search'|'verify'|'visualize'|'report'|'unknown'}
   */
  classifyIntent(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.match(/find|search|look up|investigate/)) {
      return 'search';
    }
    if (lowerQuery.match(/verify|check|confirm|validate/)) {
      return 'verify';
    }
    if (lowerQuery.match(/show|visualize|graph|map/)) {
      return 'visualize';
    }
    if (lowerQuery.match(/report|export|summarize/)) {
      return 'report';
    }

    return 'unknown';
  }

  /**
   * Detect if query is ambiguous
   * @param {string} query - User query
   * @returns {boolean}
   */
  isAmbiguous(query) {
    // Check for common names without context
    const commonNames = ['john', 'smith', 'robert', 'michael', 'david', 'james'];
    const hasCommonName = commonNames.some((name) =>
      query.toLowerCase().includes(name)
    );

    // Check if query lacks specificity
    const hasLocation = /\b(in|from|located|based)\b/i.test(query);
    const hasProfession = /\b(ceo|developer|engineer|doctor|lawyer)\b/i.test(query);
    const hasContext = hasLocation || hasProfession;

    return hasCommonName && !hasContext;
  }

  /**
   * Clear conversation history
   */
  reset() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array<{role: string, content: string}>}
   */
  getHistory() {
    return this.conversationHistory;
  }
}
```

### Step 3: Update Chat Interface to Use Agent (`src/sidepanel/components/ChatInterface.jsx`)
```javascript
import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import MessageList from './MessageList';
import { InquisitorAgent } from '../../agents/inquisitor';

// Create agent instance
const inquisitor = new InquisitorAgent();

function ChatInterface() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const { messages, addMessage, isStreaming, setStreaming, setAgentStatus } = useStore();
  const inputRef = useRef(null);
  const streamingMessageRef = useRef('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // Start streaming
    setStreaming(true);
    setAgentStatus('thinking');
    streamingMessageRef.current = '';

    // Add placeholder for agent message
    const agentMessageId = crypto.randomUUID();
    addMessage({
      id: agentMessageId,
      role: 'agent',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    });

    try {
      await inquisitor.processQuery(
        userMessage,
        // On chunk
        (chunk) => {
          streamingMessageRef.current += chunk;
          // Update the streaming message in store
          useStore.setState((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === agentMessageId
                ? { ...msg, content: streamingMessageRef.current }
                : msg
            ),
          }));
        },
        // On complete
        (fullResponse) => {
          setStreaming(false);
          setAgentStatus('idle');
          // Mark message as complete
          useStore.setState((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === agentMessageId
                ? { ...msg, content: fullResponse, isStreaming: false }
                : msg
            ),
          }));
        }
      );
    } catch (err) {
      console.error('Agent error:', err);
      setError(err.message);
      setStreaming(false);
      setAgentStatus('idle');
      
      // Remove the placeholder message
      useStore.setState((state) => ({
        messages: state.messages.filter((msg) => msg.id !== agentMessageId),
      }));
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mx-4 mt-4 p-3 bg-aegis-danger/10 border border-aegis-danger rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-aegis-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-aegis-danger font-medium">Error</p>
            <p className="text-xs text-aegis-text-secondary mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-aegis-danger hover:text-red-400"
          >
            ×
          </button>
        </div>
      )}

      <MessageList messages={messages} />

      <form onSubmit={handleSubmit} className="p-4 border-t border-aegis-border bg-aegis-surface">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? 'The Inquisitor is thinking...' : 'Ask The Inquisitor...'}
            className="input-field flex-1"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInterface;
```

### Step 4: Update Message Component for Streaming (`src/sidepanel/components/MessageList.jsx`)
Add streaming indicator:

```javascript
// Add to Message component
function Message({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isStreaming = message.isStreaming;

  // ... existing code ...

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-aegis-primary' : 'bg-aegis-secondary'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-aegis-primary text-white'
            : 'bg-aegis-surface border border-aegis-border'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-aegis-primary animate-pulse ml-1" />
          )}
        </div>
        <p className="text-xs text-aegis-text-muted mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

---

## Task 2.3: Testing & Validation

### Test Cases

#### Test 1: Basic Conversation
1. Open side panel
2. Enter: "Hello, who are you?"
3. Verify: Agent introduces itself as The Inquisitor

#### Test 2: Disambiguation
1. Enter: "Find information about John Smith"
2. Verify: Agent asks clarifying questions about location, profession, etc.

#### Test 3: Intent Classification
1. Enter: "Search for Robert Johnson in New York"
2. Verify: Agent recognizes search intent and proceeds

#### Test 4: API Key Validation
1. Go to Settings
2. Enter invalid API key
3. Click "Validate"
4. Verify: Error message appears

#### Test 5: Streaming
1. Ask a question
2. Verify: Response appears word-by-word (streaming)
3. Verify: Cursor blinks during streaming

#### Test 6: Error Handling
1. Remove API key from settings
2. Try to send a message
3. Verify: Friendly error message appears

---

## Deliverables Checklist

- [x] Vercel AI SDK integrated
- [x] Gemini client created with error handling
- [x] API key storage utilities
- [x] Settings modal with validation
- [x] Inquisitor agent with system prompt
- [x] Streaming chat responses
- [x] Intent classification logic
- [x] Disambiguation detection
- [x] Error handling UI
- [x] Conversation history management

---

## Success Criteria

✅ User can configure Gemini API key  
✅ API key validation works  
✅ Chat responses stream in real-time  
✅ Agent detects ambiguous queries  
✅ Agent asks clarifying questions  
✅ Conversation persists across sessions  
✅ Error messages are user-friendly  
✅ Agent status updates correctly  

---

## Next Steps

Proceed to **Phase 3: The Scout - Data Acquisition** where we'll integrate Tavily, HIBP, and implement the GitHub Patch Trick.

---

## Troubleshooting

### Streaming doesn't work
- Check Gemini API key is valid
- Verify network requests in DevTools
- Check for CORS issues

### Agent doesn't respond
- Check browser console for errors
- Verify API key is saved in storage
- Test API key with validation button

### Messages don't update during streaming
- Check Zustand store updates
- Verify message ID matching logic
- Check React re-rendering
