import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Zap, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils/helpers';

function SettingsModal({ isOpen, onClose }) {
    const [apiKeys, setApiKeys] = useState({
        gemini: '',
        tavily: '',
        rapidapi: '',
        github: '',
        hibp: '',
        whois: '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadApiKeys();
        }
    }, [isOpen]);

    const loadApiKeys = async () => {
        try {
            const result = await chrome.storage.local.get(['settings']);
            if (result.settings?.apiKeys) {
                setApiKeys({ ...apiKeys, ...result.settings.apiKeys });
            }
        } catch (error) {
            console.error('Failed to load API keys:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            settings.apiKeys = apiKeys;
            await chrome.storage.local.set({ settings });

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-aegis-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-aegis-primary/20">
                            <Shield className="w-5 h-5 text-aegis-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Settings</h2>
                            <p className="text-xs text-aegis-text-muted">Configure API keys and preferences</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* API Keys Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-5 h-5 text-aegis-primary" />
                            <h3 className="text-lg font-semibold">API Keys</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Gemini API Key */}
                            <ApiKeyInput
                                label="Google Gemini API Key"
                                value={apiKeys.gemini}
                                onChange={(value) => setApiKeys({ ...apiKeys, gemini: value })}
                                placeholder="AIza..."
                                required
                                helpText="Required for The Inquisitor agent"
                                helpLink="https://makersuite.google.com/app/apikey"
                            />

                            {/* Tavily API Key */}
                            <ApiKeyInput
                                label="Tavily AI API Key"
                                value={apiKeys.tavily}
                                onChange={(value) => setApiKeys({ ...apiKeys, tavily: value })}
                                placeholder="tvly-..."
                                helpText="For web search capabilities"
                                helpLink="https://tavily.com"
                            />

                            {/* RapidAPI Key */}
                            <ApiKeyInput
                                label="RapidAPI Key"
                                value={apiKeys.rapidapi}
                                onChange={(value) => setApiKeys({ ...apiKeys, rapidapi: value })}
                                placeholder="..."
                                helpText="For LinkedIn, Twitter, Instagram searches"
                                helpLink="https://rapidapi.com/hub"
                            />

                            {/* GitHub Token */}
                            <ApiKeyInput
                                label="GitHub Personal Access Token"
                                value={apiKeys.github}
                                onChange={(value) => setApiKeys({ ...apiKeys, github: value })}
                                placeholder="ghp_..."
                                helpText="Optional. Increases rate limits for GitHub searches"
                                helpLink="https://github.com/settings/tokens"
                            />

                            {/* HIBP API Key */}
                            <ApiKeyInput
                                label="HaveIBeenPwned API Key"
                                value={apiKeys.hibp}
                                onChange={(value) => setApiKeys({ ...apiKeys, hibp: value })}
                                placeholder="..."
                                helpText="For breach data checking"
                                helpLink="https://haveibeenpwned.com/API/Key"
                            />

                            {/* WhoisXML API Key */}
                            <ApiKeyInput
                                label="WhoisXML API Key"
                                value={apiKeys.whois}
                                onChange={(value) => setApiKeys({ ...apiKeys, whois: value })}
                                placeholder="..."
                                helpText="For domain intelligence"
                                helpLink="https://whoisxmlapi.com"
                            />
                        </div>
                    </section>

                    {/* Info Box */}
                    <div className="glass-card p-4 rounded-lg border-l-4 border-aegis-accent">
                        <div className="flex gap-3">
                            <Shield className="w-5 h-5 text-aegis-accent flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-aegis-accent mb-1">Privacy First</p>
                                <p className="text-aegis-text-secondary text-xs leading-relaxed">
                                    All API keys are stored locally in your browser using chrome.storage.local.
                                    No data is sent to AegisOSINT servers. You maintain full control of your keys.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-aegis-border/50">
                    <div className="text-xs text-aegis-text-muted">
                        {saved && (
                            <div className="flex items-center gap-2 text-aegis-accent animate-fade-in">
                                <Check className="w-4 h-4" />
                                <span>Settings saved successfully!</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                'btn-primary',
                                saving && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ApiKeyInput({ label, value, onChange, placeholder, required, helpText, helpLink }) {
    const [showKey, setShowKey] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    {label}
                    {required && <span className="text-aegis-danger text-xs">*</span>}
                </label>
                {helpLink && (
                    <a
                        href={helpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-aegis-primary hover:underline flex items-center gap-1"
                    >
                        Get API key
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
            <input
                type={showKey ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            />
            {helpText && (
                <p className="text-xs text-aegis-text-muted mt-1">{helpText}</p>
            )}
        </div>
    );
}

export default SettingsModal;
