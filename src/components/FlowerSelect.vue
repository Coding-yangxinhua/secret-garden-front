<template>
  <div class="flower-select">
    <!-- 自定义下拉选择框 -->
    <div class="custom-select" :class="{ disabled: !filterFlowers.length, active: showOptions }">
      <div class="select-display" @click="toggleOptions">
        <span class="label">{{ displayText }}</span>
        <span class="arrow">{{ showOptions ? '▲' : '▼' }}</span>
      </div>

      <!-- 下拉选项 + 搜索 -->
      <div v-if="showOptions" class="select-options">
        <input v-model="searchKey" class="search-input" placeholder="搜索鲜花..." @click.stop />
        <div
          v-for="flower in filterFlowers"
          :key="flower.id"
          class="select-option"
          :class="{ selected: isSelected(flower.id) }"
          @click="handleSelect(flower.id)"
        >
          {{ flower.name }}
        </div>
      </div>
    </div>

    <!-- 多选模式：标签展示区域 -->
    <div v-if="isMultiple" class="tag-wrapper" :class="{ hasTags: selected.length > 0 }">
      <div v-for="flowerId in selected" :key="flowerId" class="tag-item">
        <span class="tag-name">{{ getFlowerName(flowerId) }}</span>
        <span class="tag-close" @click.stop="handleDeleteTag(flowerId)">×</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import flowerUtil from '@/utils/flowerUtil.js'
import DS_FLOWER_INFO from '@/config/ds.flower.info.js'


// ===================== 1. Props 定义 =====================
const props = defineProps({
  // 游戏ID（必传）
  gameId: {
    type: [Number, String],
    required: true,
  },
  // v-model 绑定值：数组=多选，字符串/数字=单选
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  // 筛选指定鲜花ID，不传则展示所有鲜花
  flowerIds: {
    type: Array,
    default: () => [],
  },
  // 占位提示文字
  placeholder: {
    type: String,
    default: '请选择鲜花',
  },
})

// 双向绑定触发事件
const emit = defineEmits(['update:modelValue'])

// ===================== 2. 响应式数据 =====================
// 内部选中值（自动适配单选/多选）
const selected = ref('')
// 下拉框显示状态
const showOptions = ref(false)
// 搜索关键词
const searchKey = ref('')

// ===================== 3. 核心计算属性 =====================
/**
 * 是否为多选模式
 * 规则：v-model 绑定数组 → 多选
 */
const isMultiple = computed(() => Array.isArray(props.modelValue))

/**
 * 获取所有鲜花列表（从全局配置提取，自动去重）
 */
const allFlowerList = computed(() => {
  // 直接返回配置文件的鲜花数组，无需任何处理
  return DS_FLOWER_INFO
})

/**
 * 最终展示的鲜花列表
 * 逻辑：flowerIds筛选 + 搜索过滤
 */
const filterFlowers = computed(() => {
  let list = allFlowerList.value

  // 1. 按传入的 flowerIds 筛选
  if (props.flowerIds.length) {
    const targetIds = new Set(props.flowerIds.map(Number))
    list = list.filter((item) => targetIds.has(item.id))
  }

  // 2. 搜索关键词过滤
  if (searchKey.value.trim()) {
    const key = searchKey.value.toLowerCase()
    list = list.filter((item) => item.name.toLowerCase().includes(key))
  }

  return list
})

/**
 * 单选模式：输入框显示的文字
 */
const displayText = computed(() => {
  if (isMultiple.value) return props.placeholder
  if (!selected.value) return props.placeholder
  return getFlowerName(selected.value)
})

// ===================== 4. 工具方法 =====================
/**
 * 根据ID获取鲜花名称
 */
function getFlowerName(flowerId) {
  if (!flowerId) return '未知鲜花'
  return flowerUtil.getFlowerNameByGameAndFlowerId(props.gameId, flowerId) || '未知鲜花'
}

/**
 * 判断鲜花是否已选中
 */
function isSelected(flowerId) {
  if (isMultiple.value) {
    return Array.isArray(selected.value) && selected.value.includes(flowerId)
  }
  return selected.value === flowerId
}

