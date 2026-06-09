<template>
  <ModernSheet
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="选择时间"
  >
    <van-time-picker :formatter="formatter" @confirm="confirmTime" class="modern-time-picker" />
    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>
</template>

<script setup>
import ModernSheet from './ModernSheet.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
}

const confirmTime = ({ selectedValues }) => {
  const timestamp = (selectedValues[0] * 60 * 60 + selectedValues[1] * 60) * 1000
  emit('confirm', timestamp)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modern-time-picker {
  background: transparent;
  padding: 0 20px 8px;
}

.modern-time-picker :deep(.van-picker-column__item) {
  color: #1d1d1f;
  font-weight: 500;
}

.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}
</style>
