<script setup>
const props = defineProps({
  name: { type: String, required: true },
  description: { type: String, required: true },
  accent: { type: String, default: 'bg-stone-900 text-white' },
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    class="w-full rounded-3xl border p-4 text-left transition-all duration-200"
    :class="selected ? 'border-stone-900 bg-stone-50 shadow-md' : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'"
  >
    <div class="mb-4 rounded-2xl p-5 text-center shadow-inner" :class="accent">
      <div class="text-xl font-semibold tracking-[0.12em] uppercase">{{ name }}</div>
      <div class="mt-3 text-xs tracking-[0.22em] uppercase opacity-70">You are invited</div>
    </div>
    <div class="text-base font-medium text-stone-900">{{ name }}</div>
    <p class="mt-2 text-sm leading-6 text-stone-600">{{ description }}</p>
  </button>
</template>
