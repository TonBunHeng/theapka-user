<script setup>
import { ref, computed } from 'vue'
import { Download, Mail, PartyPopper, Plus, Settings, Smartphone, Sparkles, Users } from 'lucide-vue-next'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import Button from '@/components/common/Button.vue'
import Modal from '@/components/common/Modal.vue'
import Toast from '@/components/common/Toast.vue'
import EventCard from '@/components/event/EventCard.vue'
import { useEvents } from '@/composables/useEvents.js'
import { useToast } from '@/composables/useToast.js'

const { events, rsvps, deleteEvent } = useEvents()
const { showToast } = useToast()

const activeTab = ref('events') // 'events' | 'guests' | 'settings'
const selectedEventFilter = ref('all')
const isShareOpen = ref(false)
const shareEventTarget = ref(null)

// Stats calculation
const totalEvents = computed(() => events.value.length)
const totalRSVPs = computed(() => rsvps.value.length)
const confirmedGuests = computed(() => {
  return rsvps.value
    .filter((r) => r.status === 'attending')
    .reduce((acc, curr) => acc + (curr.guests || 1), 0)
})

const filteredEvents = computed(() => {
  if (selectedEventFilter.value === 'all') return events.value
  return events.value.filter((e) => e.status?.toLowerCase() === selectedEventFilter.value)
})

const filteredRSVPs = computed(() => {
  if (selectedEventFilter.value === 'all') return rsvps.value
  return rsvps.value.filter((r) => r.status === selectedEventFilter.value)
})

const handleShare = (id) => {
  const ev = events.value.find((e) => e.id === id)
  if (ev) {
    shareEventTarget.value = ev
    isShareOpen.value = true
  }
}

const handleDelete = (id) => {
  if (confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
    deleteEvent(id)
    showToast('Event deleted successfully', 'info')
  }
}

