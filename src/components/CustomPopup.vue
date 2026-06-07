<!-- CustomPopup.vue -->
<template>
  <teleport to="body">
    <transition name="popup-fade">
      <div v-if="show" class="popup-overlay" @click.self="handleOverlayClick">
        <div 
          :class="[
            'popup-container',
            `popup-position-${position}`,
            { 'popup-round': round }
          ]"
          :style="containerStyle"
          ref="popupRef"
        >
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'center' // 'top', 'bottom', 'left', 'right', 'center'
  },
  round: {
    type: Boolean,
    default: false
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  overlay: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 0.3
  },
  safeAreaInsetBottom: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'close', 'closed', 'click-overlay'])

const popupRef = ref(null)

const containerStyle = computed(() => {
  const style = {
    animationDuration: `${props.duration}s`,
    maxWidth: 'calc(100vw - 32px)', // 添加最大宽度限制，留出边距
    maxHeight: 'calc(100vh - 32px)',
    margin: '16px'
  }

  if (props.position === 'bottom') {
    style.width = 'calc(100% - 32px)'
    style.maxWidth = '600px' // 在桌面端限制最大宽度
    style.borderRadius = props.round ? '20px 20px 0 0' : '0'
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
    style.bottom = props.safeAreaInsetBottom ? 'env(safe-area-inset-bottom)' : '0'
  } else if (props.position === 'top') {
    style.width = 'calc(100% - 32px)'
    style.maxWidth = '600px'
    style.borderRadius = props.round ? '0 0 20px 20px' : '0'
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
    style.top = '0'
  } else if (props.position === 'left' || props.position === 'right') {
    style.height = '100%'
    style.maxHeight = 'none'
    style.borderRadius = props.round ? '0' : '0'
  } else {
    // center
    style.maxWidth = '600px'
    style.borderRadius = props.round ? '20px' : '0'
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
  }

  return style
})

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('click-overlay')
    emit('update:show', false)
  }
}

// 锁定滚动的处理
let originalOverflow = ''
let originalPosition = ''
let originalTop = ''

const lockScroll = () => {
  if (props.lockScroll) {
    originalOverflow = document.body.style.overflow
    originalPosition = document.body.style.position
    originalTop = document.body.style.top
    
    const scrollY = window.scrollY || window.pageYOffset
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
  }
}

const unlockScroll = () => {
  if (props.lockScroll) {
    document.body.style.overflow = originalOverflow
    document.body.style.position = originalPosition
    document.body.style.top = originalTop
    
    const scrollY = Math.abs(parseInt(document.body.style.top || '0'))
    window.scrollTo(0, scrollY)
  }
}

onMounted(() => {
  if (props.show && props.lockScroll) {
    lockScroll()
  }
})

onUnmounted(() => {
  if (props.lockScroll) {
    unlockScroll()
  }
})

// 监听show变化
watch(() => props.show, (newVal) => {
  if (newVal && props.lockScroll) {
    lockScroll()
  } else if (!newVal && props.lockScroll) {
    unlockScroll()
  }
})
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-container {
  background-color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.popup-position-center {
  display: inline-block;
  vertical-align: middle;
}

.popup-position-top {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(0);
}

.popup-position-bottom {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(0);
}

.popup-position-left {
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(0);
}

.popup-position-right {
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  transform: translateX(0);
}

/* 动画 */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .popup-container {
    max-width: calc(100vw - 16px);
    margin: 8px;
  }
  
  .popup-position-bottom,
  .popup-position-top {
    width: calc(100% - 16px);
  }
}
</style>