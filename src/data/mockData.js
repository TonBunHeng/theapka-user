import {
  Building2,
  Cake,
  Flower2,
  GraduationCap,
  Heart,
  PartyPopper,
  School,
  Sparkles,
} from 'lucide-vue-next'

export const eventCategories = [
  { icon: Heart, title: 'Wedding', description: 'Celebrate your love story in style with traditional & modern grace.' },
  { icon: Cake, title: 'Birthday', description: 'Create a warm, joyful day to remember with friends & family.' },
  { icon: GraduationCap, title: 'Graduation', description: 'Honor milestones, hard work, and big achievements.' },
  { icon: Flower2, title: 'Engagement', description: 'Share the moment and blessing ceremony everyone has been waiting for.' },
  { icon: PartyPopper, title: 'Party', description: 'A vibrant digital invitation for your next gathering or celebration.' },
  { icon: Building2, title: 'Business', description: 'Welcome corporate guests and partners to your networking event.' },
  { icon: School, title: 'School', description: 'Celebrate reunion moments, ceremonies, and school memories.' },
  { icon: Sparkles, title: 'Ceremony', description: 'Mark meaningful traditions, housewarmings, and cultural blessings.' },
]

export const invitationTemplates = [
  {
    id: 'classic',
    name: 'Classic Gold',
    badge: 'Traditional & Royal',
    accent: 'bg-stone-900 text-amber-200 border-amber-600/30',
    description: 'Timeless luxury with warm champagne tones, refined serif typography, and gold filigree borders.',
    palette: {
      primary: '#1c1917',
      accent: '#d97706',
      cardBg: 'bg-[#faf7f2]',
      border: 'border-amber-200/80',
      badgeBg: 'bg-amber-100/80 text-amber-900',
      fontClass: 'font-serif',
    },
  },
  {
    id: 'floral',
    name: 'Blush Floral',
    badge: 'Romantic & Gentle',
    accent: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Soft petal pinks, delicate botanicals, and romantic warmth ideal for engagements and garden weddings.',
    palette: {
      primary: '#881337',
      accent: '#f43f5e',
      cardBg: 'bg-[#fff5f6]',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-800',
      fontClass: 'font-sans',
    },
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    badge: 'Clean & Contemporary',
    accent: 'bg-stone-100 text-stone-900 border-stone-300',
    description: 'Crisp monochrome, generous airy whitespace, sleek typography, and understated sophistication.',
    palette: {
      primary: '#09090b',
      accent: '#71717a',
      cardBg: 'bg-white',
      border: 'border-stone-200',
      badgeBg: 'bg-stone-100 text-stone-800',
      fontClass: 'font-sans',
    },
  },
  {
    id: 'celebration',
    name: 'Vibrant Fiesta',
    badge: 'Joyful & Festive',
    accent: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Warm terracotta, cheerful amber glows, and festive spirit tailored for lively birthday & evening bashes.',
    palette: {
      primary: '#78350f',
      accent: '#f59e0b',
      cardBg: 'bg-[#fef9ee]',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-900',
      fontClass: 'font-sans',
    },
  },
]

export const imagePresets = [
  {
    label: 'Traditional Wedding Couple',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    category: 'Wedding',
  },
  {
    label: 'Warm Outdoor Ceremony',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    category: 'Wedding',
  },
  {
    label: 'Rooftop Birthday Party',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Birthday',
  },
  {
    label: 'Champagne Toast & Celebration',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    category: 'Party',
  },
  {
    label: 'Floral Banquet Arch',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    category: 'Ceremony',
  },
  {
    label: 'Graduation Cap & Scroll',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    category: 'Graduation',
  },
]

export const features = [
  {
    title: 'Bespoke Invitations',
    description: 'Design elegant invitations that feel deeply personal, polished, and quick to share on Telegram or WhatsApp.',
  },
  {
    title: 'Real-time Live Preview',
    description: 'Instant desktop and mobile smartphone views so you see exactly what guests see before sending.',
  },
  {
    title: 'Smart Guest RSVP',
    description: 'Instant attendance tracking with guest count, warm guestbook wishes, and CSV export for easy planning.',
  },
  {
    title: 'Digital Blessing Envelope',
    description: 'Built-in support for KHQR / ABA transfers for traditional Cambodian wedding blessings and gifts.',
  },
]

export const howItWorks = [
  { step: '01', title: 'Choose Occasion & Theme', text: 'Select an event type and pick from Classic Gold, Blush Floral, Minimal, or Festive styles.' },
  { step: '02', title: 'Add Details & Schedule', text: 'Include host names, date, venue location, schedule timeline, and welcome blessings.' },
  { step: '03', title: 'Share & Track RSVPs', text: 'Distribute via Telegram or QR code. Watch real-time guest responses stream into your dashboard.' },
]

export const dashboardEvents = [
  {
    id: 'sok-dara-wedding',
    title: 'Wedding of Sok & Dara',
    date: '20 Dec 2026',
    guests: 120,
    status: 'Confirmed',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'birthday-party',
    title: 'Bopha’s 25th Birthday Bash',
    date: '05 Jan 2027',
    guests: 45,
    status: 'Planning',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
  },
]

export const publicEvent = {
  id: 'sok-dara-wedding',
  type: 'Wedding',
  title: 'Wedding Celebration',
  hosts: 'Sok & Dara',
  date: '2026-12-20',
  time: '17:00',
  location: 'Sokha Siem Reap Resort & Convention Center, Siem Reap, Cambodia',
  description:
    'With joyful hearts, we request the honor of your presence as we celebrate our holy union of marriage. Your blessing, love, and company mean everything to us as we begin this blessed journey together.',
  schedule: [
    { time: '4:30 PM', label: 'Guest Arrival & Welcome Refreshments' },
    { time: '5:00 PM', label: 'Solemn Ceremony & Knot-Tying (Phtum Pka)' },
    { time: '6:30 PM', label: 'Grand Banquet Dinner & Champagne Toast' },
    { time: '8:00 PM', label: 'Traditional Dancing, Cake Cutting & Celebration' },
  ],
  hostMessage:
    'We would be deeply honored to celebrate this sacred milestone with our beloved families, relatives, and friends. Please join us for an evening filled with laughter, love, and warm memories.',
  image:
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  template: 'classic',
}

export const defaultDraft = {
  type: 'Wedding',
  title: 'Wedding Celebration',
  hostName: 'Sok & Dara',
  date: '2026-12-20',
  time: '17:00',
  location: 'Sokha Siem Reap Resort, Siem Reap, Cambodia',
  description:
    'We are delighted to invite you to celebrate our special day with us. Your presence means the world to us.',
  hostMessage: 'We would be honored to celebrate this joyful moment with our family and friends.',
  coverImage:
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  template: 'classic',
  schedule: [
    { time: '4:30 PM', label: 'Guest Arrival' },
    { time: '5:00 PM', label: 'Ceremony Begins' },
    { time: '6:30 PM', label: 'Dinner & Toasts' },
    { time: '8:00 PM', label: 'Dancing & Celebration' },
  ],
}
