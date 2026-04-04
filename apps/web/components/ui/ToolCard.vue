<script setup lang="ts">
    import type { IToolMeta } from "@tiny-tools/shared";
    import * as icons from "lucide-vue-next";
    import { ArrowRight } from "lucide-vue-next";

    const props = defineProps<{
        tool: IToolMeta;
        index?: number;
    }>();

    const iconComponent = computed(() => {
        const icon = (icons as Record<string, unknown>)[props.tool.icon];
        return icon ?? null;
    });

    const entranceDelay = computed(() => (props.index != null ? `${props.index * 60}ms` : "0ms"));
</script>

<template>
  <NuxtLink
    :to="`/tools/${tool.slug}`"
    class="tool-card group relative flex flex-col p-5 h-full card-enter"
    :style="{ animationDelay: entranceDelay }"
  >
    <!-- Gradient border overlay -->
    <div class="gradient-border" />

    <div class="flex items-start gap-3.5 mb-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-accent shrink-0 transition-all duration-300 group-hover:bg-brand-100 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--color-brand-500),0.15)]">
        <component :is="iconComponent" v-if="iconComponent" :size="20" />
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors truncate">
          {{ tool.name }}
        </h3>
        <span class="inline-block mt-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-surface-secondary text-content-muted">
          {{ tool.category }}
        </span>
      </div>
    </div>

    <p class="text-sm text-content-tertiary line-clamp-2 flex-1">
      {{ tool.description }}
    </p>

    <div class="mt-4 flex items-center gap-1 text-sm font-medium text-brand-accent">
      Use tool
      <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
    </div>
  </NuxtLink>
</template>

<style scoped>
/* Gradient border that fades in on hover */
.gradient-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--gradient-border);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  opacity: 0;
  transition: opacity 0.25s ease-out;
  pointer-events: none;
}

.tool-card:hover .gradient-border {
  opacity: 1;
}

/* Staggered card entrance */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: card-enter 0.45s ease-out both;
}
</style>
