import { ref, watch } from 'vue'
import { dashboardEvents, publicEvent } from '@/data/mockData.js'

const STORAGE_KEY_EVENTS = 'theapka_events'
const STORAGE_KEY_RSVPS = 'theapka_rsvps'
const STORAGE_KEY_DRAFT = 'theapka_draft'

// Initial seed data
const initialEvents = [
  {
    ...publicEvent,
    id: 'sok-dara-wedding',
    status: 'Confirmed',
    guestsCount: 120,
    createdDate: '2026-09-01',
    qrDetails: {
      bankName: 'ABA Bank',
      accountName: 'SOK & DARA',
      accountNumber: '001 234 567',
      qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SOK_DARA_ABA_001234567',
    },
  },
  {
    id: 'birthday-party',
    type: 'Birthday',
    title: 'Bopha’s 25th Birthday Bash',
    hosts: 'Bopha & Friends',
    date: '2027-01-05',
    time: '18:30',
    location: 'Sky Bar, Phnom Penh, Cambodia',
    description: 'Come celebrate a milestone quarter-century with great food, drinks, and unforgettable memories on the rooftop!',
    schedule: [
      { time: '6:30 PM', label: 'Welcome Drinks & Rooftop Sunset' },
      { time: '7:30 PM', label: 'Dinner Buffet' },
      { time: '8:45 PM', label: 'Cake Cutting & Wishes' },
      { time: '9:30 PM', label: 'Music & Dancing' },
    ],
    hostMessage: 'Please bring your warmest smiles and dancing shoes. Casual chic dress code!',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    template: 'celebration',
    status: 'Planning',
    guestsCount: 45,
    createdDate: '2026-09-10',
    qrDetails: {
      bankName: 'ACLEDA Bank',
      accountName: 'BOPHA KONG',
      accountNumber: '1122 3344 5566',
      qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BOPHA_25TH_112233445566',
    },
  },
  {
    id: 'chan-sophea-engagement',
    type: 'Engagement',
    title: 'Chan & Sophea Engagement Ceremony',
    hosts: 'The Groom & Bride Families',
    date: '2026-11-15',
    time: '08:00',
    location: 'Grand Ballroom, Siem Reap, Cambodia',
    description: 'We warmly invite you to witness and celebrate the traditional engagement blessing of Chan and Sophea.',
    schedule: [
      { time: '8:00 AM', label: 'Traditional Fruit Parade (Hai Chomnoun)' },
      { time: '9:00 AM', label: 'Blessing Ceremony & Ring Exchange' },
      { time: '11:30 AM', label: 'Celebration Luncheon' },
    ],
    hostMessage: 'Your blessing and presence will bring great joy to our families.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    template: 'floral',
    status: 'Confirmed',
    guestsCount: 80,
    createdDate: '2026-09-12',
    qrDetails: {
      bankName: 'Canadia Bank',
      accountName: 'CHAN & SOPHEA',
      accountNumber: '9988 7766 5544',
      qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CHAN_SOPHEA_998877665544',
    },
  },
]

const initialRSVPs = [
  {
    id: 'rsvp-1',
    eventId: 'sok-dara-wedding',
    name: 'Rithy & Linda',
    guests: 2,
    status: 'attending',
    message: 'Congratulations Sok & Dara! Wishing you a lifetime of love and happiness together. Can’t wait to celebrate with you!',
    createdAt: '2026-09-15T14:20:00Z',
  },
  {
    id: 'rsvp-2',
    eventId: 'sok-dara-wedding',
    name: 'Vannak Heng',
    guests: 1,
    status: 'attending',
    message: 'So thrilled for you both! See you in Siem Reap!',
    createdAt: '2026-09-16T09:12:00Z',
  },
  {
    id: 'rsvp-3',
    eventId: 'sok-dara-wedding',
    name: 'Chanthou Meas',
    guests: 2,
    status: 'maybe',
    message: 'Checking flight schedules from Singapore! Hope to make it in time.',
    createdAt: '2026-09-17T11:45:00Z',
  },
  {
    id: 'rsvp-4',
    eventId: 'birthday-party',
    name: 'Socheat & Dany',
    guests: 2,
    status: 'attending',
    message: 'Happy early 25th Bopha! Ready for the rooftop night!',
    createdAt: '2026-09-18T16:00:00Z',
  },
]

// Reactive state
function loadStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
    return fallback
  }
}

