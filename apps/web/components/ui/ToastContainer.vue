<script setup lang="ts">
    import { Check, Info, X } from "lucide-vue-next";

    const { toasts } = useToast();

    const iconMap = { success: Check, error: X, info: Info };
    const colorMap = {
        success:
            "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300",
    };
    const iconColorMap = {
        success: "text-green-500 dark:text-green-400",
        error: "text-red-500 dark:text-red-400",
        info: "text-blue-500 dark:text-blue-400",
    };
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-8 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-8 opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium min-w-[280px] max-w-[400px]"
          :class="colorMap[toast.type]"
        >
          <component
            :is="iconMap[toast.type]"
            :size="16"
            class="shrink-0"
            :class="iconColorMap[toast.type]"
          />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