// ===================== 5. 交互方法 =====================
/**
 * 切换下拉框显示/隐藏
 */
const toggleOptions = () => {
  showOptions.value = !showOptions.value
  searchKey.value = '' // 切换时清空搜索
}

/**
 * 选择鲜花
 */
const handleSelect = (flowerId) => {
  if (isMultiple.value) {
    // 多选模式：添加/取消选中
    const arr = Array.isArray(selected.value) ? [...selected.value] : []
    const index = arr.findIndex((id) => id === flowerId)
    index > -1 ? arr.splice(index, 1) : arr.push(flowerId)
    selected.value = arr
  } else {
    // 单选模式：直接赋值，关闭下拉
    selected.value = flowerId
    showOptions.value = false
  }
}

/**
 * 删除多选标签
 */
const handleDeleteTag = (flowerId) => {
  selected.value = selected.value.filter((id) => id !== flowerId)
}

/**
 * 点击外部关闭下拉框
 */
const closeOptions = (e) => {
  if (!e.target.closest('.flower-select')) {
    showOptions.value = false
  }
}

// ===================== 6. 双向绑定监听 =====================
// 父组件赋值 → 同步到内部选中值（回显）
watch(
  () => props.modelValue,
  (newVal) => {
    selected.value = newVal
  },
  { immediate: true },
)

// 内部选中值变化 → 同步给父组件
watch(
  selected,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true },
) // 多选数组需要深度监听

// ===================== 7. 生命周期 =====================
onMounted(() => window.addEventListener('click', closeOptions))
onUnmounted(() => window.removeEventListener('click', closeOptions))
</script>

<style scoped>
/* 外层容器 */
.flower-select {
  width: 100%;
  max-width: 320px;
  position: relative;
  z-index: 9999;
}

/* 自定义选择框 */
.custom-select {
  position: relative;
  width: 100%;
  font-size: 14px;
}

/* 禁用状态 */
.custom-select.disabled .select-display {
  background: #F7F8FA;
  color: #C9CDD4;
  cursor: not-allowed;
  border-color: #E4E6EB;
}

/* 激活状态（下拉展开） */
.custom-select.active {
  z-index: 999999 !important;
}

/* 选择框显示区域 */
.select-display {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #E4E6EB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: #FFFFFF;
  transition: border-color 0.2s;
}

/* 粉色系 hover 边框 */
.select-display:hover {
  border-color: #FF7CB7;
}

/* 下拉箭头 */
.arrow {
  font-size: 12px;
  color: #8B939F;
}

/* 下拉选项容器 */
.select-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999999;
  animation: fadeIn 0.2s ease;
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: none;
  outline: none;
  font-size: 13px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

/* 单个选项 */
.select-option {
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 粉色系 选项选中状态 */
.select-option.selected {
  background: #FFF0F6;
  color: #FF7CB7;
}

.select-option:hover {
  background: #FFF0F6;
  color: #FF7CB7;
}

/* ===================== 多选样式优化 ===================== */
/* 基础布局：无选中时无边框无背景 */
.tag-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  min-height: 4px;
}
/* 有选中标签时：添加外框和背景 */
.tag-wrapper.hasTags {
  border: 1px solid #FFD1E3;
  border-radius: 8px;
  padding: 10px 12px;
  background: #FFFAFC;
  min-height: 40px;
}

/* 多选标签：粉色系简约样式 */
.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #FFF0F6;
  color: #FF7CB7;
  border-radius: 4px;
  font-size: 12px;
}

/* 删除按钮：去除圆形包裹，纯文字粉色 */
.tag-close {
  cursor: pointer;
  font-size: 12px;
  color: #FF7CB7;
  background: none;
  width: auto;
  height: auto;
  line-height: 1;
  border-radius: 0;
}

.tag-close:hover {
  color: #FF5CA8;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.select-options::-webkit-scrollbar {
  width: 3px;
}

.select-options::-webkit-scrollbar-thumb {
  background: #DCE0E6;
  border-radius: 3px;
}
</style>