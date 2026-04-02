<script setup lang="ts">
import { Shield, BarChart3, Megaphone, X, Cookie, ChevronDown } from 'lucide-vue-next';

const {
  showBanner,
  showSettings,
  preferences,
  acceptAll,
  rejectAll,
  savePreferences,
  openSettings,
} = useCookieConsent();

const draft = reactive({
  analytics: false,
  advertising: false,
});

// Sync draft with stored prefs when settings panel opens
watch(showSettings, (open) => {
  if (open) {
    draft.analytics = preferences.value.analytics;
    draft.advertising = preferences.value.advertising;
  }
});

function handleSave() {
  savePreferences({ analytics: draft.analytics, advertising: draft.advertising });
}

const isVisible = computed(() => showBanner.value || showSettings.value);

// Trap focus & handle escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showSettings.value) {
      showSettings.value = false;
      // Re-show banner if user hasn't consented yet
      // (showBanner is readonly, but rejectAll/acceptAll handle it)
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop for settings panel -->
    <Transition name="fade">
      <div
        v-if="showSettings"
        class="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
        @click="showSettings = false"
      />
    </Transition>

    <!-- Banner / Settings panel -->
    <Transition name="consent-slide">
      <div
        v-if="isVisible"
        class="fixed bottom-0 inset-x-0 z-[999] px-4 pb-4 sm:px-6 sm:pb-6"
        role="dialog"
        aria-label="Cookie consent"
        @keydown="onKeydown"
      >
        <div class="mx-auto max-w-2xl">
          <div
            class="relative overflow-hidden rounded-2xl border border-surface-border/60 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-surface-dark-border/60 dark:bg-surface-dark/95 dark:shadow-black/40"
          >
            <!-- Subtle gradient accent along top edge -->
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

            <!-- Compact banner view -->
            <div v-if="showBanner && !showSettings" class="p-5 sm:p-6">
              <div class="flex items-start gap-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <Cookie :size="20" class="text-brand-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    We value your privacy
                  </h2>
                  <p class="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    We use cookies to improve your experience and analyse site traffic. Choose your preference below.
                  </p>
                </div>
              </div>

              <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="openSettings"
                >
                  <ChevronDown :size="14" />
                  Customise
                </button>
                <div class="flex gap-2">
                  <button
                    class="btn-secondary text-sm !px-4 !py-2"
                    @click="rejectAll"
                  >
                    Reject all
                  </button>
                  <button
                    class="btn-primary text-sm !px-5 !py-2"
                    @click="acceptAll"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            </div>

            <!-- Expanded settings view -->
            <div v-if="showSettings" class="p-5 sm:p-6">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                    <Cookie :size="20" class="text-brand-500" />
                  </div>
                  <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Cookie preferences</h2>
                </div>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  @click="showSettings = false"
                  aria-label="Close"
                >
                  <X :size="16" />
                </button>
              </div>

              <div class="space-y-3">
                <!-- Essential -->
                <div class="flex items-center gap-4 rounded-xl border border-surface-border/50 bg-gray-50/50 p-4 dark:border-surface-dark-border/50 dark:bg-white/[0.02]">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Shield :size="18" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Essential</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Required for the site to function. Always active.</p>
                  </div>
                  <div class="flex h-6 w-11 shrink-0 items-center rounded-full bg-emerald-500 px-0.5 cursor-not-allowed" aria-label="Always enabled">
                    <div class="h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>

                <!-- Analytics -->
                <label class="group flex items-center gap-4 rounded-xl border border-surface-border/50 p-4 transition-colors hover:bg-gray-50/80 dark:border-surface-dark-border/50 dark:hover:bg-white/[0.02] cursor-pointer">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <BarChart3 :size="18" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Analytics</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Help us understand how visitors use the site.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="draft.analytics"
                    class="relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200"
                    :class="draft.analytics ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'"
                    @click="draft.analytics = !draft.analytics"
                  >
                    <div
                      class="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      :class="draft.analytics ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </label>

                <!-- Advertising -->
                <label class="group flex items-center gap-4 rounded-xl border border-surface-border/50 p-4 transition-colors hover:bg-gray-50/80 dark:border-surface-dark-border/50 dark:hover:bg-white/[0.02] cursor-pointer">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <Megaphone :size="18" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Advertising</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Show personalised ads powered by Google AdSense.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="draft.advertising"
                    class="relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200"
                    :class="draft.advertising ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'"
                    @click="draft.advertising = !draft.advertising"
                  >
                    <div
                      class="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      :class="draft.advertising ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </label>
              </div>

              <div class="mt-5 flex gap-2 justify-end">
                <button
                  class="btn-secondary text-sm !px-4 !py-2"
                  @click="rejectAll"
                >
                  Reject all
                </button>
                <button
                  class="btn-primary text-sm !px-5 !py-2"
                  @click="handleSave"
                >
                  Save preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Slide-up entrance */
.consent-slide-enter-active {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}
.consent-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease;
}
.consent-slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.consent-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Backdrop fade */
.fade-enter-active { transition: opacity 0.3s ease; }
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
