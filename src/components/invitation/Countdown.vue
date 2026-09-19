<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PartyPopper, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  targetDate: { type: String, required: true },
  theme: { type: String, default: 'classic' },
})

const now = ref(Date.now())
let timer = null

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const countdown = computed(() => {
  const target = new Date(props.targetDate).getTime()
  const difference = target - now.value

  if (difference <= 0) {
    return { isElapsed: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((difference / (1000 * 60)) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  return { isElapsed: false, days, hours, minutes, seconds }
})

// Two-digit formatter
const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div>
    <div v-if="countdown.isElapsed" class="rounded-2xl border border-amber-300/60 bg-amber-50/80 p-5 text-center shadow-sm">
      <div class="flex items-center justify-center gap-3 text-amber-700">
        <Sparkles class="h-5 w-5" />
        <PartyPopper class="h-5 w-5" />
        <Sparkles class="h-5 w-5" />
      </div>
      <h4 class="mt-1 text-base font-semibold text-amber-900">Today is the Celebration Day!</h4>
      <p class="mt-1 text-xs text-amber-700">Thank you for sharing this joyous moment with us.</p>
    </div>

    <div v-else class="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
      <div class="rounded-2xl border border-stone-200/80 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
        <div class="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">{{ pad(countdown.days) }}</div>
        <div class="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Days</div>
      </div>
      <div class="rounded-2xl border border-stone-200/80 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
        <div class="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">{{ pad(countdown.hours) }}</div>
        <div class="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Hours</div>
      </div>
      <div class="rounded-2xl border border-stone-200/80 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
        <div class="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">{{ pad(countdown.minutes) }}</div>
        <div class="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Mins</div>
      </div>
      <div class="rounded-2xl border border-stone-200/80 bg-white/90 p-3 sm:p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
        <div class="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums text-rose-600">{{ pad(countdown.seconds) }}</div>
        <div class="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Secs</div>
      </div>
    </div>
  </div>
</template>
