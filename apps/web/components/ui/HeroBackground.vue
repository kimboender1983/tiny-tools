<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- ===================== LIGHT MODE ===================== -->
    <div class="dark:hidden">
      <!-- Large gradient blob — top right -->
      <svg class="shape absolute top-[5%] right-[5%] w-[280px] h-[280px] animate-float-slow" viewBox="0 0 280 280">
        <defs>
          <radialGradient id="blob-lg-light">
            <stop offset="0%" stop-color="#60A5FA" />
            <stop offset="100%" stop-color="#93C5FD" />
          </radialGradient>
          <filter id="blur-lg-light" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>
        <circle cx="140" cy="140" r="100" fill="url(#blob-lg-light)" filter="url(#blur-lg-light)" opacity="0.5" />
      </svg>

      <!-- Small gradient blob — bottom left -->
      <svg class="shape absolute bottom-[8%] left-[6%] w-[180px] h-[180px] animate-float-slow-reverse" viewBox="0 0 180 180">
        <defs>
          <radialGradient id="blob-sm-light">
            <stop offset="0%" stop-color="#60A5FA" />
            <stop offset="100%" stop-color="#BFDBFE" />
          </radialGradient>
          <filter id="blur-sm-light" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
        </defs>
        <circle cx="90" cy="90" r="60" fill="url(#blob-sm-light)" filter="url(#blur-sm-light)" opacity="0.45" />
      </svg>

      <!-- Hexagon outline — top left area -->
      <svg class="shape absolute top-[15%] left-[12%] w-[90px] h-[90px] animate-float-gentle" viewBox="0 0 100 100">
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          fill="none"
          stroke="#60A5FA"
          stroke-width="1.5"
          opacity="0.4"
        />
      </svg>

      <!-- Rounded square outline — right mid -->
      <svg class="shape absolute top-[42%] right-[10%] w-[60px] h-[60px] animate-float-gentle-reverse" viewBox="0 0 70 70">
        <rect
          x="5" y="5" width="60" height="60" rx="14"
          fill="none"
          stroke="#60A5FA"
          stroke-width="1.5"
          opacity="0.35"
        />
      </svg>

      <!-- Dot grid 3×3 — bottom right -->
      <svg class="shape absolute bottom-[18%] right-[16%] w-[52px] h-[52px] animate-float-slow-alt" viewBox="0 0 52 52">
        <circle cx="6"  cy="6"  r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="26" cy="6"  r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="46" cy="6"  r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="6"  cy="26" r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="26" cy="26" r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="46" cy="26" r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="6"  cy="46" r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="26" cy="46" r="2.5" fill="#2563EB" opacity="0.3" />
        <circle cx="46" cy="46" r="2.5" fill="#2563EB" opacity="0.3" />
      </svg>

      <!-- Small diamond — left mid-low -->
      <svg class="shape absolute top-[55%] left-[20%] w-[36px] h-[36px] animate-float-gentle-alt" viewBox="0 0 36 36">
        <rect
          x="6" y="6" width="24" height="24" rx="4"
          fill="none"
          stroke="#60A5FA"
          stroke-width="1.5"
          opacity="0.35"
          transform="rotate(45 18 18)"
        />
      </svg>
    </div>

    <!-- ===================== DARK MODE ===================== -->
    <div class="hidden dark:block">
      <!-- Large gradient blob — top right -->
      <svg class="shape absolute top-[5%] right-[5%] w-[280px] h-[280px] animate-float-slow" viewBox="0 0 280 280">
        <defs>
          <radialGradient id="blob-lg-dark">
            <stop offset="0%" stop-color="#1E40AF" />
            <stop offset="100%" stop-color="#1E3A8A" />
          </radialGradient>
          <filter id="blur-lg-dark" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>
        <circle cx="140" cy="140" r="100" fill="url(#blob-lg-dark)" filter="url(#blur-lg-dark)" opacity="0.5" />
      </svg>

      <!-- Small gradient blob — bottom left -->
      <svg class="shape absolute bottom-[8%] left-[6%] w-[180px] h-[180px] animate-float-slow-reverse" viewBox="0 0 180 180">
        <defs>
          <radialGradient id="blob-sm-dark">
            <stop offset="0%" stop-color="#1E40AF" />
            <stop offset="100%" stop-color="#1E3A8A" />
          </radialGradient>
          <filter id="blur-sm-dark" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
        </defs>
        <circle cx="90" cy="90" r="60" fill="url(#blob-sm-dark)" filter="url(#blur-sm-dark)" opacity="0.45" />
      </svg>

      <!-- Hexagon outline — top left area -->
      <svg class="shape absolute top-[15%] left-[12%] w-[90px] h-[90px] animate-float-gentle" viewBox="0 0 100 100">
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          fill="none"
          stroke="#3B82F6"
          stroke-width="1.5"
          opacity="0.3"
        />
      </svg>

      <!-- Rounded square outline — right mid -->
      <svg class="shape absolute top-[42%] right-[10%] w-[60px] h-[60px] animate-float-gentle-reverse" viewBox="0 0 70 70">
        <rect
          x="5" y="5" width="60" height="60" rx="14"
          fill="none"
          stroke="#2563EB"
          stroke-width="1.5"
          opacity="0.25"
        />
      </svg>

      <!-- Dot grid 3×3 — bottom right -->
      <svg class="shape absolute bottom-[18%] right-[16%] w-[52px] h-[52px] animate-float-slow-alt" viewBox="0 0 52 52">
        <circle cx="6"  cy="6"  r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="26" cy="6"  r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="46" cy="6"  r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="6"  cy="26" r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="26" cy="26" r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="46" cy="26" r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="6"  cy="46" r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="26" cy="46" r="2.5" fill="#3B82F6" opacity="0.3" />
        <circle cx="46" cy="46" r="2.5" fill="#3B82F6" opacity="0.3" />
      </svg>

      <!-- Small diamond — left mid-low -->
      <svg class="shape absolute top-[55%] left-[20%] w-[36px] h-[36px] animate-float-gentle-alt" viewBox="0 0 36 36">
        <rect
          x="6" y="6" width="24" height="24" rx="4"
          fill="none"
          stroke="#2563EB"
          stroke-width="1.5"
          opacity="0.25"
          transform="rotate(45 18 18)"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Floating blobs — more noticeable movement */
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(24px, -30px) scale(1.06); }
  66%      { transform: translate(-18px, 20px) scale(0.95); }
}

/* Geometric outlines — crisp drift + rotation */
@keyframes float-gentle {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50%      { transform: translate(16px, -20px) rotate(12deg); }
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite alternate;
}
.animate-float-slow-reverse {
  animation: float-slow 10s ease-in-out infinite alternate-reverse;
}
.animate-float-slow-alt {
  animation: float-slow 14s ease-in-out infinite alternate;
  animation-delay: -4s;
}
.animate-float-gentle {
  animation: float-gentle 8s ease-in-out infinite alternate;
}
.animate-float-gentle-reverse {
  animation: float-gentle 9s ease-in-out infinite alternate-reverse;
}
.animate-float-gentle-alt {
  animation: float-gentle 7s ease-in-out infinite alternate;
  animation-delay: -2s;
}
</style>
