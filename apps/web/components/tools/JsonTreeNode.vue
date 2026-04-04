<script setup lang="ts">
    import { ChevronDown, ChevronRight } from "lucide-vue-next";
    import type { TreeNode } from "~/composables/useJsonFormatter";

    const props = defineProps<{
        node: TreeNode;
        isRoot?: boolean;
    }>();

    const emit = defineEmits<{
        toggle: [node: TreeNode];
    }>();

    const isExpandable = computed(
        () => props.node.type === "object" || props.node.type === "array",
    );

    const valueColorClass = computed(
        () =>
            ({
                string: "text-green-600 dark:text-green-400",
                number: "text-blue-600 dark:text-blue-400",
                boolean: "text-purple-600 dark:text-purple-400",
                null: "text-content-muted",
                object: "text-content-tertiary",
                array: "text-content-tertiary",
            })[props.node.type],
    );

    const preview = computed(() => {
        const node = props.node;
        if (node.type === "string") return `"${String(node.value)}"`;
        if (node.type === "null") return "null";
        if (node.type === "object") {
            const count = node.children?.length ?? 0;
            return `{ ${count} ${count === 1 ? "key" : "keys"} }`;
        }
        if (node.type === "array") {
            const count = node.children?.length ?? 0;
            return `[ ${count} ${count === 1 ? "item" : "items"} ]`;
        }
        return String(node.value);
    });

    function onToggle(node: TreeNode) {
        emit("toggle", node);
    }
</script>

<template>
  <div>
    <!-- Current node line -->
    <div
      class="flex items-center gap-1 py-0.5 rounded px-1 -mx-1"
      :class="isExpandable ? 'cursor-pointer hover:bg-surface-secondary' : ''"
      @click="isExpandable ? onToggle(node) : undefined"
    >
      <!-- Expand/collapse arrow -->
      <template v-if="isExpandable">
        <ChevronDown v-if="node.expanded" :size="14" class="shrink-0 text-content-muted" />
        <ChevronRight v-else :size="14" class="shrink-0 text-content-muted" />
      </template>
      <span v-else class="w-3.5 shrink-0 inline-block" />

      <!-- Key label -->
      <template v-if="!isRoot && node.key">
        <span class="text-brand-accent">"{{ node.key }}"</span>
        <span class="text-content-muted mx-1">:</span>
      </template>

      <!-- Value or preview -->
      <template v-if="!isExpandable || !node.expanded">
        <span :class="valueColorClass">{{ preview }}</span>
      </template>
      <template v-else>
        <span class="text-content-muted">{{ node.type === 'object' ? '{' : '[' }}</span>
      </template>
    </div>

    <!-- Expanded children -->
    <div
      v-if="isExpandable && node.expanded && node.children"
      class="pl-5 border-l border-divider ml-1.5"
    >
      <ToolsJsonTreeNode
        v-for="(child, idx) in node.children"
        :key="idx"
        :node="child"
        @toggle="onToggle"
      />
      <div class="text-content-muted pl-0">
        {{ node.type === 'object' ? '}' : ']' }}
      </div>
    </div>
  </div>
</template>
