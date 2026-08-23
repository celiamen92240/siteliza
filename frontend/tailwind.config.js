/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1. Raspberry Rose (#F2619C)
        blush: {
          50: '#fdf2f7',
          100: '#fce6f0',
          200: '#fad0e3',
          300: '#f7a8cd',
          400: '#f478b0',
          500: '#F2619C', // Primary Raspberry Rose
          600: '#de3881',
          700: '#bd2367',
          800: '#9d2055',
          900: '#831f4a',
        },
        raspberry: {
          50: '#fdf2f7',
          100: '#fce6f0',
          200: '#fad0e3',
          300: '#f7a8cd',
          400: '#f478b0',
          500: '#F2619C',
          600: '#de3881',
          700: '#bd2367',
          800: '#9d2055',
          900: '#831f4a',
        },
        // 2. Soft Lilac (#E7BEF8)
        lilac: {
          50: '#fcf8fe',
          100: '#f9f0fd',
          200: '#E7BEF8', // Primary Soft Lilac
          300: '#d79bf2',
          400: '#c574ea',
          500: '#b14ede',
          600: '#9632c3',
          700: '#7c25a0',
          800: '#672282',
          900: '#56206b',
        },
        purple: {
          50: '#fcf8fe',
          100: '#f9f0fd',
          200: '#E7BEF8',
          300: '#d79bf2',
          400: '#c574ea',
          500: '#b14ede',
          600: '#9632c3',
          700: '#7c25a0',
          800: '#672282',
          900: '#56206b',
        },
        // 3. Blueberry Milk (#93ABD9)
        blueberry: {
          50: '#f4f6fb',
          100: '#e8edf7',
          200: '#d5def0',
          300: '#93ABD9', // Primary Blueberry Milk
          400: '#7592cb',
          500: '#5a78bd',
          600: '#4660a6',
          700: '#394d86',
          800: '#32416e',
          900: '#2c375b',
        },
        // 4. Sunny Buttercup Yellow (#FFE066)
        lemon: {
          50: '#fffdf0',
          100: '#fff9d6',
          200: '#FFE066', // Primary Sunny Pastel Yellow (no green)
          300: '#FED049',
          400: '#FDBB2D',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#78350f',
          900: '#451a03',
        },
        champagne: {
          50: '#fffdf0',
          100: '#fff9d6',
          200: '#FFE066',
          300: '#FED049',
          400: '#FDBB2D',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#78350f',
          900: '#451a03',
        },
        rosewood: {
          50: '#faf5f5',
          100: '#f4e9ea',
          200: '#ebd8d9',
          300: '#ddbec0',
          400: '#c8999d',
          500: '#b1757a',
          600: '#99595f',
          700: '#7f474c',
          800: '#6b3c40',
          900: '#5a3538',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'Playpen Sans', 'cursive'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
