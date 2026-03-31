<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();

const loading = ref(true);
const error = ref('');
const days = ref(30);
const analytics = ref<{
  totalClicks: number;
  perAffiliate: { affiliateId: string; name: string; slug: string; totalClicks: number }[];
  dailyClicks: { date: string; count: number }[];
} | null>(null);

const dayOptions = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

async function loadAnalytics() {
  loading.value = true;
  error.value = '';

  try {
    analytics.value = (await cms.affiliates.getOverviewAnalytics(days.value)) as typeof analytics.value;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load analytics.';
  } finally {
    loading.value = false;
  }
}

function setDays(d: number) {
  days.value = d;
  loadAnalytics();
}

const chartData = computed(() => {
  if (!analytics.value?.dailyClicks) return null;

  const labels = analytics.value.dailyClicks.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return {
    labels,
    datasets: [
      {
        label: 'Clicks',
        data: analytics.value.dailyClicks.map((d) => d.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
};

onMounted(loadAnalytics);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">Affiliate Analytics</h1>
      <div class="flex gap-1 border border-surface-border dark:border-surface-dark-border rounded-lg p-0.5">
        <button
          v-for="opt in dayOptions"
          :key="opt.value"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="days === opt.value
            ? 'bg-brand-500 text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
          @click="setDays(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</div>

    <template v-else-if="analytics">
      <!-- Total clicks -->
      <div class="mb-6 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-5">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Clicks (last {{ days }} days)</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-1">{{ analytics.totalClicks.toLocaleString() }}</p>
      </div>

      <!-- Chart -->
      <div
        v-if="chartData && chartData.labels.length > 0"
        class="mb-6 bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-5"
      >
        <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4">Clicks Over Time</h2>
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Per-affiliate table -->
      <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl overflow-hidden">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-50 px-5 pt-5 mb-3">Per Affiliate</h2>
        <div v-if="analytics.perAffiliate.length === 0" class="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400">
          No clicks recorded yet.
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-border dark:border-surface-dark-border text-left">
              <th class="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Affiliate</th>
              <th class="px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Slug</th>
              <th class="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Clicks</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border dark:divide-surface-dark-border">
            <tr v-for="aff in analytics.perAffiliate" :key="aff.affiliateId">
              <td class="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{{ aff.name }}</td>
              <td class="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ aff.slug }}</td>
              <td class="px-5 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{{ aff.totalClicks.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
