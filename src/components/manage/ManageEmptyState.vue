<template>
  <div class="manage-empty">
    <div class="manage-empty-title">{{ title }}</div>
    <div v-if="description" class="manage-empty-desc">{{ description }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
})
</script>
