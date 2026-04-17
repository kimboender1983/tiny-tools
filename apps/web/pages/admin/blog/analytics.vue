<script setup lang="ts">
    import {
        BarElement,
        CategoryScale,
        Chart as ChartJS,
        Filler,
        Legend,
        LinearScale,
        LineElement,
        PointElement,
        Title,
        Tooltip,
    } from "chart.js";
    import { Bar, Line } from "vue-chartjs";
    import { MessageSquare, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-vue-next";

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler,
    );

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();

    const loading = ref(true);
    const error = ref("");
    const days = ref(30);
    const data = ref<Awaited<ReturnType<typeof cms.blogAnalytics.get>> | null>(null);

    const dayOptions = [
        { label: "7 days", value: 7 },
        { label: "30 days", value: 30 },
        { label: "90 days", value: 90 },
    ];

    async function load() {
        loading.value = true;
        error.value = "";
        try {
            data.value = await cms.blogAnalytics.get(days.value);
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load analytics.";
        } finally {
            loading.value = false;
        }
    }

    function setDays(d: number) {
        days.value = d;
        load();
    }

    // --- Bar chart: top posts likes vs dislikes ---
    const barChartData = computed(() => {
        if (!data.value?.topPosts.length) return null;
        const posts = data.value.topPosts;
        return {
            labels: posts.map((p) =>
                p.title.length > 28 ? p.title.substring(0, 26) + "…" : p.title,
            ),
            datasets: [
                {
                    label: "👍 Likes",
                    data: posts.map((p) => p.likes),
                    backgroundColor: "rgba(34, 197, 94, 0.7)",
                    borderColor: "rgb(34, 197, 94)",
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: "👎 Dislikes",
                    data: posts.map((p) => p.dislikes),
                    backgroundColor: "rgba(239, 68, 68, 0.7)",
                    borderColor: "rgb(239, 68, 68)",
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: "💬 Feedback",
                    data: posts.map((p) => p.feedback),
                    backgroundColor: "rgba(59, 130, 246, 0.7)",
                    borderColor: "rgb(59, 130, 246)",
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    });

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            x: { ticks: { font: { size: 11 } } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    // --- Line chart: daily feedback ---
    const lineChartData = computed(() => {
        if (!data.value?.dailyFeedback.length) return null;
        return {
            labels: data.value.dailyFeedback.map((d) => {
                const date = new Date(d.date);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }),
            datasets: [
                {
                    label: "Feedback submitted",
                    data: data.value.dailyFeedback.map((d) => d.count),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                },
            ],
        };
    });

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    onMounted(load);
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Blog Analytics</h1>
      <div class="flex gap-1 border border-surface-border rounded-lg p-0.5">
        <button
          v-for="opt in dayOptions"
          :key="opt.value"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="days === opt.value ? 'bg-brand-500 text-white' : 'text-content-tertiary hover:text-content'"
          @click="setDays(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-content-muted py-12 text-center">Loading analytics…</div>

    <template v-else-if="data">
      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-surface border border-surface-border rounded-xl p-5">
          <div class="flex items-center gap-2 text-sm text-content-muted mb-1">
            <ThumbsUp :size="15" class="text-green-500" />
            Total Likes
          </div>
          <p class="text-3xl font-bold text-content">{{ data.totalLikes.toLocaleString() }}</p>
          <p class="text-xs text-content-faint mt-1">All time</p>
        </div>
        <div class="bg-surface border border-surface-border rounded-xl p-5">
          <div class="flex items-center gap-2 text-sm text-content-muted mb-1">
            <ThumbsDown :size="15" class="text-red-500" />
            Total Dislikes
          </div>
          <p class="text-3xl font-bold text-content">{{ data.totalDislikes.toLocaleString() }}</p>
          <p class="text-xs text-content-faint mt-1">All time</p>
        </div>
        <div class="bg-surface border border-surface-border rounded-xl p-5">
          <div class="flex items-center gap-2 text-sm text-content-muted mb-1">
            <TrendingUp :size="15" class="text-brand-500" />
            Approval Rate
          </div>
          <p class="text-3xl font-bold text-content">
            {{ data.approvalRate !== null ? `${data.approvalRate}%` : '—' }}
          </p>
          <p class="text-xs text-content-faint mt-1">Likes / total votes</p>
        </div>
        <div class="bg-surface border border-surface-border rounded-xl p-5">
          <div class="flex items-center gap-2 text-sm text-content-muted mb-1">
            <MessageSquare :size="15" class="text-blue-500" />
            Feedback Reports
          </div>
          <p class="text-3xl font-bold text-content">{{ data.totalFeedback.toLocaleString() }}</p>
          <p class="text-xs text-content-faint mt-1">Last {{ days }} days</p>
        </div>
      </div>

      <!-- Bar chart: top posts -->
      <div class="bg-surface border border-surface-border rounded-xl p-5 mb-6">
        <h2 class="text-sm font-semibold text-content mb-4">Top Posts — Likes, Dislikes & Feedback</h2>
        <div v-if="barChartData" class="h-72">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
        <p v-else class="text-sm text-content-muted">No vote data yet.</p>
      </div>

      <!-- Line chart: daily feedback -->
      <div class="bg-surface border border-surface-border rounded-xl p-5 mb-6">
        <h2 class="text-sm font-semibold text-content mb-4">Feedback Submissions — Last {{ days }} days</h2>
        <div v-if="lineChartData" class="h-52">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
        <p v-else class="text-sm text-content-muted">No feedback submitted yet.</p>
      </div>

      <!-- Top posts table -->
      <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <h2 class="text-sm font-semibold text-content px-5 pt-5 pb-3">Post Breakdown</h2>
        <div v-if="data.topPosts.length === 0" class="px-5 pb-5 text-sm text-content-muted">
          No engagement data yet.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-border text-left">
              <th class="px-5 py-3 font-medium text-content-muted">Post</th>
              <th class="px-5 py-3 font-medium text-content-muted text-right">
                <span class="inline-flex items-center gap-1"><ThumbsUp :size="12" /> Likes</span>
              </th>
              <th class="px-5 py-3 font-medium text-content-muted text-right">
                <span class="inline-flex items-center gap-1"><ThumbsDown :size="12" /> Dislikes</span>
              </th>
              <th class="px-5 py-3 font-medium text-content-muted text-right">
                <span class="inline-flex items-center gap-1"><MessageSquare :size="12" /> Feedback</span>
              </th>
              <th class="px-5 py-3 font-medium text-content-muted text-right">Approval</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr
              v-for="post in data.topPosts"
              :key="post.slug"
              class="hover:bg-surface-secondary transition-colors"
            >
              <td class="px-5 py-3">
                <NuxtLink
                  :to="`/admin/blog/${post.id}`"
                  class="font-medium text-content hover:text-brand-500 transition-colors"
                >
                  {{ post.title }}
                </NuxtLink>
                <p class="text-xs text-content-faint font-mono mt-0.5">{{ post.slug }}</p>
              </td>
              <td class="px-5 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                {{ post.likes }}
              </td>
              <td class="px-5 py-3 text-right font-semibold text-red-500 dark:text-red-400">
                {{ post.dislikes }}
              </td>
              <td class="px-5 py-3 text-right font-semibold text-blue-500 dark:text-blue-400">
                {{ post.feedback }}
              </td>
              <td class="px-5 py-3 text-right">
                <span
                  v-if="post.likes + post.dislikes > 0"
                  class="text-sm font-medium"
                  :class="
                    Math.round((post.likes / (post.likes + post.dislikes)) * 100) >= 70
                      ? 'text-green-600 dark:text-green-400'
                      : Math.round((post.likes / (post.likes + post.dislikes)) * 100) >= 40
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-500 dark:text-red-400'
                  "
                >
                  {{ Math.round((post.likes / (post.likes + post.dislikes)) * 100) }}%
                </span>
                <span v-else class="text-content-faint text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
