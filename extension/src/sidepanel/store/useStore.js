import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {'user'|'agent'|'system'} role - Message sender role
 * @property {string} content - Message content
 * @property {number} timestamp - Unix timestamp
 */

/**
 * @typedef {Object} Investigation
 * @property {string} id - Investigation ID
 * @property {string} target - Investigation target name
 * @property {Message[]} messages - Chat messages
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 * @property {'active'|'paused'|'completed'} status - Investigation status
 */

const useStore = create(
    persist(
        (set, get) => ({
            // Chat state
            messages: [],
            isStreaming: false,
            agentStatus: 'idle', // idle, thinking, searching, verifying

            // Investigation state
            currentInvestigation: null,
            investigations: [],

            // Settings
            settings: {
                apiKeys: {
                    gemini: '',
                    tavily: '',
                    hibp: '',
                    whois: '',
                },
                theme: 'dark',
                stealth: {
                    userAgentRotation: true,
                    requestThrottling: true,
                    passiveMode: false,
                },
            },

            // Actions
            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
                })),

            setStreaming: (isStreaming) => set({ isStreaming }),

            setAgentStatus: (status) => set({ agentStatus: status }),

            createInvestigation: (target) => {
                const investigation = {
                    id: crypto.randomUUID(),
                    target,
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    status: 'active',
                };
                set((state) => ({
                    investigations: [...state.investigations, investigation],
                    currentInvestigation: investigation,
                }));
            },

            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),

            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: 'aegis-storage',
            partialize: (state) => ({
                investigations: state.investigations,
                settings: state.settings,
            }),
        }
    )
);

export default useStore;
