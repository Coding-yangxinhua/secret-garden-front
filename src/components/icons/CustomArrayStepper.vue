<template>
  <!-- 复用 van-stepper 样式，保证外观一致 -->
  <div class="van-stepper van-stepper--small" :class="{ 'steal-stepper': true }">
    <!-- 减号按钮 -->
    <button
      class="van-stepper__minus"
      :class="{ 'van-stepper__minus--disabled': currentIndex <= 0 }"
      @click="handleMinus"
      :disabled="currentIndex <= 0"
    >
      <i class="van-icon van-icon-minus"></i>
    </button>

    <!-- 输入框：单向绑定 :value，readonly 禁止输入 -->
    <div class="van-stepper__input-wrap">
      <input type="text" class="van-stepper__input" :value="optionsArr[currentIndex]" readonly />
    </div>

    <!-- 加号按钮 -->
    <button
      class="van-stepper__plus"
      :class="{ 'van-stepper__plus--disabled': currentIndex >= optionsArr.length - 1 }"
      @click="handlePlus"
      :disabled="currentIndex >= optionsArr.length - 1"
    >
      <i class="van-icon van-icon-plus"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 1. 定义 props（Vue 3 v-model 默认绑定 modelValue）
const props = defineProps({
  options: {
    type: Array,
    required: true,
    validator: (val) => {
      return val.length > 0 && val.every((item) => item !== undefined && item !== null)
    },
  },
  modelValue: {
    type: [Number, String, Boolean, Object],
    default: null,
  },
})

// 2. 定义 emits（Vue 3 v-model 需派发 update:modelValue 事件）
const emit = defineEmits(['update:modelValue'])

// 3. 响应式数据
const currentIndex = ref(0)
const optionsArr = ref([])

// 4. 【核心优化】智能匹配索引：先严格匹配，再宽松匹配数字/字符串
const findMatchedIndex = (targetVal, options) => {
  // 第一步：严格相等匹配（优先保证非数字类型准确）
  const strictIndex = options.findIndex(item => item === targetVal)
  if (strictIndex >= 0) return strictIndex

  // 第二步：仅对数字/数字字符串进行宽松匹配（解决数字和字符串数字不匹配问题）
  // 排除非数字类的值（如布尔、对象、纯文字字符串）
  if (['number', 'string'].includes(typeof targetVal)) {
    // 尝试把目标值转成数字（仅当是数字字符串时有效）
    const targetNum = Number(targetVal)
    if (!isNaN(targetNum)) {
      return options.findIndex(item => {
        // 把选项值也转成数字，仅当选项是数字/数字字符串时匹配
        const itemNum = Number(item)
        return !isNaN(itemNum) && itemNum === targetNum
      })
    }
  }

  // 无匹配项返回 -1
  return -1
}

// 初始化默认索引
const initDefaultIndex = () => {
  if (props.modelValue !== null && props.modelValue !== undefined) {
    const matchedIndex = findMatchedIndex(props.modelValue, optionsArr.value)
    // 如果匹配到则使用匹配的索引，否则用默认索引（第二个元素或第一个）
    currentIndex.value = matchedIndex >= 0 ? matchedIndex : (optionsArr.value.length >= 2 ? 1 : 0)
  } else {
    currentIndex.value = optionsArr.value.length >= 2 ? 1 : 0
  }
}

// 5. 监听 props.options 变化，同步内部数组并初始化索引
watch(
  () => props.options,
  (newVal) => {
    optionsArr.value = [...newVal]
    initDefaultIndex()
  },
  { immediate: true, deep: true } // 增加 deep: true 监听数组元素变化
)

// 监听 props.modelValue 变化，同步子组件索引（双向同步）
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === null || newVal === undefined || optionsArr.value.length === 0) return
    // 使用智能匹配方法
    const matchedIndex = findMatchedIndex(newVal, optionsArr.value)
    if (matchedIndex >= 0 && matchedIndex !== currentIndex.value) {
      currentIndex.value = matchedIndex
    }
  },
  { immediate: true }
)

// 6. 减号按钮点击事件
const handleMinus = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const newVal = optionsArr.value[currentIndex.value]
    emit('update:modelValue', newVal)
  }
}

// 7. 加号按钮点击事件
const handlePlus = () => {
  if (currentIndex.value < optionsArr.value.length - 1) {
    currentIndex.value++
    const newVal = optionsArr.value[currentIndex.value]
    emit('update:modelValue', newVal)
  }
}
</script>

<style scoped>
/* 保留原有样式，适配 van-stepper 外观 */
.steal-stepper {
  display: flex;
  vertical-align: middle;
}

/* 禁用状态样式，与 van-stepper 保持一致 */
.van-stepper__minus--disabled,
.van-stepper__plus--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 输入框样式优化，保证显示居中 */
.van-stepper__input {
  text-align: center;
  border: none;
  outline: none;
}
</style>