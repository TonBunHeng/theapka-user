<script setup>
defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-stone-300 hover:shadow-md">
    <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 shadow-sm">
      <component :is="icon" class="h-5 w-5" />
    </div>
    <h3 class="mb-2 text-lg font-semibold text-stone-900">{{ title }}</h3>
    <p class="text-sm leading-6 text-stone-600">{{ description }}</p>
  </div>
</template>
