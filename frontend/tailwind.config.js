/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mermaidcore Light Mode Colors
        mermaid: {
          aqua: {
            50: '#E0F7FA',
            100: '#B2EBF2',
            200: '#80DEEA',
            300: '#4DD0E1',
            400: '#26C6DA',
            500: '#00BCD4',
            600: '#00ACC1',
            700: '#0097A7',
            800: '#00838F',
            900: '#006064',
          },
          teal: {
            50: '#E0F2F1',
            100: '#B2DFDB',
            200: '#80CBC4',
            300: '#4DB6AC',
            400: '#26A69A',
            500: '#009688',
            600: '#00897B',
            700: '#00796B',
            800: '#00695C',
            900: '#004D40',
          },
          purple: {
            50: '#F3E5F5',
            100: '#E1BEE7',
            200: '#CE93D8',
            300: '#BA68C8',
            400: '#AB47BC',
            500: '#9C27B0',
            600: '#8E24AA',
            700: '#7B1FA2',
            800: '#6A1B9A',
            900: '#4A148C',
          },
        },
        silver: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      backgroundImage: {
        'mermaid-light': 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 25%, #80DEEA 50%, #B19CD9 75%, #C8A2C8 100%)',
        'mermaid-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 188, 212, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 188, 212, 0.8), 0 0 30px rgba(0, 188, 212, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

