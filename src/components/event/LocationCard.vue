<script setup>
import { ref, computed } from 'vue'
import { ArrowUpRight, MapPin } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  title: { type: String, default: 'Venue Location' },
  address: { type: String, required: true },
})

const { showToast } = useToast()
const showEmbed = ref(false)

const googleMapsUrl = computed(() => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`
})

const embedMapUrl = computed(() => {
  return `https://maps.google.com/maps?q=${encodeURIComponent(props.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
})

const copyAddress = async () => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(props.address)
      showToast('Address copied to clipboard!')
    }
  } catch {
    showToast('Could not copy address', 'error')
  }
}
</script>

<template>
  <div class="rounded-[2.5rem] border border-stone-200/90 bg-white p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/50 text-amber-700">
          <MapPin class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-stone-900">{{ title }}</h3>
          <p class="text-xs text-stone-500">Getting here</p>
        </div>
      </div>

      <button
        @click="showEmbed = !showEmbed"
        class="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
      >
        {{ showEmbed ? 'Hide Map' : 'Show Map' }}
      </button>
    </div>

    <p class="text-sm leading-6 text-stone-700 mb-4">{{ address }}</p>

    <!-- Embedded Google Map -->
    <div v-if="showEmbed" class="mb-4 overflow-hidden rounded-2xl border border-stone-200 aspect-video w-full">
      <iframe
        :src="embedMapUrl"
        class="h-full w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>

    <div class="flex flex-wrap gap-2">
      <a
        :href="googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-stone-800"
      >
        <span>Open in Google Maps</span>
        <ArrowUpRight class="h-3.5 w-3.5" />
      </a>

      <button
        @click="copyAddress"
        class="rounded-full border border-stone-200 px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
      >
        Copy Address
      </button>
    </div>
  </div>
</template>
