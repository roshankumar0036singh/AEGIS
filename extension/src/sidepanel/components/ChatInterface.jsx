import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, StopCircle, Search, Mail, Github } from 'lucide-react';
import useStore from '../store/useStore';
import MessageList from './MessageList';
import { cn } from '../../lib/utils/helpers';

function ChatInterface() {
    const [input, setInput] = useState('');
    const { messages, addMessage, isStreaming, setStreaming, agentStatus } = useStore();
    const inputRef = useRef(null);
    const textareaRef = useRef(null);
    const [charCount, setCharCount] = useState(0);
    const maxChars = 500;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userMessage = input.trim();
        setInput('');
        setCharCount(0);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Add user message
        addMessage({
            role: 'user',
            content: userMessage,
            timestamp: Date.now(),
        });

        // Simulate agent response (will be replaced with real agent in Phase 2)
        setStreaming(true);
        setTimeout(() => {
            addMessage({
                role: 'agent',
                content: `I received your query: "${userMessage}"\n\nThe Inquisitor agent will be integrated in Phase 2 to provide real AI-powered responses. For now, I can confirm that:\n\n✓ Your message was received\n✓ State management is working\n✓ UI is responsive\n\nStay tuned for full OSINT capabilities!`,
                timestamp: Date.now(),
            });
            setStreaming(false);
        }, 1500);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxChars) {
            setInput(value);
            setCharCount(value.length);

            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            }
        }
    };

    const handleStop = () => {
        setStreaming(false);
    };

    const handleQuickAction = (text) => {
        setInput(text);
        inputRef.current?.focus();
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Agent Status Bar */}
            {agentStatus !== 'idle' && (
                <div className="glass-card mx-4 mt-4 px-4 py-2 rounded-lg border-l-4 border-aegis-primary animate-fade-in">
                    <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-aegis-primary animate-pulse" />
                        <span className="text-aegis-text-secondary">
                            The Inquisitor is <span className="text-aegis-primary font-medium">{agentStatus}</span>...
                        </span>
                    </div>
                </div>
            )}

            {/* Messages */}
            <MessageList messages={messages} />

            {/* Input Area */}
            <div className="p-4 space-y-2.5 bg-aegis-bg/95 backdrop-blur-md border-t border-aegis-border/50">
                {/* Search Bar */}
                <form onSubmit={handleSubmit} className="relative">
                    <div className="search-bar-container">
                        <textarea
                            ref={(el) => {
                                inputRef.current = el;
                                textareaRef.current = el;
                            }}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask The Inquisitor... (Shift+Enter for new line)"
                            className="search-bar"
                            disabled={isStreaming}
                            rows={1}
                        />

                        {/* Character Count */}
                        {charCount > 0 && (
                            <div className="absolute top-2 right-16 text-[10px] text-aegis-text-muted">
                                {charCount}/{maxChars}
                            </div>
                        )}

                        {/* Send/Stop Button */}
                        {isStreaming ? (
                            <button
                                type="button"
                                onClick={handleStop}
                                className="absolute right-2 bottom-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all duration-200"
                                title="Stop generation"
                            >
                                <StopCircle className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className={cn(
                                    'send-button',
                                    !input.trim() && 'bg-aegis-surface border border-aegis-border text-aegis-text-muted shadow-none cursor-not-allowed hover:bg-aegis-surface hover:scale-100'
                                )}
                                title="Send message (Enter)"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Quick Action Tags */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 pb-1 mask-linear-fade">
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Find information about ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Search className="w-3 h-3" />
                        <span>Search Person</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Check if email ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Mail className="w-3 h-3" />
                        <span>Check Breach</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Extract GitHub emails for ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Github className="w-3 h-3" />
                        <span>GitHub Patch</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Lookup IP address ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Search className="w-3 h-3" />
                        <span>IP Lookup</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Search username ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Search className="w-3 h-3" />
                        <span>Username</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickAction('Lookup phone number ')}
                        className="quick-tag"
                        disabled={isStreaming}
                    >
                        <Search className="w-3 h-3" />
                        <span>Phone</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;
