<template>
  <Teleport to="body">
    <transition name="setup-guide-fade">
      <div v-if="modelValue && step" class="setup-guide-layer" aria-live="polite">
        <template v-if="targetBox">
          <div
            v-for="segment in scrimSegments"
            :key="segment.key"
            class="setup-guide-scrim"
            :style="segment.style"
          ></div>
        </template>
        <div v-else class="setup-guide-scrim is-full"></div>

        <button
          v-if="targetBox"
          class="setup-guide-focus"
          :style="focusStyle"
          type="button"
          :aria-label="step.title"
          @click="emit('primary')"
        ></button>

        <section class="setup-guide-card" :class="cardClass" :style="cardStyle">
          <div class="setup-guide-kicker">{{ step.kicker || '开始前' }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
          <div class="setup-guide-actions">
            <button class="setup-guide-skip" type="button" @click="emit('dismiss')">稍后再说</button>
            <button class="setup-guide-primary" type="button" @click="emit('primary')">
              {{ step.actionText || '去完成' }}
            </button>
          </div>
        </section>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, watch, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  step: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'primary', 'dismiss'])

const targetBox = ref(null)
let rafId = 0

const accent = computed(() => props.step?.accent || '#ec4899')

const focusStyle = computed(() => {
  if (!targetBox.value) return {}
  const pad = props.step?.padding ?? 8
  const top = Math.max(8, targetBox.value.top - pad)
  const left = Math.max(8, targetBox.value.left - pad)
  const width = Math.min(window.innerWidth - left - 8, targetBox.value.width + pad * 2)
  const height = Math.min(window.innerHeight - top - 8, targetBox.value.height + pad * 2)

  return {
    '--setup-guide-accent': accent.value,
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: `${props.step?.radius || 20}px`,
  }
})

const cardClass = computed(() => {
  if (!targetBox.value) return 'is-bottom'
  return targetBox.value.top > window.innerHeight * 0.48 ? 'is-top' : 'is-bottom'
})

const cardStyle = computed(() => {
  const base = { '--setup-guide-accent': accent.value }
  if (!targetBox.value) return base

  if (window.innerWidth <= 520) {
    const side = 16
    const cardHeight = 150
    const showAbove = targetBox.value.top > window.innerHeight * 0.46
    const top = showAbove
      ? Math.max(12, targetBox.value.top - cardHeight - 14)
      : Math.min(window.innerHeight - cardHeight - 12, targetBox.value.bottom + 14)

    return {
      ...base,
      left: `${side}px`,
      right: `${side}px`,
      top: `${top}px`,
      bottom: 'auto',
    }
  }

  const width = 320
  const left = Math.min(
    Math.max(16, targetBox.value.left + targetBox.value.width / 2 - width / 2),
    window.innerWidth - width - 16,
  )
  const showAbove = targetBox.value.top > window.innerHeight * 0.48
  const top = showAbove
    ? Math.max(16, targetBox.value.top - 152)
    : Math.min(window.innerHeight - 170, targetBox.value.bottom + 18)

  return {
    ...base,
    width: `${width}px`,
    left: `${left}px`,
    top: `${top}px`,
    bottom: 'auto',
  }
})

const scrimSegments = computed(() => {
  if (!targetBox.value) return []

  const pad = props.step?.padding ?? 8
  const top = Math.max(0, targetBox.value.top - pad)
  const left = Math.max(0, targetBox.value.left - pad)
  const right = Math.min(window.innerWidth, targetBox.value.right + pad)
  const bottom = Math.min(window.innerHeight, targetBox.value.bottom + pad)

  return [
    {
      key: 'top',
      style: { top: '0px', left: '0px', right: '0px', height: `${top}px` },
    },
    {
      key: 'left',
      style: { top: `${top}px`, left: '0px', width: `${left}px`, height: `${bottom - top}px` },
    },
    {
      key: 'right',
      style: {
        top: `${top}px`,
        left: `${right}px`,
        right: '0px',
        height: `${bottom - top}px`,
      },
    },
    {
      key: 'bottom',
      style: { top: `${bottom}px`, left: '0px', right: '0px', bottom: '0px' },
    },
  ]
})

