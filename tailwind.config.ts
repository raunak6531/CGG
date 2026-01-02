import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cook: {
          dark: '#050505',
          card: '#121212',
          border: '#2a2a2a',
          accent: '#ff3e3e',
          accentHover: '#b91c1c',
          warning: '#f59e0b',
          safe: '#10b981',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float-up': 'floatUp 1s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #ff3e3e' },
          '100%': { boxShadow: '0 0 20px #ff3e3e, 0 0 10px #ff3e3e' }
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1.5)' }
        }
      }
    },
  },
  plugins: [],
};
export default config;

