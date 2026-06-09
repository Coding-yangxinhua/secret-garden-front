<template>
  <ModernSheet
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="选择花种"
  >
    <!-- 搜索框 -->
    <div class="modern-sheet-search-wrap">
      <van-icon name="search" size="14" color="#86868B" class="modern-sheet-search-icon" />
      <input
        placeholder="搜索花种名称..."
        v-model="searchSeed"
        @input="filterSeed"
        class="modern-sheet-search-input"
      />
      <van-icon
        v-if="searchSeed"
        name="close"
        size="14"
        color="#C7C7CC"
        class="modern-sheet-search-clear"
        @click="resetSearch"
      />
    </div>

    <van-picker
      :columns="filteredSeeds"
      @confirm="confirmFlower"
      @cancel="$emit('update:modelValue', false)"
      class="modern-picker"
      show-toolbar
      cancel-button-text="取消"
      confirm-button-text="确认"
    />
    <div class="modern-sheet-search-wrap"></div>
  </ModernSheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import ModernSheet from './ModernSheet.vue'

const props = defineProps({
  /** v-model 显示/隐藏 */
  modelValue: { type: Boolean, default: false },
  /** 可选种子列表 */
  seeds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const searchSeed = ref('')
const filteredSeeds = ref([])

// 过滤种子
const filterSeed = () => {
  if (!searchSeed.value) {
    filteredSeeds.value = [...props.seeds]
    return
  }
  filteredSeeds.value = props.seeds.filter((f) =>
    f.text.toLowerCase().includes(searchSeed.value.toLowerCase()),
  )
}

// 重置搜索
const resetSearch = () => {
  searchSeed.value = ''
  filterSeed()
}

// 初始化/监听种子列表变化
watch(
  () => props.seeds,
  (list) => {
    filteredSeeds.value = list || []
    searchSeed.value = ''
  },
  { immediate: true },
)

// 辅助：去除花种名称中括号及后面的内容
const removeTextAfterBracket = (inputString) => {
  const bracketIndex = inputString.indexOf('（')
  return bracketIndex !== -1 ? inputString.substring(0, bracketIndex) : inputString
}

// 确认选择
const confirmFlower = ({ selectedOptions }) => {
  const rawText = selectedOptions[0].text
  emit('confirm', {
    seedId: selectedOptions[0].value,
    seedName: removeTextAfterBracket(rawText),
  })
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* 搜索框 */
.modern-sheet-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 20px 12px;
  padding: 8px 12px;
  background: rgba(118, 118, 128, 0.08);
  border-radius: 10px;
}

.modern-sheet-search-icon {
  flex-shrink: 0;
}

.modern-sheet-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #1d1d1f;
  font-family: inherit;
}

.modern-sheet-search-input::placeholder {
  color: #8e8e93;
}

.modern-sheet-search-clear {
  cursor: pointer;
  flex-shrink: 0;
}

/* Picker 风格 */
.modern-picker {
  background: transparent;
  height: 280px;
  padding: 0 20px 8px;
}

.modern-picker :deep(.van-picker__cancel),
.modern-picker :deep(.van-picker__confirm) {
  color: #007aff;
  font-size: 14px;
  font-weight: 500;
}

.modern-picker :deep(.van-picker-column__item) {
  color: #1d1d1f;
  font-weight: 500;
}
</style>