function measureTarget() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const selector = props.step?.target
    const target = selector ? document.querySelector(selector) : null
    if (!target) {
      targetBox.value = null
      return
    }

    const rect = target.getBoundingClientRect()
    targetBox.value = {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    }
  })
}

async function activateGuide() {
  await nextTick()
  const selector = props.step?.target
  const target = selector ? document.querySelector(selector) : null
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
  window.setTimeout(measureTarget, 280)
}

watch(
  () => [props.modelValue, props.step?.id],
  ([visible]) => {
    if (visible && props.step) {
      activateGuide()
      window.addEventListener('resize', measureTarget)
      window.addEventListener('scroll', measureTarget, true)
    } else {
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', measureTarget)
  window.removeEventListener('scroll', measureTarget, true)
})
</script>

<style scoped>
.setup-guide-layer {
  position: fixed;
  inset: 0;
  z-index: 100000;
  pointer-events: none;
  font-family:
    -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.setup-guide-scrim {
  position: fixed;
  background: rgba(28, 20, 24, 0.38);
  pointer-events: auto;
}

.setup-guide-scrim.is-full {
  inset: 0;
}

.setup-guide-focus {
  position: fixed;
  border: 1.5px solid color-mix(in srgb, var(--setup-guide-accent) 72%, white);
  background: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 0 0 9999px rgba(28, 20, 24, 0.18),
    0 0 0 7px color-mix(in srgb, var(--setup-guide-accent) 14%, transparent),
    0 16px 38px color-mix(in srgb, var(--setup-guide-accent) 24%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  pointer-events: auto;
  cursor: pointer;
  animation: setupGuidePulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  -webkit-tap-highlight-color: transparent;
}

.setup-guide-card {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(18px + env(safe-area-inset-bottom));
  padding: 15px 15px 13px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.86), rgba(255, 247, 251, 0.68)),
    rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.62);
  box-shadow:
    0 18px 45px rgba(98, 70, 82, 0.22),
    0 8px 26px color-mix(in srgb, var(--setup-guide-accent) 15%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  pointer-events: auto;
}

.setup-guide-card.is-top {
  animation: setupGuideCardTop 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.setup-guide-card.is-bottom {
  animation: setupGuideCardBottom 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.setup-guide-kicker {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--setup-guide-accent);
}

.setup-guide-card h3 {
  margin: 0 0 5px;
  font-size: 16px;
  line-height: 1.28;
  font-weight: 650;
  color: #1d1d1f;
}

.setup-guide-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.48;
  color: #5f565c;
}

.setup-guide-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 13px;
}

.setup-guide-actions button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition:
    opacity 160ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
}

.setup-guide-actions button:active {
  transform: scale(0.96);
}

.setup-guide-skip {
  color: #7a7076;
  background: rgba(255, 255, 255, 0.46);
}

.setup-guide-primary {
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--setup-guide-accent),
    color-mix(in srgb, var(--setup-guide-accent) 78%, #ff6767)
  );
  box-shadow: 0 8px 20px color-mix(in srgb, var(--setup-guide-accent) 22%, transparent);
}

.setup-guide-fade-enter-active,
.setup-guide-fade-leave-active {
  transition: opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.setup-guide-fade-enter-from,
.setup-guide-fade-leave-to {
  opacity: 0;
}

@keyframes setupGuidePulse {
  0%,
  100% {
    box-shadow:
      0 0 0 9999px rgba(28, 20, 24, 0.18),
      0 0 0 6px color-mix(in srgb, var(--setup-guide-accent) 12%, transparent),
      0 16px 38px color-mix(in srgb, var(--setup-guide-accent) 22%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.65);
  }
  50% {
    box-shadow:
      0 0 0 9999px rgba(28, 20, 24, 0.18),
      0 0 0 10px color-mix(in srgb, var(--setup-guide-accent) 19%, transparent),
      0 20px 46px color-mix(in srgb, var(--setup-guide-accent) 30%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }
}

@keyframes setupGuideCardBottom {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes setupGuideCardTop {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .setup-guide-focus,
  .setup-guide-card {
    animation: none;
  }
}
</style>
