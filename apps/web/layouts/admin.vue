<script setup lang="ts">
import { LayoutDashboard, FileText, BookOpen, FolderOpen, Users, Image, Link, LogOut } from 'lucide-vue-next';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Pages', to: '/admin/pages', icon: FileText },
  { label: 'Blog Posts', to: '/admin/blog', icon: BookOpen },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen },
  { label: 'Authors', to: '/admin/authors', icon: Users },
  { label: 'Affiliates', to: '/admin/affiliates', icon: Link },
  { label: 'Media', to: '/admin/media', icon: Image },
];
</script>

<template>
  <div class="min-h-screen flex bg-page-light dark:bg-page-dark">
    <aside class="w-64 bg-surface border-r border-surface-border dark:bg-surface-dark dark:border-surface-dark-border flex flex-col">
      <div class="p-4 border-b border-surface-border dark:border-surface-dark-border">
        <NuxtLink to="/admin" class="text-lg font-bold text-brand-500">
          TinyTools Admin
        </NuxtLink>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
          active-class="!bg-brand-50 !text-brand-600 dark:!bg-brand-900/20 dark:!text-brand-400"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 border-t border-surface-border dark:border-surface-dark-border">
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
        >
          <LogOut :size="18" />
          Log out
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col">
      <header class="h-14 border-b border-surface-border bg-surface dark:bg-surface-dark dark:border-surface-dark-border flex items-center px-6">
        <h1 class="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Panel</h1>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
