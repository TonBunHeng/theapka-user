<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowRight, ArrowUpRight, CalendarDays, Lightbulb, MapPin, Plus, Sparkles } from 'lucide-vue-next'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import Button from '@/components/common/Button.vue'
import Toast from '@/components/common/Toast.vue'
import InvitationTemplateCard from '@/components/invitation/InvitationTemplateCard.vue'
import Countdown from '@/components/invitation/Countdown.vue'
import { eventCategories, invitationTemplates, imagePresets } from '@/data/mockData.js'
import { useEvents } from '@/composables/useEvents.js'
import { getTheme } from '@/composables/useTheme.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const route = useRoute()
const { createEvent, updateEvent, getEvent, draft } = useEvents()
const { showToast } = useToast()

const step = ref(1)
const isEditing = ref(false)
const editingId = ref(null)

// Local editable copy of the draft
const form = ref({
  type: 'Wedding',
  title: 'Wedding Celebration',
  hostName: 'Sok & Dara',
  date: '2026-12-20',
  time: '17:00',
  location: 'Sokha Siem Reap Resort, Siem Reap, Cambodia',
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

onMounted(() => {
  if (route.query.edit) {
    const existing = getEvent(route.query.edit)
    if (existing) {
      isEditing.value = true
      editingId.value = existing.id
      form.value = {
        type: existing.type || 'Wedding',
        title: existing.title || '',
        hostName: existing.hosts || '',
        date: existing.date || '',
        time: existing.time || '17:00',
        location: existing.location || '',
        description: existing.description || '',
        hostMessage: existing.hostMessage || '',
        coverImage: existing.image || '',
        template: existing.template || 'classic',
        schedule: existing.schedule ? [...existing.schedule] : [],
        qrBank: existing.qrDetails?.bankName || 'ABA Bank',
        qrName: existing.qrDetails?.accountName || '',
        qrNumber: existing.qrDetails?.accountNumber || '',
      }
    }
  } else if (draft.value) {
    form.value = { ...draft.value }
  }
})

const previewTitle = computed(() => form.value.title || 'Your Celebration')
const selectedTemplate = computed(() => {
  return invitationTemplates.find((t) => t.id === form.value.template) || invitationTemplates[0]
})
const currentTheme = computed(() => getTheme(form.value.template))

// Schedule management
const newScheduleTime = ref('')
const newScheduleLabel = ref('')

const addScheduleItem = () => {
  if (!newScheduleTime.value || !newScheduleLabel.value) {
    showToast('Please provide both time and activity name', 'warning')
    return
  }
  form.value.schedule.push({
    time: newScheduleTime.value,
    label: newScheduleLabel.value,
  })
  newScheduleTime.value = ''
  newScheduleLabel.value = ''
}

const removeScheduleItem = (index) => {
  form.value.schedule.splice(index, 1)
}

// Step navigation
const validateStep = () => {
  if (step.value === 1 && !form.value.type) {
    showToast('Please select an event type', 'warning')
    return false
  }
  if (step.value === 2) {
    if (!form.value.title.trim() || !form.value.hostName.trim() || !form.value.date || !form.value.location.trim()) {
      showToast('Please fill out the title, hosts, date, and venue location', 'warning')
      return false
    }
  }
  return true
}

const nextStep = () => {
  if (validateStep() && step.value < 4) {
    step.value += 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  if (step.value > 1) {
    step.value -= 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Final Publish Action
const publish = () => {
  if (!validateStep()) return

  if (isEditing.value && editingId.value) {
    updateEvent(editingId.value, {
      type: form.value.type,
      title: form.value.title,
      hosts: form.value.hostName,
      date: form.value.date,
      time: form.value.time,
      location: form.value.location,
      description: form.value.description,
      hostMessage: form.value.hostMessage,
      image: form.value.coverImage,
      template: form.value.template,
      schedule: form.value.schedule,
      qrDetails: form.value.qrNumber ? {
        bankName: form.value.qrBank || 'ABA Bank',
        accountName: form.value.qrName || form.value.hostName,
        accountNumber: form.value.qrNumber,
        qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(form.value.qrNumber)}`,
      } : null,
    })
    showToast('Invitation successfully updated!', 'success')
    router.push(`/event/${editingId.value}`)
  } else {
    const newEvent = createEvent(form.value)
    showToast('Your invitation is live and ready to share!', 'success')
    router.push(`/event/${newEvent.id}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f4ef] text-stone-900">
    <Navbar />

    <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <span class="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-600 ring-1 ring-stone-200 shadow-sm">
          {{ isEditing ? 'Edit Invitation' : 'New Digital Invitation' }}
        </span>
        <h1 class="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
          {{ isEditing ? 'Update Your Event Details' : 'Design Your Celebration' }}
        </h1>
        <p class="mt-2 text-sm text-stone-600 max-w-md mx-auto">
          Craft a bespoke invitation page with interactive RSVP, schedules, and music in minutes.
        </p>
      </div>

      <!-- Step Indicator Tracker -->
      <div class="mb-10 flex justify-center">
        <div class="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-2 shadow-sm">
          <div v-for="index in 4" :key="index" class="flex items-center gap-2">
            <button
              @click="step = index"
              :disabled="step < index"
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition cursor-pointer disabled:cursor-not-allowed"
              :class="step === index ? 'bg-stone-900 text-white shadow-sm' : step > index ? 'bg-stone-200 text-stone-800' : 'bg-stone-100 text-stone-400'"
            >
              {{ index }}
            </button>
            <div v-if="index < 4" class="h-px w-6 sm:w-10 bg-stone-200" />
          </div>
        </div>
      </div>

      <!-- Main Layout: Form Column & Sidebar Summary -->
      <div class="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">
        <section class="rounded-[2.5rem] border border-stone-200 bg-white p-6 sm:p-10 shadow-sm">
          <!-- Step 1: Occasion Type -->
          <div v-if="step === 1" class="space-y-6">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">Step 1</span>
              <h2 class="mt-1 text-2xl font-semibold text-stone-900">What kind of celebration is this?</h2>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="cat in eventCategories"
                :key="cat.title"
                type="button"
                @click="form.type = cat.title"
                class="flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200"
                :class="
                  form.type === cat.title
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                    : 'border-stone-200 bg-stone-50/70 text-stone-800 hover:border-stone-300 hover:bg-white'
                "
              >
                <span class="text-2xl">{{ cat.icon }}</span>
                <div>
                  <div class="text-sm font-semibold">{{ cat.title }}</div>
                  <p class="mt-0.5 text-xs opacity-75 line-clamp-2 leading-relaxed">{{ cat.description }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Event Details -->
          <div v-else-if="step === 2" class="space-y-6">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">Step 2</span>
              <h2 class="mt-1 text-2xl font-semibold text-stone-900">Event Details & Welcome Note</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Event Title <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Wedding Celebration of Sok & Dara"
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Host Names <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.hostName"
                  type="text"
                  placeholder="e.g. Sok & Dara or The Groom & Bride Families"
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-stone-700">Event Date <span class="text-rose-500">*</span></label>
                  <input
                    v-model="form.date"
                    type="date"
                    class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-stone-700">Event Time <span class="text-rose-500">*</span></label>
                  <input
                    v-model="form.time"
                    type="time"
                    class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Venue & Address <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.location"
                  type="text"
                  placeholder="e.g. Sokha Siem Reap Resort, Siem Reap, Cambodia"
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Invitation Story / Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Write a heartfelt invitation message to your guests..."
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                ></textarea>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Host Welcome Message</label>
                <textarea
                  v-model="form.hostMessage"
                  rows="2"
                  placeholder="A short warm greeting or attire note for arriving guests..."
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
                ></textarea>
              </div>

              <!-- Cover Image Picker -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-stone-700">Cover Photo Preset</label>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  <button
                    v-for="preset in imagePresets"
                    :key="preset.url"
                    type="button"
                    @click="form.coverImage = preset.url"
                    class="relative aspect-video rounded-xl overflow-hidden border-2 transition-all"
                    :class="form.coverImage === preset.url ? 'border-stone-900 ring-2 ring-stone-900/20' : 'border-stone-200 opacity-70 hover:opacity-100'"
                  >
                    <img :src="preset.url" :alt="preset.label" class="h-full w-full object-cover" />
                  </button>
                </div>
                <input
                  v-model="form.coverImage"
                  type="url"
                  placeholder="Or enter custom image URL: https://..."
                  class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-2.5 text-xs outline-none transition focus:border-stone-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Template & Schedule & Gift QR -->
          <div v-else-if="step === 3" class="space-y-8">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">Step 3</span>
              <h2 class="mt-1 text-2xl font-semibold text-stone-900">Choose Invitation Style & Agenda</h2>
            </div>

            <!-- Templates -->
            <div>
              <h3 class="text-sm font-semibold text-stone-800 mb-3">Invitation Design Theme</h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <InvitationTemplateCard
                  v-for="t in invitationTemplates"
                  :key="t.id"
                  :name="t.name"
                  :description="t.description"
                  :accent="t.accent"
                  :selected="form.template === t.id"
                  @click="form.template = t.id"
                />
              </div>
            </div>

            <!-- Schedule Builder -->
            <div class="border-t border-stone-200 pt-6">
              <h3 class="text-sm font-semibold text-stone-800 mb-3">Event Schedule Timeline</h3>
              
              <div class="space-y-2 mb-4">
                <div
                  v-for="(item, idx) in form.schedule"
                  :key="idx"
                  class="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-xs"
                >
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-stone-900">{{ item.time }}</span>
                    <span class="text-stone-700">{{ item.label }}</span>
                  </div>
                  <button
                    type="button"
                    @click="removeScheduleItem(idx)"
                    class="text-rose-500 hover:text-rose-700 px-2 py-1 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  v-model="newScheduleTime"
                  type="text"
                  placeholder="e.g. 5:00 PM"
                  class="sm:w-36 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-stone-400"
                />
                <input
                  v-model="newScheduleLabel"
                  type="text"
                  placeholder="e.g. Ceremony Begins"
                  class="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-stone-400"
                />
                <button
                  type="button"
                  @click="addScheduleItem"
                  class="rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition"
                >
                  + Add Item
                </button>
              </div>
            </div>

            <!-- Optional Digital Envelope / Bank Details -->
            <div class="border-t border-stone-200 pt-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-stone-800">Digital Blessing Envelope (Optional)</h3>
                <span class="text-xs text-stone-400">KHQR / ABA</span>
              </div>
              <div class="grid gap-3 sm:grid-cols-3">
                <div>
                  <label class="mb-1 block text-[11px] font-medium text-stone-600">Bank Name</label>
                  <input
                    v-model="form.qrBank"
                    type="text"
                    placeholder="ABA Bank"
                    class="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-[11px] font-medium text-stone-600">Account Name</label>
                  <input
                    v-model="form.qrName"
                    type="text"
                    placeholder="SOK & DARA"
                    class="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-[11px] font-medium text-stone-600">Account / Phone No.</label>
                  <input
                    v-model="form.qrNumber"
                    type="text"
                    placeholder="001 234 567"
                    class="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Final Review -->
          <div v-else class="space-y-6">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">Step 4</span>
              <h2 class="mt-1 text-2xl font-semibold text-stone-900">Review & Publish Invitation</h2>
            </div>

            <!-- Mock Preview Card -->
            <div
              class="overflow-hidden rounded-[2rem] border shadow-sm transition-all"
              :class="currentTheme.containerClass"
            >
              <div class="relative h-44 overflow-hidden">
                <img :src="form.coverImage" alt="Preview cover" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span class="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
                    {{ form.type }}
                  </span>
                  <h3 class="mt-1 text-2xl font-semibold" :class="currentTheme.titleClass">
                    {{ form.title }}
                  </h3>
                </div>
              </div>

              <div class="p-6 text-center space-y-4">
                <div class="text-xs uppercase tracking-[0.25em] text-stone-400">Cordially Invited</div>
                <h4 class="text-3xl font-semibold text-stone-900" :class="currentTheme.titleClass">
                  {{ form.hostName }}
                </h4>
                <p class="text-xs sm:text-sm text-stone-600 max-w-md mx-auto italic">
                  “{{ form.description }}”
                </p>

                <div class="rounded-2xl border p-4 text-xs space-y-1.5 max-w-sm mx-auto" :class="currentTheme.cardClass">
                  <div class="flex items-center justify-center gap-2 font-semibold text-stone-900">
                    <CalendarDays class="h-3.5 w-3.5" />
                    <span>{{ form.date }} at {{ form.time }}</span>
                  </div>
                  <div class="flex items-center justify-center gap-2 text-stone-600">
                    <MapPin class="h-3.5 w-3.5" />
                    <span>{{ form.location }}</span>
                  </div>
                </div>

                <div class="pt-2">
                  <div class="text-[11px] uppercase tracking-wider text-stone-400 mb-2">Theme Preview: {{ selectedTemplate.name }}</div>
                  <Countdown :target-date="`${form.date}T${form.time || '17:00'}:00`" :theme="form.template" />
                </div>
              </div>
            </div>
          </div>

          <!-- Wizard Action Buttons -->
          <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 pt-6">
            <Button
              v-if="step > 1"
              type="button"
              @click="previousStep"
              variant="secondary"
            >
              ← Back
            </Button>
            <div v-else class="hidden sm:block" />

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <Button
                v-if="step < 4"
                type="button"
                @click="nextStep"
                variant="primary"
                class="flex-1 sm:flex-none"
              >
                <span class="inline-flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight class="h-3.5 w-3.5" />
                </span>
              </Button>
              <Button
                v-else
                type="button"
                @click="publish"
                variant="primary"
                class="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <span class="inline-flex items-center gap-2">
                  <Sparkles class="h-3.5 w-3.5" />
                  <span>{{ isEditing ? 'Save Changes' : 'Publish Invitation' }}</span>
                </span>
              </Button>
            </div>
          </div>
        </section>

        <!-- Sidebar Summary -->
        <aside class="space-y-6">
          <div class="rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-stone-900">Invitation Summary</h3>
            <div class="mt-5 space-y-3.5 text-xs text-stone-600">
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Category</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ form.type }}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Title</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ previewTitle }}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Hosts</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ form.hostName || 'Not specified' }}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Theme Template</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ selectedTemplate.name }}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Date & Time</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ form.date ? `${form.date} at ${form.time}` : 'Not set' }}</p>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">Agenda</span>
                <p class="mt-0.5 text-sm font-semibold text-stone-900">{{ form.schedule.length }} schedule items</p>
              </div>
            </div>

            <div class="mt-6 border-t border-stone-100 pt-4">
              <router-link
                to="/preview"
                class="block text-center rounded-full border border-stone-200 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
              >
                <span class="inline-flex items-center justify-center gap-1.5">
                  <span>Open Full Preview</span>
                  <ArrowUpRight class="h-3.5 w-3.5" />
                </span>
              </router-link>
            </div>
          </div>

          <!-- Tips Box -->
          <div class="rounded-[2.5rem] border border-amber-200/60 bg-amber-50/50 p-6 text-xs text-stone-700 space-y-2">
            <div class="flex items-center gap-1.5 font-semibold text-amber-900 text-sm">
              <Lightbulb class="h-4 w-4" />
              <span>Host Tip</span>
            </div>
            <p class="leading-relaxed">
              Guests appreciate receiving wedding invitations 4–6 weeks prior. You can copy the link or print the QR code onto paper invitation cards!
            </p>
          </div>
        </aside>
      </div>
    </main>

    <Toast />
    <Footer />
  </div>
</template>
