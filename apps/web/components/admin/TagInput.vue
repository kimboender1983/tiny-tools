<script setup lang="ts">
    import { X } from "lucide-vue-next";

    const props = defineProps<{
        modelValue: string[];
        suggestions: string[];
    }>();

    const emit = defineEmits<{
        "update:modelValue": [value: string[]];
    }>();

    const input = ref("");
    const showDropdown = ref(false);
    const inputEl = ref<HTMLInputElement | null>(null);

    const filtered = computed(() => {
        const q = input.value.toLowerCase().trim();
        if (!q) return props.suggestions.filter((t) => !props.modelValue.includes(t));
        return props.suggestions.filter(
            (t) => t.toLowerCase().includes(q) && !props.modelValue.includes(t),
        );
    });

    function addTag(tag: string) {
        const trimmed = tag.trim().toLowerCase();
        if (!trimmed || props.modelValue.includes(trimmed)) return;
        emit("update:modelValue", [...props.modelValue, trimmed]);
        input.value = "";
        showDropdown.value = false;
        inputEl.value?.focus();
    }

    function removeTag(tag: string) {
        emit(
            "update:modelValue",
            props.modelValue.filter((t) => t !== tag),
        );
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (input.value.trim()) addTag(input.value);
        } else if (e.key === "Backspace" && !input.value && props.modelValue.length > 0) {
            removeTag(props.modelValue[props.modelValue.length - 1]);
        } else if (e.key === "Escape") {
            showDropdown.value = false;
        }
    }

    function onFocus() {
        showDropdown.value = true;
    }

    function onBlur() {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            showDropdown.value = false;
            if (input.value.trim()) addTag(input.value);
        }, 150);
    }
</script>

<template>
  <div class="relative">
    <div
      class="flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 cursor-text"
      @click="inputEl?.focus()"
    >
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-accent text-xs font-medium"
      >
        {{ tag }}
        <button
          type="button"
          class="hover:text-red-500 transition-colors"
          @click.stop="removeTag(tag)"
        >
          <X :size="12" />
        </button>
      </span>
      <input
        ref="inputEl"
        v-model="input"
        type="text"
        class="flex-1 min-w-[120px] py-0.5 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400"
        placeholder="Type to add tags..."
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <!-- Suggestions dropdown -->
    <div
      v-if="showDropdown && filtered.length > 0"
      class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      <button
        v-for="tag in filtered"
        :key="tag"
        type="button"
        class="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-accent transition-colors"
        @mousedown.prevent="addTag(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>
