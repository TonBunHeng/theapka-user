<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import Button from '@/components/common/Button.vue'

const route = useRoute()

const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'Create', to: '/create' },
  { label: 'Preview', to: '/preview' },
  { label: 'Dashboard', to: '/dashboard' },
]

const isMenuOpen = ref(false)

const isActive = (to) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-stone-200/80 bg-[rgba(247,244,239,0.94)] backdrop-blur-md">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-sm font-semibold text-white shadow-sm transition group-hover:bg-amber-900">
          T
        </div>
        <div>
          <div class="text-base font-semibold text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>Theapka</span>
            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">Digital</span>
          </div>
          <div class="text-[10px] text-stone-500 uppercase tracking-widest -mt-0.5">ធៀបការឌីជីថល</div>
        </div>
      </router-link>

      <div class="hidden items-center gap-1 md:flex bg-stone-200/50 p-1 rounded-full">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-4 py-1.5 text-xs font-medium transition-all"
          :class="isActive(item.to) ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
        >
          {{ item.label }}
        </router-link>
      </div>

      <div class="hidden md:flex items-center gap-3">
        <router-link
          to="/dashboard"
          class="text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5"
        >
          Host Portal
        </router-link>
        <Button to="/create" variant="primary" size="sm">
          + Create Invitation
        </Button>
      </div>

      <button
        class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-300 bg-white text-stone-700 md:hidden shadow-sm"
        @click="isMenuOpen = !isMenuOpen"
        aria-label="Toggle menu"
      >
        <component :is="isMenuOpen ? X : Menu" class="h-4 w-4" />
      </button>
    </nav>

    <!-- Mobile Drawer Menu -->
    <div v-if="isMenuOpen" class="border-t border-stone-200 bg-white/95 backdrop-blur-md md:hidden animate-in fade-in">
      <div class="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-4">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="rounded-2xl px-4 py-2.5 text-xs font-medium transition"
          :class="isActive(item.to) ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
        <div class="pt-2 border-t border-stone-100 mt-1">
          <Button to="/create" variant="primary" class="w-full justify-center text-xs" @click="isMenuOpen = false">
            + Create Invitation
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>
