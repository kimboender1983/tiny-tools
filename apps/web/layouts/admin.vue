<script setup lang="ts">
    import {
        BarChart2,
        BookOpen,
        Bot,
        FileText,
        FolderOpen,
        Image,
        Key,
        LayoutDashboard,
        Link,
        LogOut,
        Menu,
        MessageSquare,
        Palette,
        UserCog,
        Users,
        Wrench,
        X,
    } from "lucide-vue-next";

    const { logout } = useAuth();

    useHead({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    });

    const navItems = [
        { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
        { label: "Pages", to: "/admin/pages", icon: FileText },
        { label: "Tools", to: "/admin/tools", icon: Wrench },
        { label: "Blog Posts", to: "/admin/blog", icon: BookOpen },
        { label: "Blog Analytics", to: "/admin/blog/analytics", icon: BarChart2 },
        { label: "Blog Feedback", to: "/admin/blog/feedback", icon: MessageSquare },
        { label: "Categories", to: "/admin/categories", icon: FolderOpen },
        { label: "Authors", to: "/admin/authors", icon: Users },
        { label: "Affiliates", to: "/admin/affiliates", icon: Link },
        { label: "Blog Writer", to: "/admin/blog-writer", icon: Bot },
        { label: "Tech Logos", to: "/admin/tech-logos", icon: Palette },
        { label: "Media", to: "/admin/media", icon: Image },
        { label: "API Keys", to: "/admin/api-keys", icon: Key },
        { label: "Users", to: "/admin/users", icon: UserCog },
    ];

    const sidebarOpen = ref(false);
    const route = useRoute();

    watch(
        () => route.path,
        () => {
            sidebarOpen.value = false;
        },
    );
</script>

<template>
  <div class="min-h-screen flex bg-page">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed lg:sticky top-0 z-30 h-screen w-64 bg-surface border-r border-surface-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:transition-none"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-4 border-b border-surface-border flex items-center justify-between flex-shrink-0">
        <NuxtLink to="/admin" class="text-lg font-bold text-brand-500">
          Pickbox Admin
        </NuxtLink>
        <button
          class="lg:hidden p-1 rounded text-content-muted hover:text-content transition-colors"
          @click="sidebarOpen = false"
        >
          <X :size="18" />
        </button>
      </div>
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
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
      <div class="p-3 border-t border-surface-border flex-shrink-0">
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-content-tertiary hover:bg-red-50 hover:text-red-600 transition-colors"
          @click="logout"
        >
          <LogOut :size="18" />
          Log out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-10 h-14 border-b border-surface-border bg-surface flex items-center gap-3 px-4 sm:px-6">
        <button
          class="lg:hidden p-1.5 rounded-lg text-content-muted hover:bg-surface-secondary hover:text-content transition-colors"
          @click="sidebarOpen = true"
        >
          <Menu :size="20" />
        </button>
        <h1 class="text-sm font-medium text-content-muted">Admin Panel</h1>
      </header>
      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </div>

    <UiToastContainer />
  </div>
</template>
