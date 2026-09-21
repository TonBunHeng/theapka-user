/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EAE1D2',
          400: '#DFD2BC',
          500: '#CFC0A3',
        },
        gold: {
          50: '#FBF9F2',
          100: '#F5EED9',
          200: '#EBDBB0',
          300: '#DFC784',
          400: '#D4B359',
          500: '#C59B27', // primary soft wedding gold
          600: '#A37D19',
          700: '#7E5F11',
          800: '#5A430B',
          900: '#3D2D06',
        },
        burgundy: {
          50: '#FAF1F3',
          100: '#F4DEE4',
          200: '#E7BDCB',
          300: '#D694AA',
          400: '#C06684',
          500: '#8B1E3F', // royal wedding burgundy
          600: '#751733',
          700: '#5C1027',
          800: '#430A1B',
          900: '#2E0511',
        },
        emerald: {
          50: '#F1F7F4',
          100: '#DEF0E6',
          200: '#BEDFCB',
          300: '#95C9AA',
          400: '#64AC83',
          500: '#1A4D3E', // deep botanical emerald
          600: '#153F33',
          700: '#103127',
          800: '#0C231C',
          900: '#071612',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#525252',
          700: '#3A3A3A',
          800: '#242424',
          900: '#171717',
        }
      },
      fontFamily: {
        ui: ['"Kantumruy Pro"', 'sans-serif'],
        body: ['"Battambang"', 'sans-serif'],
        moul: ['"Moul"', 'cursive'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(90, 67, 11, 0.06)',
        'elevated': '0 12px 32px -4px rgba(90, 67, 11, 0.12)',
        'gold-glow': '0 0 20px rgba(197, 155, 39, 0.25)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
  plugins: [],
}
