declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function useAds() {
  const config = useRuntimeConfig();
  const adsenseId = config.public.adsenseId as string;
  const route = useRoute();

  const isEnabled = computed(() => !!adsenseId);

  if (adsenseId) {
    useHead({
      script: [
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`,
          async: true,
          crossorigin: 'anonymous',
        },
      ],
    });
  }

  function pushAd() {
    if (!adsenseId) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or script not loaded — silently ignore
    }
  }

  function initSlot(el: HTMLElement) {
    if (!adsenseId) return;

    nextTick(() => {
      const ins = el.querySelector('ins.adsbygoogle');
      if (ins && !ins.getAttribute('data-adsbygoogle-status')) {
        pushAd();
      }
    });
  }

  function refreshAds() {
    if (!adsenseId || import.meta.server) return;

    nextTick(() => {
      const slots = document.querySelectorAll('ins.adsbygoogle');
      slots.forEach((slot) => {
        if (!slot.getAttribute('data-adsbygoogle-status')) {
          pushAd();
        }
      });
    });
  }

  // Refresh ads on route change
  watch(() => route.fullPath, () => {
    refreshAds();
  });

  return {
    isEnabled,
    initSlot,
    refreshAds,
    pushAd,
  };
}
