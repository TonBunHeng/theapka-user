<script setup>
import { ref, computed } from 'vue'
import { Copy, Link2, MessageCircle, Send, Share2, X, ArrowUpRight } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Share Invitation' },
  eventUrl: { type: String, default: '' },
  eventTitle: { type: String, default: 'You are cordially invited!' },
})

const emit = defineEmits(['update:modelValue'])
const { showToast } = useToast()

const activeTab = ref('link') // 'link' | 'qr'
const copied = ref(false)

const currentUrl = computed(() => {
  if (props.eventUrl) return props.eventUrl
  if (typeof window !== 'undefined') return window.location.href
  return 'https://theapka.digital'
})

const qrCodeUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl.value)}`
})

const copyLink = async () => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(currentUrl.value)
      copied.value = true
      showToast('Invitation link copied to clipboard!')
      setTimeout(() => {
        copied.value = false
      }, 2500)
    }
  } catch (err) {
    showToast('Failed to copy link. Please copy manually.', 'error')
  }
}

const shareNative = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.eventTitle,
        text: `You're invited to ${props.eventTitle}! View the invitation details here:`,
        url: currentUrl.value,
      })
    } catch (err) {
      // ignore user cancel
    }
  } else {
    copyLink()
  }
}

const shareTelegram = () => {
  const text = encodeURIComponent(`You're invited to ${props.eventTitle}! View the invitation details:`)
  const url = encodeURIComponent(currentUrl.value)
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
}

const shareWhatsApp = () => {
  const text = encodeURIComponent(`You're invited to ${props.eventTitle}! View invitation: ${currentUrl.value}`)
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
}

const shareFacebook = () => {
  const url = encodeURIComponent(currentUrl.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm transition-opacity"
      @click.self="close"
    >
      <div class="w-full max-w-md rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 transition-all duration-200 animate-in fade-in zoom-in-95">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-stone-900">{{ title }}</h3>
            <p class="text-xs text-stone-500 mt-1">Send this special invitation to your loved ones</p>
          </div>
          <button
            @click="close"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
            aria-label="Close"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="mb-5 flex rounded-full bg-stone-100 p-1">
          <button
            @click="activeTab = 'link'"
            class="flex-1 rounded-full py-2 text-xs font-medium transition"
            :class="activeTab === 'link' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
          >
            Direct Link
          </button>
          <button
            @click="activeTab = 'qr'"
            class="flex-1 rounded-full py-2 text-xs font-medium transition"
            :class="activeTab === 'qr' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
          >
            Scan QR Code
          </button>
        </div>

        <!-- Link & Social Tab -->
        <div v-if="activeTab === 'link'" class="space-y-4">
          <div class="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-2 pl-3">
            <Link2 class="h-4 w-4 text-stone-400" />
            <input
              type="text"
              readonly
              :value="currentUrl"
              class="flex-1 bg-transparent text-xs text-stone-700 outline-none truncate"
            />
            <button
              @click="copyLink"
              class="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition"
              :class="copied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'"
            >
              <Copy v-if="!copied" class="h-3.5 w-3.5" />
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              @click="shareTelegram"
              class="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-3 text-xs font-medium text-stone-800 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition"
            >
              <Send class="h-4 w-4 text-sky-500" />
              <span>Telegram</span>
            </button>

            <button
              @click="shareWhatsApp"
              class="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-3 text-xs font-medium text-stone-800 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition"
            >
              <MessageCircle class="h-4 w-4 text-emerald-500" />
              <span>WhatsApp</span>
            </button>

            <button
              @click="shareFacebook"
              class="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-3 text-xs font-medium text-stone-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
            >
              <span class="text-base font-bold text-blue-600">f</span>
              <span>Facebook</span>
            </button>

            <button
              @click="shareNative"
              class="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-3 text-xs font-medium text-stone-800 hover:bg-stone-100 transition"
            >
              <Share2 class="h-4 w-4" />
              <span>More Options</span>
            </button>
          </div>
        </div>

        <!-- QR Code Tab -->
        <div v-else class="flex flex-col items-center justify-center py-2 text-center">
          <div class="p-3 bg-white border-2 border-stone-200 rounded-3xl shadow-sm mb-3">
            <img :src="qrCodeUrl" alt="Invitation QR code" class="w-48 h-48 rounded-xl object-contain" />
          </div>
          <p class="text-xs text-stone-600 max-w-xs">
            Show this QR code to guests or save it to print on cards for instant scanning!
          </p>
          <button
            @click="copyLink"
            class="mt-4 rounded-full border border-stone-200 px-5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            {{ copied ? 'Link Copied!' : 'Copy Link Instead' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
