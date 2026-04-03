<script setup lang="ts">
import { X, Search } from 'lucide-vue-next';
import * as icons from 'lucide-vue-next';

const model = defineModel<string>({ required: true });

defineProps<{
  label?: string;
}>();

const open = ref(false);
const search = ref('');

// Curated list of useful icons for categories
const ICON_NAMES = [
  'Braces', 'Code', 'FileCode', 'FileJson', 'Terminal',
  'GitCompare', 'GitBranch', 'GitMerge', 'GitPullRequest',
  'KeyRound', 'Lock', 'Shield', 'ShieldCheck', 'Fingerprint',
  'Image', 'ImageDown', 'Camera', 'Palette', 'Paintbrush',
  'Type', 'AlignLeft', 'FileText', 'BookOpen', 'Newspaper',
  'Globe', 'Link', 'ExternalLink', 'Share2', 'Rss',
  'Database', 'Server', 'Cloud', 'CloudUpload', 'HardDrive',
  'Cpu', 'Zap', 'Activity', 'BarChart3', 'PieChart',
  'Calculator', 'Hash', 'Binary', 'Regex', 'Variable',
  'Search', 'Filter', 'SlidersHorizontal', 'Settings', 'Wrench',
  'Clock', 'Timer', 'Calendar', 'CalendarDays',
  'Download', 'Upload', 'FolderOpen', 'Archive', 'Package',
  'Layers', 'Layout', 'Grid3X3', 'Table', 'Columns3',
  'Monitor', 'Smartphone', 'Tablet', 'Laptop',
  'Wifi', 'Bluetooth', 'Radio', 'Antenna',
  'Mail', 'MessageSquare', 'Bell', 'Megaphone',
  'Users', 'User', 'UserCheck', 'UserPlus',
  'Heart', 'Star', 'Bookmark', 'Flag', 'Tag',
  'Map', 'MapPin', 'Navigation', 'Compass',
  'Music', 'Video', 'Headphones', 'Mic',
  'Sun', 'Moon', 'CloudSun', 'Thermometer',
  'Scissors', 'Eraser', 'PenTool', 'Highlighter',
  'Rocket', 'Flame', 'Sparkles', 'Wand2',
  'Box', 'Boxes', 'Puzzle', 'Component',
  'CircleDot', 'Crosshair', 'Target', 'Eye',
  'ArrowRight', 'ArrowUpRight', 'ChevronRight', 'MoveRight',
];

const filteredIcons = computed(() => {
  if (!search.value) return ICON_NAMES;
  const q = search.value.toLowerCase();
  return ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
});

function getIcon(name: string) {
  return (icons as Record<string, unknown>)[name] ?? null;
}

function select(name: string) {
  model.value = name;
  open.value = false;
}

function clear() {
  model.value = '';
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-xs font-medium text-content-muted mb-1">
      {{ label }}
    </label>

    <!-- Selected icon preview -->
    <div v-if="model" class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border bg-white text-sm text-content hover:border-brand-300 transition-colors"
        @click="open = true"
      >
        <component :is="getIcon(model)" v-if="getIcon(model)" :size="16" />
        <span class="font-mono text-xs">{{ model }}</span>
      </button>
      <button
        type="button"
        class="p-1 text-gray-400 hover:text-red-500 transition-colors"
        @click="clear"
      >
        <X :size="14" />
      </button>
    </div>

    <button
      v-else
      type="button"
      class="px-3 py-1.5 text-xs font-medium rounded-lg border border-dashed border-surface-border text-content-muted hover:border-brand-300 hover:text-brand-500 transition-colors"
      @click="open = true"
    >
      Select icon
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="open = false"
        >
          <div class="bg-surface border border-surface-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-surface-border">
              <h3 class="text-sm font-semibold text-content">Select Icon</h3>
              <button
                type="button"
                class="p-1 text-content-muted hover:text-content-secondary transition-colors"
                @click="open = false"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Search -->
            <div class="px-4 py-3 border-b border-surface-border">
              <div class="relative">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search icons..."
                  class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <!-- Grid -->
            <div class="flex-1 overflow-auto p-4">
              <div v-if="filteredIcons.length === 0" class="text-center py-8 text-sm text-content-muted">
                No icons match "{{ search }}"
              </div>
              <div v-else class="grid grid-cols-8 gap-1">
                <button
                  v-for="name in filteredIcons"
                  :key="name"
                  type="button"
                  class="flex flex-col items-center justify-center p-2 rounded-lg transition-colors group"
                  :class="model === name
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-content-tertiary hover:bg-surface-secondary'"
                  :title="name"
                  @click="select(name)"
                >
                  <component :is="getIcon(name)" v-if="getIcon(name)" :size="20" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
