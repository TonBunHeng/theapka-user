<template>
  <footer class="border-t border-stone-200 bg-stone-100/80">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
              T
            </div>
            <div>
              <p class="text-lg font-semibold text-stone-900">Theapka Digital</p>
              <p class="text-sm text-stone-600">Modern event invitations</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Explore</h3>
          <ul class="space-y-3 text-sm text-stone-700">
            <li><router-link to="/" class="transition hover:text-stone-900">Home</router-link></li>
            <li><router-link to="/create" class="transition hover:text-stone-900">Create Invitation</router-link></li>
            <li><router-link to="/dashboard" class="transition hover:text-stone-900">Dashboard</router-link></li>
          </ul>
        </div>

        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Contact</h3>
          <ul class="space-y-3 text-sm text-stone-700">
            <li>hello@theapka.digital</li>
            <li>+855 12 345 678</li>
            <li>Siem Reap, Cambodia</li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-stone-200 pt-6 text-center text-sm text-stone-500">
        © 2026 Theapka Digital. Crafted for beautiful celebrations.
      </div>
    </div>
  </footer>
</template>
