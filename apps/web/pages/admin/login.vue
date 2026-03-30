<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { login, isAuthenticated, loading } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');

// Redirect if already authenticated
if (isAuthenticated.value) {
  navigateTo('/admin');
}

async function handleSubmit() {
  error.value = '';

  if (!email.value || !password.value) {
    error.value = 'Please fill in both fields.';
    return;
  }

  try {
    await login(email.value, password.value);
    await navigateTo('/admin');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Invalid email or password.';
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-page-light dark:bg-page-dark px-4">
    <div class="w-full max-w-sm">
      <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center">
          Admin Login
        </h1>

        <div
          v-if="error"
          class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
