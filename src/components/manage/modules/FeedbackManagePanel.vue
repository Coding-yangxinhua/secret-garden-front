<template>
  <section class="manage-module feedback-manage-panel">
    <ManageFeedbackView ref="feedbackRef" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ManageFeedbackView from '@/views/ManageFeedbackView.vue'

const feedbackRef = ref(null)

const refresh = () => {
  feedbackRef.value?.refresh?.()
}

defineExpose({ refresh })
</script>

<style scoped>
.feedback-manage-panel :deep(.manage-feedback-page) {
  min-height: auto;
  padding: 0;
  background: transparent;
}

.feedback-manage-panel :deep(.page-header) {
  display: none;
}
</style>
