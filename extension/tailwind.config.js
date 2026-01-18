/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "sidepanel.html",
    "src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: '#0f172a',      // Slate 900
          surface: '#1e293b', // Slate 800
          border: '#334155',  // Slate 700
          primary: '#3b82f6', // Blue 500
          secondary: '#64748b', // Slate 500 (Subtle secondary)
          accent: '#10b981',  // Emerald 500
          warning: '#f59e0b', // Amber 500
          danger: '#ef4444',  // Red 500
          text: {
            primary: '#f8fafc', // Slate 50
            secondary: '#94a3b8', // Slate 400
            muted: '#64748b',   // Slate 500
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(59, 130, 246, 0.15)',
      }
    },
  },
  plugins: [],
};
