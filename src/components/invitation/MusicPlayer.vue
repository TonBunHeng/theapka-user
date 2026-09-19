<script setup>
import { ref, onUnmounted } from 'vue'
import { Music4, VolumeX } from 'lucide-vue-next'

const isPlaying = ref(false)
let audioCtx = null
let melodyInterval = null

// Gentle romantic pentatonic notes (Hz) for wedding / celebration ambience
const notes = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
]

const pattern = [0, 2, 4, 7, 5, 4, 2, 0, 1, 3, 5, 7, 6, 4, 2, 1]
let stepIndex = 0

function playChimeNote(freq) {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime)

  // Gentle bell/chime envelope
  gain.gain.setValueAtTime(0.001, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2)

  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + 1.2)
}

function startMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  isPlaying.value = true
  stepIndex = 0

  playChimeNote(notes[pattern[0]])
  melodyInterval = setInterval(() => {
    stepIndex = (stepIndex + 1) % pattern.length
    const noteIdx = pattern[stepIndex]
    playChimeNote(notes[noteIdx])
  }, 480)
}

function stopMusic() {
  isPlaying.value = false
  if (melodyInterval) {
    clearInterval(melodyInterval)
    melodyInterval = null
  }
}

function toggleMusic() {
  if (isPlaying.value) {
    stopMusic()
  } else {
    startMusic()
  }
}

onUnmounted(() => {
  stopMusic()
  if (audioCtx) {
    audioCtx.close().catch(() => {})
  }
})
</script>

<template>
  <div class="fixed bottom-6 left-6 z-40">
    <button
      @click="toggleMusic"
      class="group flex items-center gap-2.5 rounded-full border border-stone-200/80 bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
      :class="isPlaying ? 'border-amber-400/80 text-amber-900 shadow-amber-500/10' : 'text-stone-700'"
      :title="isPlaying ? 'Pause Background Music' : 'Play Background Music'"
      aria-label="Toggle background music"
    >
      <span class="text-base" :class="isPlaying ? 'animate-bounce' : ''">
        <Music4 v-if="isPlaying" class="h-4 w-4" />
        <VolumeX v-else class="h-4 w-4" />
      </span>

      <!-- Animated audio wave bars -->
      <div v-if="isPlaying" class="flex h-3.5 items-end gap-0.5">
        <span class="w-1 bg-amber-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
        <span class="w-1 bg-amber-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
        <span class="w-1 bg-amber-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3.5" />
        <span class="w-1 bg-amber-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
      </div>

      <span class="text-xs font-medium tracking-wide">
        {{ isPlaying ? 'Playing Ambience' : 'Play Ambience' }}
      </span>
    </button>
  </div>
</template>

