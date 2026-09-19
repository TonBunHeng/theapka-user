<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Gift,
  MapPin,
  Share2,
  Sparkles,
} from 'lucide-vue-next'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import Button from '@/components/common/Button.vue'
import Countdown from '@/components/invitation/Countdown.vue'
import RSVPForm from '@/components/invitation/RSVPForm.vue'
import GuestbookWall from '@/components/invitation/GuestbookWall.vue'
import LocationCard from '@/components/event/LocationCard.vue'
import Modal from '@/components/common/Modal.vue'
import GiftEnvelopeModal from '@/components/invitation/GiftEnvelopeModal.vue'
import MusicPlayer from '@/components/invitation/MusicPlayer.vue'
import Toast from '@/components/common/Toast.vue'
import { useEvents } from '@/composables/useEvents.js'
import { getTheme } from '@/composables/useTheme.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  id: { type: String, default: 'sok-dara-wedding' },
})

const route = useRoute()
const eventId = computed(() => props.id || route.params.id || 'sok-dara-wedding')
const { getEvent, addRSVP, getRSVPs } = useEvents()
const { showToast } = useToast()

const event = computed(() => getEvent(eventId.value))
const theme = computed(() => getTheme(event.value.template))
const eventRSVPs = computed(() => getRSVPs(eventId.value))

const isShareOpen = ref(false)
const isEnvelopeOpen = ref(false)

const targetDateTime = computed(() => {
  if (!event.value.date) return new Date().toISOString()
  const time = event.value.time || '17:00'
  return `${event.value.date}T${time}:00`
})

const formattedFullDate = computed(() => {
  if (!event.value.date) return ''
  try {
    const d = new Date(event.value.date)
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return event.value.date
  }
})

const handleRSVPSubmit = (payload) => {
  addRSVP(eventId.value, payload)
}

