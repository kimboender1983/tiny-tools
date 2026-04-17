<script setup lang="ts">
    import { Mail, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const items = ref<Awaited<ReturnType<typeof cms.blogFeedback.list>>["items"]>([]);
    const total = ref(0);
    const totalPages = ref(1);
    const page = ref(1);
    const postSlugFilter = ref("");
    const deleteConfirmId = ref<string | null>(null);
    const expanded = ref<Set<string>>(new Set());

    async function load() {
        loading.value = true;
        error.value = "";
        try {
            const res = await cms.blogFeedback.list({
                page: page.value,
                limit: 25,
                postSlug: postSlugFilter.value || undefined,
            });
            items.value = res.items;
            total.value = res.total;
            totalPages.value = res.totalPages;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load feedback.";
        } finally {
            loading.value = false;
        }
    }

    let filterTimeout: ReturnType<typeof setTimeout>;
    function onFilterChange() {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            page.value = 1;
            load();
        }, 300);
    }

    async function deleteFeedback(id: string) {
        try {
            await cms.blogFeedback.delete(id);
            deleteConfirmId.value = null;
            items.value = items.value.filter((i) => i._id !== id);
            total.value--;
            toast.success("Feedback deleted");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete.");
        }
    }

    function toggleExpand(id: string) {
        const s = new Set(expanded.value);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        expanded.value = s;
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    onMounted(load);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-content">Blog Feedback</h1>
        <p class="text-sm text-content-muted mt-0.5">Reports submitted by readers</p>
      </div>
      <span v-if="!loading" class="text-sm text-content-muted">{{ total }} total</span>
    </div>

    <!-- Filter -->
    <div class="mb-4">
      <input
        v-model="postSlugFilter"
        type="text"
        placeholder="Filter by post slug…"
        class="input-field w-full max-w-xs text-sm"
        @input="onFilterChange"
      />
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-content-muted py-12 text-center">Loading…</div>

    <template v-else>
      <div v-if="items.length === 0" class="py-12 text-center text-sm text-content-muted">
        No feedback yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in items"
          :key="item._id"
          class="bg-surface border border-surface-border rounded-xl overflow-hidden"
        >
          <!-- Header row -->
          <div
            class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-secondary transition-colors"
            @click="toggleExpand(item._id)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-xs text-brand-500 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">
                  {{ item.postSlug }}
                </span>
                <span v-if="item.email" class="inline-flex items-center gap-1 text-xs text-content-muted">
                  <Mail :size="11" />
                  {{ item.email }}
                </span>
                <span class="text-xs text-content-faint ml-auto shrink-0">{{ formatDate(item.createdAt) }}</span>
              </div>
              <p
                class="mt-1.5 text-sm text-content-secondary"
                :class="expanded.has(item._id) ? '' : 'line-clamp-2'"
              >
                {{ item.message }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0 ml-2" @click.stop>
              <template v-if="deleteConfirmId !== item._id">
                <button
                  class="p-1.5 text-content-faint hover:text-red-500 transition-colors rounded"
                  title="Delete"
                  @click="deleteConfirmId = item._id"
                >
                  <Trash2 :size="15" />
                </button>
              </template>
              <template v-else>
                <button
                  class="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  @click="deleteFeedback(item._id)"
                >
                  Delete
                </button>
                <button
                  class="px-2 py-1 text-xs rounded border border-surface-border text-content-tertiary hover:bg-surface-secondary"
                  @click="deleteConfirmId = null"
                >
                  Cancel
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex items-center gap-2 justify-center">
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-surface-border text-content-tertiary hover:bg-surface-secondary disabled:opacity-40 transition-colors"
          :disabled="page === 1"
          @click="page--; load()"
        >
          Previous
        </button>
        <span class="text-sm text-content-muted">{{ page }} / {{ totalPages }}</span>
        <button
          class="px-3 py-1.5 text-sm rounded-lg border border-surface-border text-content-tertiary hover:bg-surface-secondary disabled:opacity-40 transition-colors"
          :disabled="page === totalPages"
          @click="page++; load()"
        >
          Next
        </button>
      </div>
    </template>
  </div>
</template>
