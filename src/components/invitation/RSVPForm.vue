<script setup>
import { ref } from 'vue'
import { Check, Clock3, Flower2, Mail } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  eventId: { type: String, default: 'sok-dara-wedding' },
  eventTitle: { type: String, default: 'Wedding Celebration' },
})

const emit = defineEmits(['submitted'])
const { showToast } = useToast()

const submitted = ref(false)
const selectedStatus = ref('attending') // 'attending' | 'maybe' | 'declined'

const form = ref({
  name: '',
  guests: 1,
  message: '',
})

const submit = () => {
  if (!form.value.name.trim()) {
    showToast('Please enter your name to confirm RSVP.', 'warning')
    return
  }

  const payload = {
    name: form.value.name.trim(),
    guests: selectedStatus.value === 'attending' ? form.value.guests : 0,
    status: selectedStatus.value,
    message: form.value.message.trim(),
  }

  emit('submitted', payload)
  submitted.value = true
  showToast(
    selectedStatus.value === 'attending'
      ? 'RSVP confirmed! We look forward to celebrating together!'
      : 'Thank you for letting us know!',
    'success'
  )
}

const reset = () => {
  submitted.value = false
}
</script>

<template>
  <div class="rounded-[2.5rem] border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300">
    <!-- Submitted Confirmation Card -->
    <div v-if="submitted" class="text-center py-6 animate-in fade-in zoom-in-95">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600 border border-emerald-200">
        <Check class="h-7 w-7" />
      </div>
      <h3 class="text-2xl font-semibold text-stone-900">
        {{ selectedStatus === 'attending' ? 'RSVP Confirmed!' : 'Response Received' }}
      </h3>
      <p class="mt-2 text-sm text-stone-600 max-w-sm mx-auto">
        Thank you, <strong class="text-stone-900 font-semibold">{{ form.name }}</strong>.
        {{
          selectedStatus === 'attending'
            ? `We have reserved ${form.guests} seat(s) for you.`
            : 'We appreciate your warm reply and heartfelt wishes.'
        }}
      </p>

      <div class="mt-6 flex justify-center">
        <button
          @click="reset"
          class="rounded-full border border-stone-200 px-5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition"
        >
          Change Response
        </button>
      </div>
    </div>

    <!-- Active RSVP Form -->
    <div v-else>
      <div class="mb-5">
        <span class="text-xs uppercase tracking-[0.24em] text-stone-400 font-medium">Guest Attendance</span>
        <h3 class="mt-1 text-2xl font-semibold text-stone-900">Will you join us?</h3>
      </div>

      <div class="mb-6 grid grid-cols-3 gap-2">
        <button
          type="button"
          @click="selectedStatus = 'attending'"
          class="rounded-2xl border p-3 text-center transition-all duration-200 flex flex-col items-center gap-1 text-xs font-medium"
          :class="
            selectedStatus === 'attending'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500/30'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          "
        >
            <Flower2 class="h-4 w-4" />
          <span>Accept</span>
        </button>

        <button
          type="button"
          @click="selectedStatus = 'maybe'"
          class="rounded-2xl border p-3 text-center transition-all duration-200 flex flex-col items-center gap-1 text-xs font-medium"
          :class="
            selectedStatus === 'maybe'
              ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-500/30'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          "
        >
            <Clock3 class="h-4 w-4" />
          <span>Maybe</span>
        </button>

        <button
          type="button"
          @click="selectedStatus = 'declined'"
          class="rounded-2xl border p-3 text-center transition-all duration-200 flex flex-col items-center gap-1 text-xs font-medium"
          :class="
            selectedStatus === 'declined'
              ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-500/30'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
          "
        >
            <Mail class="h-4 w-4" />
          <span>Decline</span>
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-stone-700">
            Full Name <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-200"
            placeholder="e.g. Sothea & Family"
          />
        </div>

        <div v-if="selectedStatus === 'attending'">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-medium text-stone-700">Number of Guests Attending</label>
            <span class="text-xs font-semibold text-stone-900">{{ form.guests }} person(s)</span>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model.number="form.guests"
              type="range"
              min="1"
              max="10"
              class="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-stone-700">Blessings & Wishes</label>
          <textarea
            v-model="form.message"
            rows="3"
            class="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-200"
            placeholder="Leave a sweet congratulatory note for the hosts..."
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full rounded-full bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:bg-stone-950 shadow-sm"
        >
          {{ selectedStatus === 'attending' ? 'Confirm RSVP & Attendance' : 'Submit RSVP' }}
        </button>
      </form>
    </div>
  </div>
</template>