const downloadCalendarInvite = () => {
  if (!event.value.date) return
  const dateStr = event.value.date.replace(/-/g, '')
  const timeStr = (event.value.time || '17:00').replace(/:/g, '') + '00'
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Theapka Digital//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.value.title} - ${event.value.hosts}`,
    `DESCRIPTION:${event.value.description.replace(/\n/g, ' ')}`,
    `LOCATION:${event.value.location}`,
    `DTSTART:${dateStr}T${timeStr}`,
    `DTEND:${dateStr}T${Number(timeStr.slice(0, 2)) + 4}${timeStr.slice(2)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${event.value.id || 'invitation'}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showToast('Calendar event downloaded!')
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f4ef] text-stone-900 selection:bg-amber-200">
    <Navbar />

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Action Bar -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <router-link
          to="/dashboard"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </router-link>

        <div class="flex items-center gap-2">
          <button
            @click="downloadCalendarInvite"
            class="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-sm transition"
          >
            <CalendarDays class="h-3.5 w-3.5" />
            <span>Add to Calendar</span>
          </button>
          <button
            @click="isShareOpen = true"
            class="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 shadow-sm transition flex items-center gap-1.5"
          >
            <span>Share Invitation</span>
            <Share2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Main Themed Card -->
      <div
        class="overflow-hidden rounded-[2.5rem] border shadow-[0_25px_80px_rgba(28,25,23,0.08)] transition-all"
        :class="theme.containerClass"
      >
        <!-- Hero Header -->
        <div class="relative h-80 sm:h-96 overflow-hidden">
          <img
            :src="event.image"
            :alt="event.title"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t" :class="theme.bannerGradient" />
          
          <div class="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
            <div class="flex items-center gap-2 mb-2">
              <span class="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                {{ event.type }}
              </span>
              <component :is="theme.ornament" class="h-4 w-4" />
            </div>
            <h1 class="text-3xl font-semibold sm:text-5xl lg:text-6xl drop-shadow-sm" :class="theme.titleClass">
              {{ event.title }}
            </h1>
            <p class="mt-2 text-base sm:text-lg text-stone-200 font-light max-w-xl">
              Honoring {{ event.hosts }}
            </p>
          </div>
        </div>

        <!-- Invitation Body -->
        <div class="p-6 sm:p-10 space-y-10">
          <!-- Hosts Greeting Centerpiece -->
          <div class="text-center max-w-2xl mx-auto py-4">
            <div class="text-xs uppercase tracking-[0.32em] font-medium" :class="theme.headerAccent">
              Cordially Invited
            </div>
            <h2 class="mt-3 text-4xl sm:text-5xl font-semibold text-stone-900" :class="theme.titleClass">
              {{ event.hosts }}
            </h2>
            <div class="mt-4 flex items-center justify-center gap-3 text-amber-600/70">
              <div class="h-px w-12 bg-current" />
              <component :is="theme.ornament" class="h-4 w-4" />
              <div class="h-px w-12 bg-current" />
            </div>
            <p class="mt-5 text-base sm:text-lg leading-relaxed text-stone-700 italic">
              “{{ event.description }}”
            </p>
          </div>

          <!-- Date & Time Showcase -->
          <div class="rounded-[2rem] border p-6 sm:p-8 text-center" :class="theme.cardClass">
            <div class="text-xs uppercase tracking-[0.24em] text-stone-500 font-medium mb-3">
              When & Where
            </div>
            <div class="text-xl sm:text-2xl font-semibold text-stone-900">
              {{ formattedFullDate }}
            </div>
            <div class="mt-1 text-lg font-medium text-amber-800">
              at {{ event.time }}
            </div>
            <div class="mt-3 inline-flex items-center justify-center gap-2 text-sm text-stone-600 max-w-md mx-auto">
              <MapPin class="h-4 w-4" />
              <span>{{ event.location }}</span>
            </div>

            <!-- Live Countdown -->
            <div class="mt-8 pt-6 border-t" :class="theme.dividerClass">
              <div class="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-4">
                Countdown to the Big Day
              </div>
              <Countdown :target-date="targetDateTime" :theme="event.template" />
            </div>
          </div>

          <!-- Content Grid: Left Details / Right RSVP -->
          <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <!-- Left Column: Location, Schedule, Host Blessing, Digital Envelope -->
            <div class="space-y-6">
              <!-- Location Card -->
              <LocationCard :title="'Event Venue'" :address="event.location" />

              <!-- Event Schedule / Timeline -->
              <div class="rounded-[2.5rem] border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <span class="text-xs uppercase tracking-[0.24em] text-stone-400 font-medium">Program Agenda</span>
                    <h3 class="mt-1 text-2xl font-semibold text-stone-900">Celebration Schedule</h3>
                  </div>
                  <Clock3 class="h-5 w-5 text-amber-700" />
                </div>

                <div class="relative border-l-2 border-stone-200 pl-6 ml-3 space-y-6">
                  <div
                    v-for="(item, idx) in event.schedule"
                    :key="idx"
                    class="relative group"
                  >
                    <div class="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-4 ring-amber-100" />
                    <div class="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      {{ item.time }}
                    </div>
                    <div class="text-sm font-medium text-stone-900 mt-0.5">
                      {{ item.label }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message from Hosts -->
              <div class="rounded-[2.5rem] border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <div class="text-xs uppercase tracking-[0.24em] text-stone-400 font-medium">A Note From Us</div>
                <h3 class="mt-1 text-xl font-semibold text-stone-900">Message to Our Guests</h3>
                <p class="mt-4 text-sm leading-relaxed text-stone-600">
                  {{ event.hostMessage }}
                </p>
              </div>

              <!-- Digital Blessing Envelope Feature -->
              <div class="rounded-[2.5rem] border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-rose-50/50 p-6 sm:p-8 shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <Gift class="h-7 w-7 text-amber-700" />
                  <div>
                    <h3 class="text-lg font-semibold text-stone-900">Digital Blessing Envelope</h3>
                    <p class="text-xs text-stone-600">Send your wedding gift & blessings directly</p>
                  </div>
                </div>
                <p class="text-xs text-stone-600 leading-relaxed mb-4">
                  For your convenience, traditional envelopes can be sent digitally via QR transfer to the couple.
                </p>
                <Button
                  @click="isEnvelopeOpen = true"
                  variant="primary"
                  size="sm"
                  class="bg-amber-900 text-white hover:bg-amber-800"
                >
                  Send Blessing via QR / Bank
                </Button>
              </div>
            </div>

            <!-- Right Column: RSVP Form & Guestbook Wall -->
            <div class="space-y-6">
              <!-- RSVP Form -->
              <RSVPForm
                :event-id="eventId"
                :event-title="event.title"
                @submitted="handleRSVPSubmit"
              />

              <!-- Guestbook & Wishes Wall -->
              <GuestbookWall :rsvps="eventRSVPs" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals & Audio Player -->
    <Modal
      v-model="isShareOpen"
      :title="`Share ${event.title}`"
      :event-title="event.title"
    />

    <GiftEnvelopeModal
      v-model="isEnvelopeOpen"
      :qr-details="event.qrDetails"
      :hosts="event.hosts"
    />

    <MusicPlayer />
    <Toast />
    <Footer />
  </div>
</template>
