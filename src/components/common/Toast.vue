<script setup>
import { Check, Info, TriangleAlert, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast.js'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center justify-between rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all text-sm font-medium"
          :class="{
            'bg-stone-900/95 text-white border-stone-800': toast.type === 'success',
            'bg-rose-900/95 text-white border-rose-800': toast.type === 'error',
            'bg-amber-900/95 text-white border-amber-800': toast.type === 'warning',
            'bg-white/95 text-stone-900 border-stone-200': toast.type === 'info',
          }"
        >
          <div class="flex items-center gap-3">
            <Check v-if="toast.type === 'success'" class="h-4 w-4 text-emerald-400" />
            <X v-else-if="toast.type === 'error'" class="h-4 w-4 text-rose-400" />
            <TriangleAlert v-else-if="toast.type === 'warning'" class="h-4 w-4 text-amber-400" />
            <Info v-else class="h-4 w-4 text-stone-400" />
            <span>{{ toast.message }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

