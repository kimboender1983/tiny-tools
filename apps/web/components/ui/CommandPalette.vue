<script setup lang="ts">
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-vue-next';
import * as icons from 'lucide-vue-next';
import { TOOLS } from '@tiny-tools/shared';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const filteredTools = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(q)),
  );
});

function getIcon(name: string) {
  return (icons as Record<string, unknown>)[name] ?? null;
}

function open() {
  isOpen.value = true;
  query.value = '';
  activeIndex.value = 0;
  nextTick(() => inputRef.value?.focus());
}

function close() {
  isOpen.value = false;
}

function selectTool(slug: string) {
  close();
  router.push(`/${slug}`);
}

function onKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = Math.min(activeIndex.value + 1, filteredTools.value.length - 1);
      scrollActiveIntoView();
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
      scrollActiveIntoView();
      break;
    case 'Enter':
      e.preventDefault();
      if (filteredTools.value[activeIndex.value]) {
        selectTool(filteredTools.value[activeIndex.value].slug);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      break;
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = document.querySelector('[data-command-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  });
}

watch(query, () => {
  activeIndex.value = 0;
});

// Global keyboard shortcut
function onGlobalKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKeyDown);
});

// Expose open for external use
defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        />

        <!-- Dialog -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div
            class="relative w-full max-w-lg bg-surface dark:bg-surface-dark rounded-xl border border-surface-border dark:border-surface-dark-border shadow-2xl overflow-hidden"
            @keydown="onKeyDown"
          >
            <!-- Search input -->
            <div class="flex items-center gap-3 px-4 border-b border-surface-border dark:border-surface-dark-border">
              <Search :size="18" class="text-gray-500 dark:text-gray-500 shrink-0" />
              <input
                ref="inputRef"
                v-model="query"
                type="text"
                placeholder="Search tools..."
                class="w-full py-3.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none text-sm"
              />
              <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-surface-dark-secondary rounded border border-gray-200 dark:border-surface-dark-border shrink-0">
                ESC
              </kbd>
            </div>

            <!-- Results list -->
            <div class="max-h-72 overflow-y-auto overscroll-contain py-2">
              <div
                v-if="filteredTools.length === 0"
                class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No tools found for "{{ query }}"
              </div>

              <button
                v-for="(tool, index) in filteredTools"
                :key="tool.slug"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75"
                :class="index === activeIndex
                  ? 'bg-brand-50 dark:bg-brand-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-surface-dark-secondary'"
                :data-command-active="index === activeIndex"
                @click="selectTool(tool.slug)"
                @mouseenter="activeIndex = index"
              >
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                  :class="index === activeIndex
                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-surface-dark dark:text-gray-400'"
                >
                  <component :is="getIcon(tool.icon)" v-if="getIcon(tool.icon)" :size="16" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ tool.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ tool.description }}
                  </div>
                </div>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-surface-dark-secondary dark:text-gray-400 shrink-0">
                  {{ tool.category }}
                </span>
              </button>
            </div>

            <!-- Footer hints -->
            <div class="flex items-center gap-4 px-4 py-2.5 border-t border-surface-border dark:border-surface-dark-border text-xs text-gray-500 dark:text-gray-500">
              <span class="inline-flex items-center gap-1">
                <ArrowUp :size="12" />
                <ArrowDown :size="12" />
                navigate
              </span>
              <span class="inline-flex items-center gap-1">
                <CornerDownLeft :size="12" />
                select
              </span>
              <span class="inline-flex items-center gap-1">
                <kbd class="px-1 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-surface-dark-secondary rounded border border-gray-200 dark:border-surface-dark-border">ESC</kbd>
                close
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
