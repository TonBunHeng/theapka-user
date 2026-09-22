/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: {
            50: "#FBF8F1",
            100: "#F6F0E0",
            200: "#EBDDBA",
            300: "#DEC58F",
            400: "#D4AF37", // signature soft gold
            500: "#B89325",
            600: "#947318",
            700: "#715412",
            800: "#4F380C",
            900: "#2E2006",
          },
          emerald: {
            50: "#F0F9F5",
            100: "#DDF0E7",
            200: "#BEDFCF",
            300: "#93C7AF",
            400: "#61A88B",
            500: "#39886C",
            600: "#246B53",
            700: "#1B5E4A",
            800: "#144638",
            900: "#0F342A", // signature deep emerald
            950: "#071F19",
          },
          cream: "#FAF7F0",
        },
        cream: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
        },
        gold: {
          50: "#FBF8F1",
          100: "#F6F0E0",
          200: "#EBDDBA",
          300: "#DEC58F",
          400: "#D4AF37",
          500: "#B89325",
          600: "#947318",
          700: "#715412",
          800: "#4F380C",
          900: "#2E2006",
        },
        burgundy: {
          50: "#FAF1F3",
          100: "#F4DEE4",
          200: "#E7BDCB",
          300: "#D694AA",
          400: "#C06684",
          500: "#8B1E3F",
          600: "#751733",
          700: "#5C1027",
          800: "#430A1B",
          900: "#2E0511",
        },
        emerald: {
          50: "#F0F9F5",
          100: "#DDF0E7",
          200: "#BEDFCF",
          300: "#93C7AF",
          400: "#61A88B",
          500: "#246B53",
          600: "#1B5E4A",
          700: "#144638",
          800: "#0F342A",
          900: "#071F19",
        },
        charcoal: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        }
      },
      fontFamily: {
        sans: ['"Kantumruy Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        ui: ['"Kantumruy Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Battambang"', 'sans-serif'],
        moul: ['"Moul"', 'cursive'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 12px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        modalBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalContent: {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        drawerSlide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        popupScale: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(-6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        toastSlide: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'modal-backdrop': 'modalBackdrop 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal-content': 'modalContent 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'drawer-slide': 'drawerSlide 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'popup-scale': 'popupScale 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-slide': 'toastSlide 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
  plugins: [],
}
