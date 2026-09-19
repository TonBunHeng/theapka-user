<script setup>
import { ref } from 'vue'
import { Check, Copy, Gift, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  qrDetails: {
    type: Object,
    default: () => ({
      bankName: 'ABA Bank',
      accountName: 'SOK & DARA',
      accountNumber: '001 234 567',
      qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SOK_DARA_001234567',
    }),
  },
  hosts: { type: String, default: 'The Couple' },
})

const emit = defineEmits(['update:modelValue'])
const { showToast } = useToast()
const copied = ref(false)

const copyAccountNumber = async () => {
  if (!props.qrDetails?.accountNumber) return
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(props.qrDetails.accountNumber.replace(/\s+/g, ''))
      copied.value = true
      showToast('Account number copied to clipboard!')
      setTimeout(() => {
        copied.value = false
      }, 2500)
    }
  } catch (err) {
    showToast('Failed to copy account number', 'error')
  }
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
      <div class="w-full max-w-sm rounded-[2.5rem] bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 text-center animate-in fade-in zoom-in-95">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Gift class="h-5 w-5 text-amber-700" />
            <h3 class="text-lg font-semibold text-stone-900">Digital Envelope</h3>
          </div>
          <button
            @click="close"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
            aria-label="Close gift envelope"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <p class="text-xs text-stone-600 mb-5 leading-relaxed">
          Your warm blessings and presence are the greatest gifts. If you wish to send a traditional wedding blessing or gift, you may transfer below:
        </p>

        <div class="mx-auto inline-block rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-3 border border-amber-200/80 shadow-inner mb-4">
          <img
            :src="qrDetails.qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDetails.accountNumber || '001234567')}`"
            alt="KHQR Code"
            class="w-44 h-44 rounded-xl object-contain mx-auto bg-white p-2 border border-stone-100"
          />
        </div>

        <div class="space-y-2 rounded-2xl bg-stone-50 p-4 text-xs text-stone-700 border border-stone-100 mb-4">
          <div class="flex justify-between items-center py-0.5">
            <span class="text-stone-500 uppercase tracking-wider text-[10px]">Bank / Wallet</span>
            <span class="font-semibold text-stone-900">{{ qrDetails.bankName || 'ABA Bank' }}</span>
          </div>
          <div class="flex justify-between items-center py-0.5">
            <span class="text-stone-500 uppercase tracking-wider text-[10px]">Account Name</span>
            <span class="font-semibold text-stone-900 uppercase">{{ qrDetails.accountName || hosts }}</span>
          </div>
          <div class="flex justify-between items-center py-0.5">
            <span class="text-stone-500 uppercase tracking-wider text-[10px]">Account No.</span>
            <span class="font-mono font-semibold text-stone-900">{{ qrDetails.accountNumber || '001 234 567' }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            @click="copyAccountNumber"
            class="w-full rounded-full py-2.5 px-4 text-xs font-medium text-white transition flex items-center justify-center gap-2"
            :class="copied ? 'bg-emerald-600' : 'bg-stone-900 hover:bg-stone-800'"
          >
            <Check v-if="copied" class="h-3.5 w-3.5" />
            <Copy v-else class="h-3.5 w-3.5" />
            <span>{{ copied ? 'Account Number Copied' : 'Copy Account Number' }}</span>
          </button>
          <button
            @click="close"
            class="w-full rounded-full py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

