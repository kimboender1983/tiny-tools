<script setup lang="ts">
    useHead({
        script: [
            {
                defer: true,
                src: "https://cloud.umami.is/script.js",
                "data-website-id": "2cf56603-9061-42b6-982f-a3683778149e",
            },
        ],
    });
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
    <CookieConsent />
  </div>
</template>
