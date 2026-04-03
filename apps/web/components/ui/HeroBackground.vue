<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Large gradient blob — top right -->
    <svg class="shape absolute top-[5%] right-[5%] w-[280px] h-[280px] animate-float-slow" viewBox="0 0 280 280">
      <defs>
        <radialGradient id="blob-lg">
          <stop offset="0%" class="blob-start" />
          <stop offset="100%" class="blob-end" />
        </radialGradient>
        <filter id="blur-lg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="35" />
        </filter>
      </defs>
      <circle cx="140" cy="140" r="100" fill="url(#blob-lg)" filter="url(#blur-lg)" class="blob-circle" />
    </svg>

    <!-- Small gradient blob — bottom left -->
    <svg class="shape absolute bottom-[8%] left-[6%] w-[180px] h-[180px] animate-float-slow-reverse" viewBox="0 0 180 180">
      <defs>
        <radialGradient id="blob-sm">
          <stop offset="0%" class="blob-start" />
          <stop offset="100%" class="blob-end" />
        </radialGradient>
        <filter id="blur-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="25" />
        </filter>
      </defs>
      <circle cx="90" cy="90" r="60" fill="url(#blob-sm)" filter="url(#blur-sm)" class="blob-circle-sm" />
    </svg>

    <!-- Hexagon outline — top left area -->
    <svg class="shape absolute top-[15%] left-[12%] w-[90px] h-[90px] animate-float-gentle" viewBox="0 0 100 100">
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill="none"
        class="hero-shape"
        stroke-width="1.5"
      />
    </svg>

    <!-- Rounded square outline — right mid -->
    <svg class="shape absolute top-[42%] right-[10%] w-[60px] h-[60px] animate-float-gentle-reverse" viewBox="0 0 70 70">
      <rect
        x="5" y="5" width="60" height="60" rx="14"
        fill="none"
        class="hero-shape"
        stroke-width="1.5"
      />
    </svg>

    <!-- Dot grid 3×3 — bottom right -->
    <svg class="shape absolute bottom-[18%] right-[16%] w-[52px] h-[52px] animate-float-slow-alt" viewBox="0 0 52 52">
      <circle cx="6"  cy="6"  r="2.5" class="hero-dot" />
      <circle cx="26" cy="6"  r="2.5" class="hero-dot" />
      <circle cx="46" cy="6"  r="2.5" class="hero-dot" />
      <circle cx="6"  cy="26" r="2.5" class="hero-dot" />
      <circle cx="26" cy="26" r="2.5" class="hero-dot" />
      <circle cx="46" cy="26" r="2.5" class="hero-dot" />
      <circle cx="6"  cy="46" r="2.5" class="hero-dot" />
      <circle cx="26" cy="46" r="2.5" class="hero-dot" />
      <circle cx="46" cy="46" r="2.5" class="hero-dot" />
    </svg>

    <!-- Small diamond — left mid-low -->
    <svg class="shape absolute top-[55%] left-[20%] w-[36px] h-[36px] animate-float-gentle-alt" viewBox="0 0 36 36">
      <rect
        x="6" y="6" width="24" height="24" rx="4"
        fill="none"
        class="hero-shape"
        stroke-width="1.5"
        transform="rotate(45 18 18)"
      />
    </svg>
  </div>
</template>

<style scoped>
/* Theme-driven SVG colours via CSS custom properties */
.blob-start { stop-color: var(--hero-blob-start); }
.blob-end { stop-color: var(--hero-blob-end); }
.blob-circle { opacity: var(--hero-blob-opacity); }
.blob-circle-sm { opacity: calc(var(--hero-blob-opacity) - 0.05); }
.hero-shape { stroke: var(--hero-shape); opacity: var(--hero-shape-opacity); }
.hero-dot { fill: var(--hero-dot); opacity: 0.3; }

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
