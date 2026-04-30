import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/react-grid-layout/build/css/styles.css',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        muted: '#0a0a0a',
        'muted-foreground': '#737373',
        border: '#1a1a1a',
        accent: '#1a1a1a',
        'accent-foreground': '#ffffff',
        card: '#0a0a0a',
        'card-foreground': '#ffffff',
        primary: '#ffffff',
        'primary-foreground': '#000000',
        secondary: '#1a1a1a',
        'secondary-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
}

export default config
