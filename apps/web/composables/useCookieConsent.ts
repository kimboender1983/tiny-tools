export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  advertising: boolean;
}

const STORAGE_KEY = 'tt_cookie_consent';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  advertising: false,
};

/** Shared singleton state — survives across components */
const hasConsented = ref(false);
const preferences = ref<CookiePreferences>({ ...defaultPreferences });
const showBanner = ref(false);
const showSettings = ref(false);

function load() {
  if (import.meta.server) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as CookiePreferences;
      preferences.value = { ...defaultPreferences, ...stored, essential: true };
      hasConsented.value = true;
    }
  } catch {
    // corrupted — treat as no consent
  }

  showBanner.value = !hasConsented.value;
}

function save(prefs: CookiePreferences) {
  preferences.value = { ...prefs, essential: true };
  hasConsented.value = true;
  showBanner.value = false;
  showSettings.value = false;

  if (!import.meta.server) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value));
  }
}

function acceptAll() {
  save({ essential: true, analytics: true, advertising: true });
}

function rejectAll() {
  save({ essential: true, analytics: false, advertising: false });
}

function savePreferences(prefs: Partial<CookiePreferences>) {
  save({ ...preferences.value, ...prefs, essential: true });
}

function openSettings() {
  showSettings.value = true;
  showBanner.value = false;
}

function resetConsent() {
  if (!import.meta.server) {
    localStorage.removeItem(STORAGE_KEY);
  }
  hasConsented.value = false;
  preferences.value = { ...defaultPreferences };
  showBanner.value = true;
  showSettings.value = false;
}

export function useCookieConsent() {
  // Initialise once on client
  if (!import.meta.server && !hasConsented.value && !showBanner.value) {
    load();
  }

  return {
    hasConsented: readonly(hasConsented),
    preferences: readonly(preferences),
    showBanner: readonly(showBanner),
    showSettings,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    resetConsent,
  };
}
