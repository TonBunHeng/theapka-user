<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, MapPin, MonitorSmartphone, PencilLine, Smartphone } from 'lucide-vue-next'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import Button from '@/components/common/Button.vue'
import Countdown from '@/components/invitation/Countdown.vue'
import LocationCard from '@/components/event/LocationCard.vue'
import Modal from '@/components/common/Modal.vue'
import Toast from '@/components/common/Toast.vue'
import { useEvents } from '@/composables/useEvents.js'
import { getTheme } from '@/composables/useTheme.js'
import { invitationTemplates } from '@/data/mockData.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const { draft, createEvent, events } = useEvents()
const { showToast } = useToast()

const selectedTemplateId = ref(draft.value?.template || 'classic')
const deviceMode = ref('phone') // 'phone' | 'desktop'
const isShareOpen = ref(false)

const currentTheme = computed(() => getTheme(selectedTemplateId.value))

const previewData = computed(() => {
  return {
    type: draft.value?.type || 'Wedding',
    title: draft.value?.title || 'Wedding Celebration',
    hosts: draft.value?.hostName || 'Sok & Dara',
    date: draft.value?.date || '2026-12-20',
    time: draft.value?.time || '17:00',
    location: draft.value?.location || 'Sokha Siem Reap Resort, Siem Reap, Cambodia',
    description: draft.value?.description || 'We are delighted to invite you to celebrate our special day with us.',
    hostMessage: draft.value?.hostMessage || 'We would be honored to celebrate this joyful moment with our family and friends.',
    image: draft.value?.coverImage || 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    schedule: draft.value?.schedule || [
      { time: '4:30 PM', label: 'Guest Arrival' },
      { time: '5:00 PM', label: 'Ceremony Begins' },
      { time: '6:30 PM', label: 'Dinner & Toasts' },
    ],
  }
})

const targetDateTime = computed(() => {
  return `${previewData.value.date}T${previewData.value.time}:00`
})

const publishDraft = () => {
  const newEv = createEvent({
    ...draft.value,
    template: selectedTemplateId.value,
  })
  showToast('Invitation created successfully!', 'success')
  router.push(`/event/${newEv.id}`)
}
</script>

