<script setup lang="ts">
    import { AlertCircle, Send, X } from "lucide-vue-next";

    const props = defineProps<{
        slug: string;
        postTitle: string;
    }>();

    const api = useApi();
    const open = ref(false);
    const message = ref("");
    const email = ref("");
    const submitting = ref(false);
    const submitted = ref(false);
    const error = ref("");

    function toggle() {
        open.value = !open.value;
        if (!open.value) {
            message.value = "";
            email.value = "";
            error.value = "";
        }
    }

    async function submit() {
        if (!message.value.trim()) {
            error.value = "Please describe what's wrong.";
            return;
        }
        submitting.value = true;
        error.value = "";

        try {
            await api.post(`/content/blog/${props.slug}/feedback`, {
                message: message.value.trim(),
                email: email.value.trim() || undefined,
            });
            submitted.value = true;
            open.value = false;
            message.value = "";
            email.value = "";
        } catch {
            error.value = "Something went wrong. Please try again.";
        } finally {
            submitting.value = false;
        }
    }
</script>

<template>
  <div class="mt-3 flex flex-col items-center">
    <!-- Trigger link -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <p v-if="submitted" class="text-xs text-green-600 dark:text-green-400">
        Got it — thanks for letting me know!
      </p>
      <button
        v-else
        class="inline-flex items-center gap-1.5 text-xs text-content-faint hover:text-content-muted transition-colors underline underline-offset-2 decoration-dotted"
        @click="toggle"
      >
        <AlertCircle :size="12" />
        {{ open ? 'Never mind' : 'Seeing something wrong or off? Let me know' }}
      </button>
    </Transition>

    <!-- Feedback form -->
    <Transition
      enter-active-class="transition-all duration-200 overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 overflow-hidden"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <form
        v-if="open"
        class="mt-4 w-full max-w-md rounded-xl border border-surface-border bg-surface p-4 space-y-3"
        @submit.prevent="submit"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-content">Report an issue</p>
          <button
            type="button"
            class="text-content-faint hover:text-content-muted transition-colors"
            @click="toggle"
          >
            <X :size="16" />
          </button>
        </div>

        <p class="text-xs text-content-muted">
          Reporting on: <span class="font-medium text-content-secondary">{{ postTitle }}</span>
        </p>

        <textarea
          v-model="message"
          rows="3"
          placeholder="What's wrong or off? Be as specific as you'd like."
          class="input-field w-full resize-none text-sm"
          :disabled="submitting"
        />

        <input
          v-model="email"
          type="email"
          placeholder="Your email (optional — for a follow-up)"
          class="input-field w-full text-sm"
          :disabled="submitting"
        />

        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          <Send :size="14" />
          {{ submitting ? 'Sending…' : 'Send feedback' }}
        </button>
      </form>
    </Transition>
  </div>
</template>
