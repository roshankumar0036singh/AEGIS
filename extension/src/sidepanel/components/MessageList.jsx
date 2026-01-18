import React, { useEffect, useRef } from 'react';
import { User, Bot, Info, Copy, Check } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils/helpers';

function MessageList({ messages }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-aegis-text-muted animate-fade-in">
                    <div className="relative inline-block mb-6">
                        <Bot className="w-16 h-16 mx-auto text-aegis-text-muted/20" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 gradient-text">Welcome to AegisOSINT</h2>
                    <p className="text-sm text-aegis-text-secondary max-w-md mx-auto">
                        Your autonomous intelligence partner. Start an investigation by asking a question or providing a target name.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                        <div className="glass-card px-3 py-2 rounded-lg">
                            <span className="text-aegis-text-muted">Try: </span>
                            <span className="text-aegis-primary">"Find John Doe"</span>
                        </div>
                        <div className="glass-card px-3 py-2 rounded-lg">
                            <span className="text-aegis-text-muted">Or: </span>
                            <span className="text-aegis-primary">"Search @username"</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
                <Message key={message.id || index} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}

function Message({ message }) {
    const [copied, setCopied] = React.useState(false);
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isStreaming = message.isStreaming;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isSystem) {
        return (
            <div className="flex items-center justify-center gap-2 animate-fade-in">
                <div className="message-system">
                    <div className="flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        <span>{message.content}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex gap-4 group animate-slide-in-right',
                isUser ? 'flex-row-reverse' : ''
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm mt-1',
                    isUser
                        ? 'bg-blue-600/10 text-blue-500 border-blue-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                )}
            >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Content */}
            <div className={cn('flex-1 max-w-[85%]', isUser ? 'items-end flex flex-col' : 'items-start flex flex-col')}>
                <div className="flex items-start gap-2 max-w-full">
                    <div
                        className={cn(
                            'px-4 py-3 rounded-lg border text-sm leading-relaxed shadow-sm max-w-full',
                            isUser
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-slate-900/50 text-slate-200 border-slate-800'
                        )}
                    >
                        <p className="whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                        {isStreaming && (
                            <div className="typing-indicator flex gap-1 mt-2 p-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-75"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-150"></span>
                            </div>
                        )}
                    </div>

                    {/* Copy Button */}
                    {!isUser && !isStreaming && (
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 self-start mt-1"
                            title="Copy message"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                </div>

                {/* Timestamp */}
                <p className="text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
                    {formatRelativeTime(message.timestamp)}
                </p>
            </div>
        </div>
    );
}

export default MessageList;