<template>
  <div class="min-h-screen bg-[#f4efe8] text-stone-900">
    <Navbar />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Toolbar Controls -->
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider pl-2">Device:</span>
          <div class="flex rounded-full bg-stone-100 p-1 text-xs font-medium">
            <button
              @click="deviceMode = 'phone'"
              class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition"
              :class="deviceMode === 'phone' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
            >
              <Smartphone class="h-3.5 w-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              @click="deviceMode = 'desktop'"
              class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition"
              :class="deviceMode === 'desktop' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
            >
              <MonitorSmartphone class="h-3.5 w-3.5" />
              <span>Desktop Page</span>
            </button>
          </div>
        </div>

        <!-- Template Switcher in Preview -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Style:</span>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="t in invitationTemplates"
              :key="t.id"
              @click="selectedTemplateId = t.id"
              class="rounded-full px-3 py-1.5 text-xs font-medium transition"
              :class="selectedTemplateId === t.id ? 'bg-stone-900 text-white shadow-sm' : 'border border-stone-200 text-stone-700 hover:bg-stone-50'"
            >
              {{ t.name }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button to="/create" variant="secondary" size="sm">
            <span class="inline-flex items-center gap-1.5">
              <PencilLine class="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </span>
          </Button>
          <Button @click="publishDraft" variant="primary" size="sm" class="bg-emerald-700 hover:bg-emerald-800 text-white">
            <span class="inline-flex items-center gap-1.5">
              <span>Publish Live</span>
              <ArrowRight class="h-3.5 w-3.5" />
            </span>
          </Button>
        </div>
      </div>

      <!-- Live Preview Render Area -->
      <div class="flex justify-center pb-12">
        <!-- Mobile Phone Frame Mockup -->
        <div
          v-if="deviceMode === 'phone'"
          class="relative w-full max-w-[390px] rounded-[3.5rem] border-[10px] border-stone-900 bg-stone-900 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.25)]"
        >
          <!-- Dynamic Island / Speaker notch -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-stone-900 z-30 flex items-center justify-center">
            <div class="h-2.5 w-2.5 rounded-full bg-stone-800 mr-2" />
            <div class="h-1.5 w-8 rounded-full bg-stone-800" />
          </div>

          <!-- Phone Inner Screen -->
          <div
            class="overflow-y-auto max-h-[740px] rounded-[2.75rem] shadow-inner transition-all"
            :class="currentTheme.containerClass"
          >
            <!-- Hero banner inside phone -->
            <div class="relative h-60 overflow-hidden">
              <img :src="previewData.image" alt="Cover" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t" :class="currentTheme.bannerGradient" />
              <div class="absolute inset-x-0 bottom-0 p-5 text-white">
                <span class="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] uppercase font-semibold">
                  {{ previewData.type }}
                </span>
                <h2 class="mt-1 text-2xl font-semibold leading-tight" :class="currentTheme.titleClass">
                  {{ previewData.title }}
                </h2>
              </div>
            </div>

            <div class="p-5 space-y-6">
              <!-- Hosts Centerpiece -->
              <div class="text-center py-2">
                <div class="text-[10px] uppercase tracking-[0.25em]" :class="currentTheme.headerAccent">Cordially Invited</div>
                <h3 class="mt-1 text-3xl font-semibold text-stone-900" :class="currentTheme.titleClass">
                  {{ previewData.hosts }}
                </h3>
                <p class="mt-3 text-xs leading-relaxed text-stone-600 italic">
                  “{{ previewData.description }}”
                </p>
              </div>

              <!-- Date Card -->
              <div class="rounded-2xl border p-4 text-center" :class="currentTheme.cardClass">
                <div class="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Date & Time</div>
                <div class="text-base font-semibold text-stone-900 mt-0.5">{{ previewData.date }} at {{ previewData.time }}</div>
                <div class="mt-1 flex items-center justify-center gap-1.5 text-xs text-stone-600">
                  <MapPin class="h-3.5 w-3.5" />
                  <span>{{ previewData.location }}</span>
                </div>
                
                <div class="mt-4 pt-4 border-t" :class="currentTheme.dividerClass">
                  <Countdown :target-date="targetDateTime" :theme="selectedTemplateId" />
                </div>
              </div>

              <!-- Schedule in Phone -->
              <div class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div class="text-xs font-semibold text-stone-900 mb-3">Celebration Program</div>
                <div class="space-y-2.5">
                  <div
                    v-for="(item, idx) in previewData.schedule"
                    :key="idx"
                    class="flex items-center gap-3 text-xs"
                  >
                    <span class="font-semibold text-amber-800 min-w-16">{{ item.time }}</span>
                    <span class="text-stone-700">{{ item.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Mock RSVP button -->
              <div class="rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm">
                <div class="text-xs font-semibold text-stone-900 mb-1">Join the Celebration</div>
                <p class="text-[11px] text-stone-500 mb-3">Guests will be able to confirm attendance here</p>
                <div class="w-full rounded-full bg-stone-900 py-2 text-xs font-medium text-white">
                  RSVP Form Active on Live Page
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Page Mockup -->
        <div
          v-else
          class="w-full max-w-4xl overflow-hidden rounded-[2.5rem] border shadow-2xl transition-all"
          :class="currentTheme.containerClass"
        >
          <div class="relative h-80 overflow-hidden">
            <img :src="previewData.image" alt="Cover" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t" :class="currentTheme.bannerGradient" />
            <div class="absolute inset-x-0 bottom-0 p-8 text-white">
              <span class="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs uppercase font-semibold">
                {{ previewData.type }}
              </span>
              <h1 class="mt-2 text-4xl sm:text-5xl font-semibold" :class="currentTheme.titleClass">
                {{ previewData.title }}
              </h1>
              <p class="mt-1 text-lg text-stone-200">Honoring {{ previewData.hosts }}</p>
            </div>
          </div>

          <div class="p-8 sm:p-10 space-y-8">
            <div class="text-center max-w-xl mx-auto">
              <div class="text-xs uppercase tracking-[0.3em] font-medium" :class="currentTheme.headerAccent">You are Invited</div>
              <h2 class="mt-2 text-4xl font-semibold text-stone-900" :class="currentTheme.titleClass">{{ previewData.hosts }}</h2>
              <p class="mt-4 text-base text-stone-700 leading-relaxed italic">“{{ previewData.description }}”</p>
            </div>

            <div class="rounded-3xl border p-6 text-center" :class="currentTheme.cardClass">
              <div class="text-xs uppercase tracking-wider text-stone-500 font-medium">When & Where</div>
              <div class="text-2xl font-semibold text-stone-900 mt-1">{{ previewData.date }} at {{ previewData.time }}</div>
                <p class="mt-1 flex items-center justify-center gap-1.5 text-sm text-stone-600">
                  <MapPin class="h-4 w-4" />
                  <span>{{ previewData.location }}</span>
                </p>
              <div class="mt-6 pt-6 border-t max-w-lg mx-auto" :class="currentTheme.dividerClass">
                <Countdown :target-date="targetDateTime" :theme="selectedTemplateId" />
              </div>
            </div>

            <LocationCard :address="previewData.location" />
          </div>
        </div>
      </div>
    </main>

    <Modal v-model="isShareOpen" :title="previewData.title" />
    <Toast />
    <Footer />
  </div>
</template>
