<script setup>
import { useRouter } from 'vue-router'
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Sparkles,
} from 'lucide-vue-next'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import Button from '@/components/common/Button.vue'
import Countdown from '@/components/invitation/Countdown.vue'
import EventCategoryCard from '@/components/event/EventCategoryCard.vue'
import InvitationTemplateCard from '@/components/invitation/InvitationTemplateCard.vue'
import { eventCategories, invitationTemplates, features, howItWorks } from '@/data/mockData.js'
import { useEvents } from '@/composables/useEvents.js'

const router = useRouter()
const { draft } = useEvents()

const selectCategory = (categoryTitle) => {
  draft.value.type = categoryTitle
  router.push('/create')
}

const selectTemplate = (templateId) => {
  draft.value.template = templateId
  router.push('/create')
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f4ef] text-stone-900 selection:bg-amber-200">
    <Navbar />

    <main>
      <!-- Hero Section -->
      <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div class="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-700 ring-1 ring-stone-200 shadow-sm">
              <Heart class="h-4 w-4 text-amber-600" />
              <span>ធៀបការឌីជីថល • Digital Invitations</span>
            </div>
            <h1 class="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl font-serif">
              Bespoke digital invitations for your sacred celebration.
            </h1>
            <p class="mt-6 max-w-lg text-lg leading-8 text-stone-600">
              Theapka helps you design elegant wedding and celebration cards, share them instantly on Telegram & WhatsApp, and collect RSVPs with digital blessing envelopes.
            </p>

            <div class="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Button to="/create" variant="primary" size="lg">
                <Sparkles class="h-4 w-4" />
                <span>Create Invitation</span>
              </Button>
              <Button to="/preview" variant="secondary" size="lg">
                <span>View Live Demo</span>
                <ArrowUpRight class="h-4 w-4" />
              </Button>
            </div>

            <div class="mt-12 flex items-center gap-8 text-sm text-stone-600 border-t border-stone-200/80 pt-6">
              <div>
                <span class="block text-2xl font-bold text-stone-900">2,400+</span>
                <span class="text-xs text-stone-500">Invitations Sent</span>
              </div>
              <div>
                <span class="block text-2xl font-bold text-stone-900">96%</span>
                <span class="text-xs text-stone-500">RSVP Attendance</span>
              </div>
              <div>
                <span class="block text-2xl font-bold text-amber-700">4.9/5</span>
                <span class="text-xs text-stone-500">Couple Satisfaction</span>
              </div>
            </div>
          </div>

          <!-- Hero Interactive Card Preview -->
          <div class="relative">
            <div class="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-amber-200/40 via-rose-200/30 to-amber-100/30 blur-2xl" />
            <div class="relative overflow-hidden rounded-[2.5rem] border border-stone-200/90 bg-white p-4 shadow-[0_25px_80px_rgba(28,25,23,0.09)] sm:p-7">
              <div class="rounded-[2rem] bg-[#faf6f0] p-6 border border-amber-200/50">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-800">You are invited</span>
                  <span class="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-stone-700 shadow-sm border border-stone-100">Wedding Blessing</span>
                </div>

                <div class="mt-6 text-center">
                  <div class="text-xs uppercase tracking-[0.32em] text-stone-500">Sacred Union</div>
                  <h2 class="mt-2 text-3xl sm:text-4xl font-semibold text-stone-900 font-serif">Sok & Dara</h2>
                  <div class="mt-1 text-sm text-amber-800">Together with their families</div>
                  
                  <div class="mt-5 space-y-1.5 text-xs sm:text-sm text-stone-700">
                    <p class="inline-flex items-center gap-2 font-medium"><CalendarDays class="h-3.5 w-3.5" /> Saturday, 20 December 2026</p>
                    <p class="inline-flex items-center gap-2"><Clock3 class="h-3.5 w-3.5" /> 5:00 PM (Solemn Ceremony & Banquet)</p>
                    <p class="inline-flex items-center gap-2"><MapPin class="h-3.5 w-3.5" /> Sokha Siem Reap Resort, Cambodia</p>
                  </div>
                </div>

                <div class="mt-6 pt-5 border-t border-amber-200/60">
                  <div class="text-center text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-3">Live Countdown</div>
                  <Countdown :target-date="'2026-12-20T17:00:00'" />
                </div>

                <div class="mt-5 flex gap-2">
                  <router-link
                    to="/event/sok-dara-wedding"
                    class="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-2.5 text-xs font-medium text-white hover:bg-stone-800 shadow-sm transition"
                  >
                    <span>Open Live Invitation</span>
                    <ArrowUpRight class="h-3.5 w-3.5" />
                  </router-link>
                  <router-link
                    to="/create"
                    class="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
                  >
                    Use This Style
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 border-t border-stone-200/70">
        <div class="mb-12 text-center max-w-xl mx-auto">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Simple 3-Step Process</p>
          <h2 class="mt-2 text-3xl font-semibold text-stone-900 font-serif">A seamless flow for memorable celebrations</h2>
          <p class="mt-2 text-sm text-stone-600">No complicated setup. Build, customize, and distribute your wedding invitations effortlessly.</p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="item in howItWorks"
            :key="item.step"
            class="group rounded-[2.2rem] border border-stone-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div class="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 w-10 h-10 rounded-2xl flex items-center justify-center border border-amber-200/60">
              {{ item.step }}
            </div>
            <h3 class="mb-2 text-lg font-semibold text-stone-900">{{ item.title }}</h3>
            <p class="text-sm leading-relaxed text-stone-600">{{ item.text }}</p>
          </div>
        </div>
      </section>

      <!-- Templates Section -->
      <section class="bg-white py-20 border-y border-stone-200/80">
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div class="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Curated Aesthetics</p>
              <h2 class="mt-2 text-3xl font-semibold text-stone-900 font-serif">Choose an invitation style</h2>
              <p class="mt-2 text-sm text-stone-600">Every design includes mobile optimization, interactive RSVPs, and countdown timers.</p>
            </div>
            <Button to="/create" variant="primary" size="sm">
              Explore All Styles →
            </Button>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="template in invitationTemplates"
              :key="template.id"
              class="cursor-pointer"
              @click="selectTemplate(template.id)"
            >
              <InvitationTemplateCard
                :name="template.name"
                :description="template.description"
                :accent="template.accent"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Occasions / Categories -->
      <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="mb-12 text-center max-w-xl mx-auto">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Every Occasion</p>
          <h2 class="mt-2 text-3xl font-semibold text-stone-900 font-serif">Made for life's greatest milestones</h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="category in eventCategories"
            :key="category.title"
            class="cursor-pointer"
            @click="selectCategory(category.title)"
          >
            <EventCategoryCard
              :icon="category.icon"
              :title="category.title"
              :description="category.description"
            />
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="bg-[#f2ece3] py-20 border-t border-stone-200/80">
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div class="mb-12 text-center max-w-xl mx-auto">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Why Choose Theapka</p>
            <h2 class="mt-2 text-3xl font-semibold text-stone-900 font-serif">Thoughtfully engineered for modern couples</h2>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="rounded-[2.2rem] border border-stone-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm"
            >
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/50 text-amber-700">
                <Sparkles class="h-5 w-5" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-stone-900">{{ feature.title }}</h3>
              <p class="text-xs leading-relaxed text-stone-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-[3rem] bg-stone-900 px-6 py-14 text-center text-white sm:px-12 shadow-2xl">
          <div class="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div class="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
          
          <div class="relative z-10">
            <span class="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Ready to Begin?</span>
            <h2 class="mt-3 text-3xl font-semibold sm:text-5xl font-serif">Make your celebration truly unforgettable.</h2>
            <p class="mx-auto mt-4 max-w-lg text-sm text-stone-300 leading-relaxed">
              Design a digital invitation that leaves a lasting impression from the first tap to the final RSVP.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Button to="/create" variant="primary" size="lg" class="bg-white text-stone-900 hover:bg-stone-100">
                <Sparkles class="h-4 w-4" />
                <span>Create Your Invitation</span>
              </Button>
              <Button to="/dashboard" variant="secondary" size="lg" class="bg-transparent text-white ring-white/30 hover:bg-white/10">
                <span>Open Host Dashboard</span>
                <ArrowUpRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
