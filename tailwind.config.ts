import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#111111',
        accent: '#FF0066',
        border: '#EEEEEE',
        muted: '#999999',
        'very-muted': '#CCCCCC',
      },
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
      },
      borderRadius: {
        pill: '100px',
      },
      letterSpacing: {
        label: '0.08em',
      },
    },
  },
  plugins: [],
}

export default config
