<template>
  <div class="manage-console">
    <aside class="manage-sidebar" aria-label="后台模块导航">
      <div class="manage-brand">
        <div class="manage-brand-mark">SG</div>
        <div>
          <div class="manage-brand-title">后台管理</div>
          <div class="manage-brand-subtitle">Operations Console</div>
        </div>
      </div>

      <nav class="manage-nav">
        <button
          v-for="module in modules"
          :key="module.key"
          type="button"
          class="manage-nav-item"
          :class="{ active: activeKey === module.key }"
          @click="$emit('change', module.key)"
        >
          <van-icon :name="module.icon" />
          <span>{{ module.label }}</span>
        </button>
      </nav>

      <div class="manage-global-actions">
        <button
          type="button"
          class="manage-icon-btn"
          :class="{ invisible: !currentModule?.refreshable }"
          :disabled="!currentModule?.refreshable"
          aria-label="刷新当前模块"
          title="刷新"
          @click="$emit('refresh')"
        >
          <van-icon name="replay" />
        </button>
        <button
          type="button"
          class="manage-icon-btn"
          aria-label="返回首页"
          title="返回首页"
          @click="$emit('home')"
        >
          <van-icon name="wap-home-o" />
        </button>
      </div>
    </aside>

    <section class="manage-main-shell">
      <main class="manage-content" tabindex="-1">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup>
import { Icon as VanIcon } from 'vant'

defineProps({
  modules: { type: Array, default: () => [] },
  activeKey: { type: String, default: '' },
  currentModule: { type: Object, default: null },
})

defineEmits(['change', 'refresh', 'home'])
</script>
