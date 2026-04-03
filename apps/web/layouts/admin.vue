<script setup lang="ts">
import { LayoutDashboard, FileText, BookOpen, FolderOpen, Users, Image, Link, LogOut, UserCog } from 'lucide-vue-next';

const { logout } = useAuth();

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Pages', to: '/admin/pages', icon: FileText },
  { label: 'Blog Posts', to: '/admin/blog', icon: BookOpen },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen },
  { label: 'Authors', to: '/admin/authors', icon: Users },
  { label: 'Affiliates', to: '/admin/affiliates', icon: Link },
  { label: 'Media', to: '/admin/media', icon: Image },
  { label: 'Users', to: '/admin/users', icon: UserCog },
];
</script>

<template>
  <div class="min-h-screen flex bg-page">
    <aside class="w-64 bg-surface border-r border-surface-border flex flex-col">
      <div class="p-4 border-b border-surface-border">
        <NuxtLink to="/admin" class="text-lg font-bold text-brand-500">
          Pickbox Admin
        </NuxtLink>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-content-tertiary hover:bg-surface-secondary hover:text-content transition-colors"
          active-class="!bg-brand-50 !text-brand-600"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 border-t border-surface-border">
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-content-tertiary hover:bg-red-50 hover:text-red-600 transition-colors"
          @click="logout"
        >
          <LogOut :size="18" />
          Log out
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col">
      <header class="h-14 border-b border-surface-border bg-surface flex items-center px-6">
        <h1 class="text-sm font-medium text-content-muted">Admin Panel</h1>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
