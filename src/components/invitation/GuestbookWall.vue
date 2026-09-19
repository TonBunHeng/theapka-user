<script setup>
import { Mail } from 'lucide-vue-next'

defineProps({
  rsvps: {
    type: Array,
    default: () => [],
  },
})

const getStatusBadge = (status) => {
  if (status === 'attending') return { label: 'Attending', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (status === 'maybe') return { label: 'Maybe', class: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { label: 'Warm Wishes', class: 'bg-stone-50 text-stone-600 border-stone-200' }
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="rounded-[2.5rem] border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-[0.24em] text-stone-400 font-medium">Blessings Wall</span>
        <h3 class="mt-1 text-2xl font-semibold text-stone-900">Guestbook & Wishes</h3>
      </div>
      <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
        {{ rsvps.filter((r) => r.message).length }} wishes
      </span>
    </div>

    <div v-if="rsvps.filter((r) => r.message).length === 0" class="py-8 text-center text-sm text-stone-500">
      <div class="mb-2 flex justify-center text-stone-400">
        <Mail class="h-7 w-7" />
      </div>
      Be the first to leave warm blessings and wishes for the celebration!
    </div>

    <div v-else class="space-y-4 max-h-[420px] overflow-y-auto pr-1">
      <div
        v-for="rsvp in rsvps.filter((r) => r.message)"
        :key="rsvp.id"
        class="rounded-2xl border border-stone-100 bg-[#fbf9f6] p-4.5 transition-all hover:bg-stone-50/80"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
              {{ rsvp.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-sm font-semibold text-stone-900">{{ rsvp.name }}</div>
              <div class="text-[11px] text-stone-400">{{ formatDate(rsvp.createdAt) }}</div>
            </div>
          </div>
          <span
            class="rounded-full px-2.5 py-0.5 text-[10px] font-medium border"
            :class="getStatusBadge(rsvp.status).class"
          >
            {{ getStatusBadge(rsvp.status).label }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-stone-700 leading-relaxed pl-10 italic">
          “{{ rsvp.message }}”
        </p>
      </div>
    </div>
  </div>
</template>

