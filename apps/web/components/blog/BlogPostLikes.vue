<script setup lang="ts">
    import { ThumbsDown, ThumbsUp } from "lucide-vue-next";

    const props = defineProps<{
        slug: string;
        initialLikes: number;
        initialDislikes: number;
    }>();

    const api = useApi();
    const storageKey = computed(() => `vote_${props.slug}`);

    const likes = ref(props.initialLikes);
    const dislikes = ref(props.initialDislikes);
    const currentVote = ref<"up" | "down" | null>(null);
    const loading = ref(false);
    const justVoted = ref(false);

    onMounted(() => {
        const stored = localStorage.getItem(storageKey.value);
        if (stored === "up" || stored === "down") {
            currentVote.value = stored;
        }
    });

    async function react(vote: "up" | "down") {
        if (loading.value) return;
        loading.value = true;

        const prev = currentVote.value;
        const calls: Promise<unknown>[] = [];

        // Optimistic update
        if (prev === vote) {
            // Toggle off
            if (vote === "up") likes.value--;
            else dislikes.value--;
            currentVote.value = null;
            localStorage.removeItem(storageKey.value);
            calls.push(api.post(`/content/blog/${props.slug}/react`, { vote, action: "remove" }));
        } else {
            // Remove previous vote if exists
            if (prev) {
                if (prev === "up") likes.value--;
                else dislikes.value--;
                calls.push(
                    api.post(`/content/blog/${props.slug}/react`, { vote: prev, action: "remove" }),
                );
            }
            // Add new vote
            if (vote === "up") likes.value++;
            else dislikes.value++;
            currentVote.value = vote;
            localStorage.setItem(storageKey.value, vote);
            calls.push(api.post(`/content/blog/${props.slug}/react`, { vote, action: "add" }));

            justVoted.value = true;
            setTimeout(() => (justVoted.value = false), 2500);
        }

        try {
            await Promise.all(calls);
        } catch {
            // silently fail — optimistic counts are shown
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
  <div class="mt-10 pt-8 border-t border-surface-border flex flex-col items-center gap-4">
    <p class="text-sm font-medium text-content-secondary">Was this helpful?</p>

    <div class="flex items-center gap-3">
      <!-- Thumbs up -->
      <button
        :disabled="loading"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-150 disabled:opacity-50',
          currentVote === 'up'
            ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
            : 'border-surface-border bg-surface text-content-muted hover:border-brand-300 hover:text-brand-500',
        ]"
        @click="react('up')"
      >
        <ThumbsUp :size="15" />
        <span>{{ likes }}</span>
      </button>

      <!-- Thumbs down -->
      <button
        :disabled="loading"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-150 disabled:opacity-50',
          currentVote === 'down'
            ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
            : 'border-surface-border bg-surface text-content-muted hover:border-red-300 hover:text-red-500',
        ]"
        @click="react('down')"
      >
        <ThumbsDown :size="15" />
        <span>{{ dislikes }}</span>
      </button>
    </div>

    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <p v-if="justVoted" class="text-xs text-content-muted">
        Thanks for the feedback!
      </p>
    </Transition>
  </div>
</template>
