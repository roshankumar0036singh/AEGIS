import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import useStore from './store/useStore';
import { cn } from '../lib/utils/helpers';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { agentStatus } = useStore();

    return (
        <div className="flex h-screen bg-gradient-to-br from-aegis-bg via-[#0d1220] to-aegis-bg overflow-hidden">


            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-hidden relative">


                    {/* Chat Interface */}
                    <div className="relative h-full">
                        <ChatInterface />
                    </div>
                </main>

                {/* Footer */}
                <footer className="glass-card border-t border-aegis-border/50 px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    agentStatus === 'idle' && 'bg-aegis-accent',
                                    agentStatus === 'thinking' && 'bg-aegis-warning animate-pulse',
                                    agentStatus === 'searching' && 'bg-aegis-primary animate-pulse',
                                    agentStatus === 'verifying' && 'bg-aegis-secondary animate-pulse'
                                )}></div>
                                <span className="text-aegis-text-muted">
                                    Status: <span className="text-aegis-text-primary font-medium capitalize">{agentStatus}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-aegis-text-muted">
                            <span>AEGIS v0.1.0</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">Autonomous Intelligence Framework</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
