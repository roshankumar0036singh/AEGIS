import React, { useState } from 'react';
import { History, Database, FileText, TrendingUp, X } from 'lucide-react';
import useStore from '../store/useStore';
import { cn, formatRelativeTime } from '../../lib/utils/helpers';

function Sidebar({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('investigations');
    const { investigations, currentInvestigation } = useStore();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-aegis-surface/20 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-aegis-text-primary tracking-tight">Workspace</h2>
                            <p className="text-[10px] text-aegis-text-muted uppercase tracking-wider font-medium mt-0.5">Investigation Hub</p>
                        </div>
                        <button onClick={onClose} className="btn-icon lg:hidden">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Modern segmented Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl border border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('investigations')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300',
                                activeTab === 'investigations'
                                    ? 'bg-aegis-surface/40 text-aegis-primary shadow-sm ring-1 ring-white/5'
                                    : 'text-aegis-text-muted hover:text-aegis-text-secondary hover:bg-aegis-surface/10'
                            )}
                        >
                            <History className="w-3.5 h-3.5" />
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('data')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300',
                                activeTab === 'data'
                                    ? 'bg-aegis-surface/40 text-aegis-accent shadow-sm ring-1 ring-white/5'
                                    : 'text-aegis-text-muted hover:text-aegis-text-secondary hover:bg-aegis-surface/10'
                            )}
                        >
                            <Database className="w-3.5 h-3.5" />
                            Data
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'investigations' && (
                        <InvestigationsTab
                            investigations={investigations}
                            currentInvestigation={currentInvestigation}
                        />
                    )}
                    {activeTab === 'data' && <DataTab />}
                </div>
            </aside>
        </>
    );
}

function InvestigationsTab({ investigations, currentInvestigation }) {
    if (investigations.length === 0) {
        return (
            <div className="text-center text-aegis-text-muted py-12">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No investigations yet</p>
                <p className="text-xs mt-1">Start a new investigation to see it here</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {investigations.map((inv) => (
                <div
                    key={inv.id}
                    className={cn(
                        'glass-card-hover p-3 rounded-lg cursor-pointer',
                        currentInvestigation?.id === inv.id && 'border-aegis-primary/50'
                    )}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{inv.target}</h3>
                            <p className="text-xs text-aegis-text-muted mt-1">
                                {formatRelativeTime(inv.createdAt)}
                            </p>
                        </div>
                        <span className={cn(
                            'badge text-[10px]',
                            inv.status === 'active' && 'badge-success',
                            inv.status === 'paused' && 'badge-warning',
                            inv.status === 'completed' && 'badge-primary'
                        )}>
                            {inv.status}
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-aegis-text-secondary">
                        {inv.messages.length} messages
                    </div>
                </div>
            ))}
        </div>
    );
}

function DataTab() {
    return (
        <div className="space-y-3">
            {/* Evidence Collected Box */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-aegis-surface/30 to-aegis-surface/10 border border-white/5 p-4 transition-all duration-300 hover:border-aegis-primary/20 hover:shadow-lg hover:shadow-aegis-primary/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-aegis-primary/5 blur-2xl rounded-full -mr-10 -mt-10 transition-all duration-500 group-hover:bg-aegis-primary/10"></div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-[10px] text-aegis-text-muted font-medium uppercase tracking-wider mb-1">Evidence</p>
                        <h3 className="text-lg font-bold text-aegis-text-primary">0</h3>
                        <p className="text-xs text-aegis-text-secondary mt-1">Items Collected</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-aegis-primary/10 border border-aegis-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-aegis-primary" />
                    </div>
                </div>
            </div>

            {/* Entities Discovered Box */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-aegis-surface/30 to-aegis-surface/10 border border-white/5 p-4 transition-all duration-300 hover:border-aegis-accent/20 hover:shadow-lg hover:shadow-aegis-accent/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-aegis-accent/5 blur-2xl rounded-full -mr-10 -mt-10 transition-all duration-500 group-hover:bg-aegis-accent/10"></div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-[10px] text-aegis-text-muted font-medium uppercase tracking-wider mb-1">Entities</p>
                        <h3 className="text-lg font-bold text-aegis-text-primary">0</h3>
                        <p className="text-xs text-aegis-text-secondary mt-1">Identified Targets</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-aegis-accent/10 border border-aegis-accent/20 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-aegis-accent" />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div className="text-center text-aegis-text-muted py-8 mt-4">
                <p className="text-xs leading-relaxed">
                    Data will appear here as you<br />conduct investigations
                </p>
            </div>
        </div>
    );
}

export default Sidebar;
