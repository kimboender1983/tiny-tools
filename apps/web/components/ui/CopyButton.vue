<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';

const props = defineProps<{
  text: string;
  label?: string;
}>();

const copied = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = props.text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      copied.value = false;
    }, 1500);
  }
}

onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<template>
  <button
    type="button"
    class="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    :aria-label="copied ? 'Copied!' : (label ?? 'Copy to clipboard')"
    @click="copy"
  >
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="scale-50 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-50 opacity-0"
      mode="out-in"
    >
      <Check v-if="copied" :size="16" class="text-green-500" />
      <Copy v-else :size="16" />
    </Transition>

    <span v-if="label && !copied">{{ label }}</span>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <span
        v-if="copied"
        class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
      >
        Copied!
      </span>
    </Transition>
  </button>
</template>
