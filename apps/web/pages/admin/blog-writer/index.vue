<script setup lang="ts">
    import type { IBlogGeneration, ICategory, ISchedulerConfig, ITopicQueue, IWritingTone } from "@tiny-tools/shared";
    import { Bot, Check, Clock, Loader2, Play, Plus, RefreshCw, RotateCcw, Trash2, X } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const tab = ref<"generate" | "queue" | "scheduler" | "history">("generate");
    const loading = ref(true);

    // Shared data
    const tones = ref<IWritingTone[]>([]);
    const categories = ref<ICategory[]>([]);
    const topics = ref<ITopicQueue[]>([]);
    const history = ref<IBlogGeneration[]>([]);
    const scheduler = ref<ISchedulerConfig | null>(null);

    // Generate form
    const genTopic = ref("");
    const genToneId = ref("");
    const genCategoryId = ref("");
    const genType = ref("general");
    const genModel = ref("claude-sonnet-4-6");
    const generating = ref(false);

    const MODELS = [
        { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (recommended)" },
        { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5" },
        { id: "claude-sonnet-4-20250514", label: "Sonnet 4" },
        { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 (cheapest)" },
        { id: "claude-opus-4-6", label: "Opus 4.6 (best, expensive)" },
    ];
    const genResult = ref<{ postId: string } | null>(null);

    // Topic form
    const showTopicForm = ref(false);
    const newTopic = reactive({ title: "", notes: "", category: "", type: "general" as string, priority: 0 });

    async function loadAll() {
        loading.value = true;
        try {
            const [t, c, q, h, s] = await Promise.all([
                cms.blogWriter.tones.list(),
                cms.categories.list({ pageSize: 100 }),
                cms.blogWriter.topics.list(),
                cms.blogWriter.history(),
                cms.blogWriter.scheduler.get(),
            ]);
            tones.value = t;
            categories.value = c.items;
            topics.value = q;
            history.value = h;
            scheduler.value = s;
        } catch (e) {
            toast.error("Failed to load data");
        } finally {
            loading.value = false;
        }
    }

    // --- Generate ---
    async function generate() {
        if (!genTopic.value.trim()) return;
        generating.value = true;
        genResult.value = null;
        try {
            const result = await cms.blogWriter.generate({
                topic: genTopic.value,
                toneId: genToneId.value || undefined,
                categoryId: genCategoryId.value || undefined,
                type: genType.value || undefined,
                model: genModel.value || undefined,
            });
            genResult.value = result;
            toast.success("Blog post generated! Check drafts.");
            genTopic.value = "";
            await loadAll();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Generation failed");
        } finally {
            generating.value = false;
        }
    }

    // --- Topics ---
    async function addTopic() {
        if (!newTopic.title.trim()) return;
        try {
            await cms.blogWriter.topics.create({
                title: newTopic.title,
                notes: newTopic.notes || undefined,
                category: newTopic.category || undefined,
                type: newTopic.type as ITopicQueue["type"],
                priority: newTopic.priority,
            });
            newTopic.title = "";
            newTopic.notes = "";
            newTopic.category = "";
            newTopic.type = "general";
            newTopic.priority = 0;
            showTopicForm.value = false;
            toast.success("Topic added to queue");
            topics.value = await cms.blogWriter.topics.list();
        } catch {
            toast.error("Failed to add topic");
        }
    }

    async function resetTopic(id: string) {
        await cms.blogWriter.topics.reset(id);
        topics.value = await cms.blogWriter.topics.list();
    }

    async function deleteTopic(id: string) {
        await cms.blogWriter.topics.delete(id);
        topics.value = await cms.blogWriter.topics.list();
    }

    // --- Scheduler ---
    async function updateScheduler(updates: Partial<ISchedulerConfig>) {
        try {
            scheduler.value = await cms.blogWriter.scheduler.update(updates);
            toast.success("Scheduler updated");
        } catch {
            toast.error("Failed to update scheduler");
        }
    }

    function statusColor(status: string) {
        if (status === "completed" || status === "success") return "bg-green-100 text-green-700";
        if (status === "failed") return "bg-red-100 text-red-700";
        if (status === "processing") return "bg-amber-100 text-amber-700";
        return "bg-gray-100 text-gray-600";
    }

    function formatDate(d: string | Date | undefined): string {
        if (!d) return "—";
        return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    onMounted(loadAll);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <Bot :size="24" class="text-brand-500" />
        <div>
          <h1 class="text-2xl font-bold text-content">Blog Writer</h1>
          <p class="text-sm text-content-muted">AI-powered blog post generation</p>
        </div>
      </div>
      <NuxtLink
        to="/admin/blog-writer/tones"
        class="text-sm text-brand-500 hover:text-brand-600"
      >
        Manage Tones
      </NuxtLink>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-surface-border">
      <button
        v-for="t in (['generate', 'queue', 'scheduler', 'history'] as const)"
        :key="t"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px capitalize"
        :class="tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-content-muted hover:text-content'"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <div v-if="loading" class="p-8 text-center text-content-muted">Loading...</div>

    <!-- Generate Tab -->
    <div v-else-if="tab === 'generate'" class="space-y-4 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-content-secondary mb-1">Topic</label>
        <input
          v-model="genTopic"
          type="text"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          placeholder="e.g. Vite 8 + Rolldown performance improvements"
        />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Tone</label>
          <select v-model="genToneId" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
            <option value="">Default</option>
            <option v-for="t in tones" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Model</label>
          <select v-model="genModel" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
            <option v-for="m in MODELS" :key="m.id" :value="m.id">{{ m.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Category</label>
          <select v-model="genCategoryId" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
            <option value="">Claude picks</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Type</label>
          <select v-model="genType" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
            <option value="general">General</option>
            <option value="oss">Open Source</option>
            <option value="ai">AI</option>
            <option value="aff">Affiliate</option>
          </select>
        </div>
      </div>
      <button
        :disabled="generating || !genTopic.trim()"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
        @click="generate"
      >
        <Loader2 v-if="generating" :size="16" class="animate-spin" />
        <Play v-else :size="16" />
        {{ generating ? 'Generating...' : 'Generate Blog Post' }}
      </button>
      <div v-if="genResult" class="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
        Blog post created as draft.
        <NuxtLink :to="`/admin/blog/${genResult.postId}`" class="underline font-medium">Open in editor →</NuxtLink>
      </div>
    </div>

    <!-- Queue Tab -->
    <div v-else-if="tab === 'queue'">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-content-muted">Topics for the scheduler to pick from. Highest priority first.</p>
        <button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600" @click="showTopicForm = !showTopicForm">
          <Plus :size="16" /> Add Topic
        </button>
      </div>

      <!-- Add form -->
      <div v-if="showTopicForm" class="mb-4 p-4 rounded-xl border border-surface-border bg-surface-secondary space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-content-muted mb-1">Topic</label>
            <input v-model="newTopic.title" type="text" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" placeholder="e.g. Bun vs Deno vs Node in 2026" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-content-muted mb-1">Notes (optional context for Claude)</label>
            <input v-model="newTopic.notes" type="text" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" placeholder="Focus on DX comparison..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-content-muted mb-1">Type</label>
            <select v-model="newTopic.type" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
              <option value="general">General</option>
              <option value="oss">Open Source</option>
              <option value="ai">AI</option>
              <option value="aff">Affiliate</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-content-muted mb-1">Category (optional)</label>
            <select v-model="newTopic.category" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
              <option value="">Auto</option>
              <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-500 text-white hover:bg-brand-600" @click="addTopic"><Check :size="14" /> Add</button>
          <button class="px-3 py-1.5 text-sm rounded-lg border border-divider text-content-tertiary" @click="showTopicForm = false">Cancel</button>
        </div>
      </div>

      <!-- Topic list -->
      <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <div v-if="topics.length === 0" class="p-8 text-center text-sm text-content-muted">No topics in queue.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-border text-left">
              <th class="px-4 py-3 font-medium text-content-muted">Topic</th>
              <th class="px-4 py-3 font-medium text-content-muted w-20">Type</th>
              <th class="px-4 py-3 font-medium text-content-muted w-24">Status</th>
              <th class="px-4 py-3 font-medium text-content-muted w-20">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr v-for="topic in topics" :key="topic._id">
              <td class="px-4 py-3">
                <span class="font-medium text-content">{{ topic.title }}</span>
                <span v-if="topic.notes" class="block text-xs text-content-faint mt-0.5">{{ topic.notes }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-content-muted uppercase">{{ topic.type }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="statusColor(topic.status)">{{ topic.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button v-if="topic.status === 'failed' || topic.status === 'completed'" class="p-1 text-gray-500 hover:text-amber-500" title="Reset" @click="resetTopic(topic._id)"><RotateCcw :size="14" /></button>
                  <button class="p-1 text-gray-500 hover:text-red-500" title="Delete" @click="deleteTopic(topic._id)"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Scheduler Tab -->
    <div v-else-if="tab === 'scheduler'" class="max-w-2xl space-y-6">
      <div v-if="scheduler" class="space-y-4">
        <!-- Enable/disable -->
        <div class="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-surface">
          <div>
            <h3 class="text-sm font-semibold text-content">Auto-Generation</h3>
            <p class="text-xs text-content-muted mt-0.5">Picks topics from the queue and generates blog posts automatically</p>
          </div>
          <button
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="scheduler.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="updateScheduler({ enabled: !scheduler.enabled })"
          >
            {{ scheduler.enabled ? 'Enabled' : 'Disabled' }}
          </button>
        </div>

        <!-- Interval -->
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Interval</label>
          <select
            :value="scheduler.interval"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none"
            @change="updateScheduler({ interval: ($event.target as HTMLSelectElement).value as ISchedulerConfig['interval'] })"
          >
            <option value="15min">Every 15 minutes</option>
            <option value="30min">Every 30 minutes</option>
            <option value="hourly">Every hour</option>
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
          </select>
        </div>

        <!-- Model -->
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Model</label>
          <select
            :value="scheduler.aiModel || 'claude-sonnet-4-6'"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none"
            @change="updateScheduler({ model: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="m in MODELS" :key="m.id" :value="m.id">{{ m.label }}</option>
          </select>
        </div>

        <!-- Default tone -->
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Default Tone</label>
          <select
            :value="scheduler.defaultTone || ''"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none"
            @change="updateScheduler({ defaultTone: ($event.target as HTMLSelectElement).value || undefined })"
          >
            <option value="">Default</option>
            <option v-for="t in tones" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>

        <!-- Category rotation -->
        <div>
          <label class="block text-sm font-medium text-content-secondary mb-1">Category Rotation</label>
          <p class="text-xs text-content-muted mb-2">Select categories in the order they should rotate. If a topic has its own category, that takes priority.</p>
          <div class="space-y-1">
            <label v-for="cat in categories" :key="cat._id" class="flex items-center gap-2 text-sm text-content">
              <input
                type="checkbox"
                :checked="scheduler.categoryRotation.includes(cat._id)"
                class="rounded border-gray-300"
                @change="
                  scheduler!.categoryRotation.includes(cat._id)
                    ? updateScheduler({ categoryRotation: scheduler!.categoryRotation.filter(id => id !== cat._id) })
                    : updateScheduler({ categoryRotation: [...scheduler!.categoryRotation, cat._id] })
                "
              />
              {{ cat.name }}
            </label>
          </div>
        </div>

        <!-- Last run -->
        <div class="flex items-center gap-2 text-xs text-content-faint">
          <Clock :size="14" />
          Last run: {{ formatDate(scheduler.lastRunAt) }}
        </div>
      </div>
    </div>

    <!-- History Tab -->
    <div v-else-if="tab === 'history'">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-content-muted">Recent blog post generations</p>
        <button class="text-xs text-content-faint hover:text-content-muted flex items-center gap-1" @click="loadAll"><RefreshCw :size="12" /> Refresh</button>
      </div>
      <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <div v-if="history.length === 0" class="p-8 text-center text-sm text-content-muted">No generations yet.</div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-border text-left">
              <th class="px-4 py-3 font-medium text-content-muted">Topic</th>
              <th class="px-4 py-3 font-medium text-content-muted w-20">Status</th>
              <th class="px-4 py-3 font-medium text-content-muted w-20">Tokens</th>
              <th class="px-4 py-3 font-medium text-content-muted w-20">Time</th>
              <th class="px-4 py-3 font-medium text-content-muted w-32">Date</th>
              <th class="px-4 py-3 font-medium text-content-muted w-16" />
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr v-for="gen in history" :key="gen._id">
              <td class="px-4 py-3 text-content">
                {{ gen.topic }}
                <span v-if="gen.error" class="block text-xs text-red-500 mt-0.5">{{ gen.error }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="statusColor(gen.status)">{{ gen.status }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-content-muted">{{ gen.tokensUsed?.toLocaleString() || '—' }}</td>
              <td class="px-4 py-3 text-xs text-content-muted">{{ gen.durationMs ? `${(gen.durationMs / 1000).toFixed(1)}s` : '—' }}</td>
              <td class="px-4 py-3 text-xs text-content-muted">{{ formatDate(gen.createdAt) }}</td>
              <td class="px-4 py-3">
                <NuxtLink v-if="gen.createdPost" :to="`/admin/blog/${gen.createdPost}`" class="text-xs text-brand-500 hover:underline">Edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
