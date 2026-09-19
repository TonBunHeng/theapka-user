<script setup>
import { computed } from 'vue'
import { CalendarDays, Share2, Trash2, Users } from 'lucide-vue-next'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  guests: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  image: { type: String, default: '' },
  type: { type: String, default: 'Event' },
})

defineEmits(['share', 'delete'])

const formattedDate = computed(() => {
  if (!props.date) return ''
  try {
    const d = new Date(props.date)
    return isNaN(d.getTime()) ? props.date : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return props.date
  }
})
</script>

<template>
  <article class="group overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <div class="relative h-44 overflow-hidden bg-stone-100">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
      <span class="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-stone-800 backdrop-blur-sm shadow-sm">
        {{ type }}
      </span>
      <span
        class="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur-sm"
        :class="status === 'Confirmed' || status === 'Active' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'"
      >
        {{ status }}
      </span>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
      <div>
        <h3 class="text-lg font-semibold text-stone-900 group-hover:text-amber-800 transition line-clamp-1">
          {{ title }}
        </h3>
        <div class="mt-1 flex items-center gap-2 text-xs text-stone-500">
          <CalendarDays class="h-3.5 w-3.5" />
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-600">
        <span class="flex items-center gap-1.5 font-medium">
          <Users class="h-3.5 w-3.5 text-stone-400" />
          <span>{{ guests }} Confirmed Guests</span>
        </span>
        <button
          @click="$emit('share', id)"
          class="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 transition"
        >
          <span>Share</span>
          <Share2 class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <router-link
          :to="`/event/${id}`"
          class="flex-1 text-center rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-stone-800"
        >
          View Invitation
        </router-link>

        <router-link
          :to="`/create?edit=${id}`"
          class="rounded-full border border-stone-200 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
        >
          Edit
        </router-link>

        <button
          @click="$emit('delete', id)"
          title="Delete Event"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition"
          aria-label="Delete Event"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </article>
</template>
