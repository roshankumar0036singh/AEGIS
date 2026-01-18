import React, { useState } from 'react';
import { Shield, Settings, MoreVertical } from 'lucide-react';
import SettingsModal from './SettingsModal';

function Header({ onToggleSidebar }) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <header className="px-5 py-3.5 bg-transparent backdrop-blur-sm border-b border-white/5 z-20">
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <Shield className="w-5 h-5 text-aegis-primary" />
                            <div className="absolute inset-0 bg-aegis-primary/20 blur-lg rounded-full"></div>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold gradient-text">AEGIS</h1>
                            <p className="text-[8px] text-aegis-text-muted tracking-wide">Intelligence Framework</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg hover:bg-aegis-surface/30 transition-all duration-200"
                            title="Settings"
                        >
                            <Settings className="w-[18px] h-[18px] text-aegis-text-secondary hover:text-aegis-text-primary transition-colors" />
                        </button>

                        <button
                            onClick={onToggleSidebar}
                            className="p-2 rounded-lg hover:bg-aegis-surface/30 transition-all duration-200"
                            title="Open Workspace"
                        >
                            <MoreVertical className="w-5 h-5 text-aegis-text-secondary hover:text-aegis-text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            </header>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}

export default Header;