const events = ref(loadStorage(STORAGE_KEY_EVENTS, initialEvents))
const rsvps = ref(loadStorage(STORAGE_KEY_RSVPS, initialRSVPs))
const draft = ref(
  loadStorage(STORAGE_KEY_DRAFT, {
    type: 'Wedding',
    title: 'Wedding Celebration',
    hostName: 'Sok & Dara',
    date: '2026-12-20',
    time: '17:00',
    location: 'Siem Reap, Cambodia',
    description: 'We are delighted to invite you to celebrate our special day with us. Your presence means the world to us as we begin this new chapter together.',
    hostMessage: 'We would be honored to celebrate this joyful moment with our family and friends.',
    coverImage: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    template: 'classic',
    schedule: [
      { time: '4:30 PM', label: 'Guest Arrival' },
      { time: '5:00 PM', label: 'Ceremony Begins' },
      { time: '6:30 PM', label: 'Dinner & Toasts' },
      { time: '8:00 PM', label: 'Dancing & Celebration' },
    ],
    qrBank: 'ABA Bank',
    qrName: 'Sok & Dara',
    qrNumber: '001 234 567',
  })
)

// Watchers for persistence
if (typeof window !== 'undefined') {
  watch(
    events,
    (val) => {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(val))
    },
    { deep: true }
  )

  watch(
    rsvps,
    (val) => {
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(val))
    },
    { deep: true }
  )

  watch(
    draft,
    (val) => {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(val))
    },
    { deep: true }
  )
}

export function useEvents() {
  const getEvent = (id) => {
    return events.value.find((e) => e.id === id) || events.value[0]
  }

  const createEvent = (data) => {
    const slug = (data.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'event'
    const newId = `${slug}-${Date.now().toString().slice(-4)}`

    const newEvent = {
      id: newId,
      type: data.type || 'Wedding',
      title: data.title || 'Celebration',
      hosts: data.hostName || 'Host',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '17:00',
      location: data.location || 'Phnom Penh, Cambodia',
      description: data.description || '',
      hostMessage: data.hostMessage || 'Thank you for joining our special day!',
      schedule: data.schedule && data.schedule.length > 0 ? data.schedule : [
        { time: '5:00 PM', label: 'Guest Arrival' },
        { time: '6:30 PM', label: 'Dinner & Celebration' }
      ],
      image: data.coverImage || 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      template: data.template || 'classic',
      status: 'Active',
      guestsCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      qrDetails: data.qrNumber ? {
        bankName: data.qrBank || 'ABA Bank',
        accountName: data.qrName || data.hostName,
        accountNumber: data.qrNumber,
        qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qrNumber)}`,
      } : null,
    }

    events.value.unshift(newEvent)
    return newEvent
  }

  const updateEvent = (id, data) => {
    const index = events.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...data }
      return events.value[index]
    }
    return null
  }

  const deleteEvent = (id) => {
    events.value = events.value.filter((e) => e.id !== id)
    rsvps.value = rsvps.value.filter((r) => r.eventId !== id)
  }

  const addRSVP = (eventId, rsvpData) => {
    const newRSVP = {
      id: `rsvp-${Date.now()}`,
      eventId,
      name: rsvpData.name || 'Guest',
      guests: Number(rsvpData.guests) || 1,
      status: rsvpData.status || 'attending',
      message: rsvpData.message || '',
      createdAt: new Date().toISOString(),
    }
    rsvps.value.unshift(newRSVP)

    // Update guest count on event if attending
    const ev = events.value.find((e) => e.id === eventId)
    if (ev && newRSVP.status === 'attending') {
      ev.guestsCount = (ev.guestsCount || 0) + newRSVP.guests
    }

    return newRSVP
  }

  const getRSVPs = (eventId) => {
    return rsvps.value.filter((r) => r.eventId === eventId)
  }

  const resetDraft = () => {
    draft.value = {
      type: 'Wedding',
      title: 'Wedding Celebration',
      hostName: '',
      date: '',
      time: '17:00',
      location: '',
      description: '',
      hostMessage: '',
      coverImage: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      template: 'classic',
      schedule: [
        { time: '4:30 PM', label: 'Guest Arrival' },
        { time: '5:00 PM', label: 'Ceremony Begins' },
        { time: '6:30 PM', label: 'Dinner & Toasts' },
        { time: '8:00 PM', label: 'Dancing & Celebration' },
      ],
      qrBank: 'ABA Bank',
      qrName: '',
      qrNumber: '',
    }
  }

  return {
    events,
    rsvps,
    draft,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addRSVP,
    getRSVPs,
    resetDraft,
  }
}