const exportGuestsCSV = () => {
  if (rsvps.value.length === 0) {
    showToast('No RSVPs to export yet', 'warning')
    return
  }

  const headers = ['Event ID', 'Guest Name', 'Attendance Status', 'Guests Count', 'Wishes / Message', 'RSVP Date']
  const rows = rsvps.value.map((r) => [
    `"${r.eventId}"`,
    `"${r.name}"`,
    `"${r.status}"`,
    r.guests || 1,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    `"${r.createdAt || ''}"`,
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'theapka_guest_rsvps.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showToast('Guest list exported to CSV!', 'success')
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f4ef] text-stone-900">
    <Navbar />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[250px_1fr] items-start">
        <!-- Dashboard Sidebar -->
        <aside class="rounded-[2.5rem] border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
          <div class="mb-6 flex items-center gap-3.5 border-b border-stone-100 pb-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-base font-semibold text-white shadow-sm">
              T
            </div>
            <div>
              <p class="text-base font-semibold text-stone-900">Alex Heng</p>
              <p class="text-xs text-stone-500">Event Host</p>
            </div>
          </div>

          <nav class="space-y-1.5">
            <button
              @click="activeTab = 'events'"
              class="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-medium transition text-left"
              :class="activeTab === 'events' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'"
            >
              <PartyPopper class="h-3.5 w-3.5" />
              <span>My Invitations</span>
            </button>

            <button
              @click="activeTab = 'guests'"
              class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-medium transition text-left"
              :class="activeTab === 'guests' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'"
            >
              <div class="flex items-center gap-2.5">
                <Users class="h-3.5 w-3.5" />
                <span>Guests & RSVPs</span>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-[10px]"
                :class="activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'"
              >
                {{ rsvps.length }}
              </span>
            </button>

            <router-link
              to="/create"
              class="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
            >
              <Sparkles class="h-3.5 w-3.5" />
              <span>Create New</span>
            </router-link>

            <router-link
              to="/preview"
              class="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
            >
              <Smartphone class="h-3.5 w-3.5" />
              <span>Phone Preview</span>
            </router-link>

            <button
              @click="activeTab = 'settings'"
              class="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-medium transition text-left"
              :class="activeTab === 'settings' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'"
            >
              <Settings class="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <section class="space-y-6">
          <!-- Overview Header Banner -->
          <div class="rounded-[2.5rem] border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">Host Portal</span>
                <h1 class="mt-1 text-2xl sm:text-3xl font-semibold text-stone-900">Celebration Overview</h1>
                <p class="text-xs text-stone-500 mt-1">Manage guest attendance, invitations, and blessings in real time</p>
              </div>
              <div class="flex items-center gap-2">
                <Button to="/create" variant="primary" size="sm">
                  <span class="inline-flex items-center gap-1.5">
                    <Plus class="h-3.5 w-3.5" />
                    <span>Create Invitation</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <!-- Quick Metrics Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <span class="text-xs font-medium text-stone-500 uppercase tracking-wider">Events</span>
              <div class="mt-2 text-3xl font-semibold text-stone-900">{{ totalEvents }}</div>
              <div class="mt-1 text-[11px] text-emerald-600 font-medium">Active campaigns</div>
            </div>

            <div class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <span class="text-xs font-medium text-stone-500 uppercase tracking-wider">Total RSVPs</span>
              <div class="mt-2 text-3xl font-semibold text-stone-900">{{ totalRSVPs }}</div>
              <div class="mt-1 text-[11px] text-stone-500">Responses received</div>
            </div>

            <div class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <span class="text-xs font-medium text-stone-500 uppercase tracking-wider">Attending</span>
              <div class="mt-2 text-3xl font-semibold text-emerald-600">{{ confirmedGuests }}</div>
              <div class="mt-1 text-[11px] text-stone-500">Confirmed seats</div>
            </div>

            <div class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <span class="text-xs font-medium text-stone-500 uppercase tracking-wider">Response Rate</span>
              <div class="mt-2 text-3xl font-semibold text-amber-700">96%</div>
              <div class="mt-1 text-[11px] text-stone-500">Guest interaction</div>
            </div>
          </div>

          <!-- TAB 1: My Events -->
          <div v-if="activeTab === 'events'" class="rounded-[2.5rem] border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-stone-900">My Invitations</h2>
                <p class="text-xs text-stone-500 mt-0.5">Click preview to view guest experience or copy links</p>
              </div>

              <div class="flex items-center gap-2">
                <select
                  v-model="selectedEventFilter"
                  class="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 outline-none"
                >
                  <option value="all">All Events</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="planning">Planning</option>
                </select>
              </div>
            </div>

            <div v-if="filteredEvents.length === 0" class="py-12 text-center text-sm text-stone-500">
              <div class="mb-2 flex justify-center text-stone-400">
                <Mail class="h-8 w-8" />
              </div>
              No invitations found. Click "Create Invitation" to get started!
            </div>

            <div v-else class="grid gap-6 sm:grid-cols-2">
              <EventCard
                v-for="ev in filteredEvents"
                :key="ev.id"
                :id="ev.id"
                :title="ev.title"
                :date="ev.date"
                :guests="ev.guestsCount || 0"
                :status="ev.status || 'Active'"
                :image="ev.image"
                :type="ev.type"
                @share="handleShare"
                @delete="handleDelete"
              />
            </div>
          </div>

          <!-- TAB 2: Guests & RSVPs Tracker -->
          <div v-else-if="activeTab === 'guests'" class="rounded-[2.5rem] border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-stone-900">Guest List & RSVPs</h2>
                <p class="text-xs text-stone-500 mt-0.5">Real-time attendance responses and blessings from guests</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="exportGuestsCSV"
                  class="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition shadow-sm"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <Download class="h-3.5 w-3.5" />
                    <span>Export to CSV</span>
                  </span>
                </button>
              </div>
            </div>

            <div v-if="rsvps.length === 0" class="py-12 text-center text-sm text-stone-500">
              <div class="mb-2 flex justify-center text-stone-400">
                <Users class="h-8 w-8" />
              </div>
              No guest responses yet. Share your invitation link to start collecting RSVPs!
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-stone-100 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th class="pb-3 pl-2">Guest</th>
                    <th class="pb-3">Status</th>
                    <th class="pb-3">Seats</th>
                    <th class="pb-3">Event</th>
                    <th class="pb-3">Wishes</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 text-stone-700">
                  <tr v-for="rsvp in rsvps" :key="rsvp.id" class="hover:bg-stone-50/80 transition">
                    <td class="py-3.5 pl-2 font-medium text-stone-900">
                      {{ rsvp.name }}
                    </td>
                    <td class="py-3.5">
                      <span
                        class="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                        :class="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': rsvp.status === 'attending',
                          'bg-amber-50 text-amber-700 border border-amber-200': rsvp.status === 'maybe',
                          'bg-rose-50 text-rose-700 border border-rose-200': rsvp.status === 'declined',
                        }"
                      >
                        {{ rsvp.status }}
                      </span>
                    </td>
                    <td class="py-3.5 font-medium">
                      {{ rsvp.status === 'attending' ? `${rsvp.guests} person(s)` : '-' }}
                    </td>
                    <td class="py-3.5 text-stone-500 font-mono text-[11px]">
                      {{ rsvp.eventId }}
                    </td>
                    <td class="py-3.5 max-w-xs truncate italic text-stone-600">
                      {{ rsvp.message || '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: Settings -->
          <div v-else class="rounded-[2.5rem] border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 class="text-xl font-semibold text-stone-900">Account & Preferences</h2>
              <p class="text-xs text-stone-500 mt-0.5">Manage your organizer profile and notification preferences</p>
            </div>

            <div class="space-y-4 max-w-lg text-xs">
              <div>
                <label class="block font-medium text-stone-700 mb-1">Host Display Name</label>
                <input
                  type="text"
                  value="Alex Heng"
                  class="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label class="block font-medium text-stone-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value="alex.heng@example.com"
                  class="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 outline-none focus:border-stone-400"
                />
              </div>

              <div class="pt-2">
                <button
                  type="button"
                  @click="showToast('Preferences saved successfully', 'success')"
                  class="rounded-full bg-stone-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Share Modal for any selected event -->
    <Modal
      v-model="isShareOpen"
      :title="shareEventTarget?.title || 'Share Invitation'"
      :event-url="shareEventTarget ? `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${shareEventTarget.id}` : ''"
      :event-title="shareEventTarget?.title"
    />

    <Toast />
    <Footer />
  </div>
</template>
