import { computed } from 'vue'
import { Crown, Flower2, Sparkles, Star } from 'lucide-vue-next'

export const themes = {
  classic: {
    id: 'classic',
    name: 'Classic Gold',
    containerClass: 'bg-[#faf7f2] border-amber-300/40 text-stone-900',
    headerAccent: 'text-amber-800 font-serif',
    titleClass: 'font-serif tracking-normal text-stone-900',
    cardClass: 'bg-[#f4eee4]/80 border-amber-200/70',
    badgeClass: 'bg-amber-100/90 text-amber-900 border border-amber-300/60',
    primaryButton: 'bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-amber-900/10',
    dividerClass: 'border-amber-300/50',
    bannerGradient: 'from-stone-950/80 via-stone-950/40 to-transparent',
    ornament: Crown,
  },
  floral: {
    id: 'floral',
    name: 'Blush Floral',
    containerClass: 'bg-[#fffafb] border-rose-200/80 text-stone-900',
    headerAccent: 'text-rose-700 font-sans tracking-wide',
    titleClass: 'font-sans tracking-tight text-rose-950',
    cardClass: 'bg-rose-50/70 border-rose-200/60',
    badgeClass: 'bg-rose-100 text-rose-900 border border-rose-200',
    primaryButton: 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-700/10',
    dividerClass: 'border-rose-200/70',
    bannerGradient: 'from-stone-950/80 via-rose-950/30 to-transparent',
    ornament: Flower2,
  },
  minimal: {
    id: 'minimal',
    name: 'Modern Minimal',
    containerClass: 'bg-white border-stone-200 text-stone-900',
    headerAccent: 'text-stone-500 font-mono text-xs uppercase tracking-widest',
    titleClass: 'font-sans font-light tracking-tight text-stone-950',
    cardClass: 'bg-stone-50/80 border-stone-200/70',
    badgeClass: 'bg-stone-100 text-stone-800 border border-stone-200',
    primaryButton: 'bg-stone-950 hover:bg-stone-800 text-white',
    dividerClass: 'border-stone-200',
    bannerGradient: 'from-stone-950/85 via-stone-900/30 to-transparent',
    ornament: Star,
  },
  celebration: {
    id: 'celebration',
    name: 'Vibrant Fiesta',
    containerClass: 'bg-[#fefaf3] border-amber-200/80 text-stone-900',
    headerAccent: 'text-amber-700 uppercase tracking-widest font-bold',
    titleClass: 'font-sans font-extrabold tracking-tight text-stone-900',
    cardClass: 'bg-amber-50/70 border-amber-200/80',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
    primaryButton: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    dividerClass: 'border-amber-200',
    bannerGradient: 'from-stone-950/80 via-amber-950/30 to-transparent',
    ornament: Sparkles,
  },
}

export function getTheme(templateId) {
  return themes[templateId] || themes.classic
}

