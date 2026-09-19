<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  to: { type: String, default: '' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])

const variants = {
  primary: 'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950 shadow-stone-900/10',
  secondary: 'bg-white text-stone-900 ring-1 ring-stone-200 hover:bg-stone-50 active:bg-stone-100 shadow-sm',
  outline: 'bg-transparent text-stone-900 ring-1 ring-stone-300 hover:bg-stone-100 active:bg-stone-200',
  soft: 'bg-rose-50 text-rose-900 hover:bg-rose-100 active:bg-rose-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/10',
  gold: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-out shadow-sm select-none gap-2',
  variants[props.variant] || variants.primary,
  sizes[props.size] || sizes.md,
  props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0',
])
</script>

<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to || undefined"
    :type="!to ? type : undefined"
    :class="buttonClasses"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>
