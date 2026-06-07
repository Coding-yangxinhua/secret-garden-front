<template>
  <!-- 精简版步进器容器 -->
  <div 
    class="custom-stepper" 
    :class="{ 
      'custom-stepper--small': size === 'small',
      'custom-stepper--mini': size === 'mini',
      'custom-stepper--array-mode': isOptionsMode
    }"
  >
    <!-- 减号按钮：缩小尺寸，仅控制索引禁用 -->
    <button
      class="custom-stepper__btn custom-stepper__btn--minus"
      :class="{ 'custom-stepper__btn--disabled': isDecrementDisabled }"
      @click="handleMinus"
      :disabled="isDecrementDisabled"
    >
      <svg viewBox="0 0 24 24" class="custom-stepper__icon">
        <path d="M20 13H4v-2h16v2z" fill="currentColor"/>
      </svg>
    </button>

    <!-- 输入框：仅控制输入框禁用，按钮不受影响 -->
    <div class="custom-stepper__input-wrap">
      <input 
        type="text" 
        class="custom-stepper__input" 
        :value="displayValue" 
        :readonly="inputDisabled"
        :disabled="inputDisabled"
        @input="handleInput"
        @blur="handleInputBlur"
        @keydown="handleKeydown"
        :placeholder="t('enterValue')"
        :title="t('enterValueInRange')"
      />
      <!-- 输入验证提示 -->
      <div 
        v-if="showValidationError" 
        class="custom-stepper__error-tip"
        :class="{ 'custom-stepper__error-tip--visible': showValidationError }"
      >
        {{ validationErrorText }}
      </div>
    </div>

    <!-- 加号按钮：缩小尺寸，仅控制索引禁用 -->
    <button
      class="custom-stepper__btn custom-stepper__btn--plus"
      :class="{ 'custom-stepper__btn--disabled': isIncrementDisabled }"
      @click="handlePlus"
      :disabled="isIncrementDisabled"
    >
      <svg viewBox="0 0 24 24" class="custom-stepper__icon">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 1. 定义 props：调整禁用逻辑，仅控制输入框
const props = defineProps({
  options: {
    type: Array,
    default: null, // 修改为可选，null表示使用数值模式
  },
  modelValue: {
    type: [Number, String, Boolean, Object],
    default: 0, // 默认值改为0，适用于数值模式
  },
  size: {
    type: String,
    default: 'default', // default / small / mini
    validator: (val) => ['default', 'small', 'mini'].includes(val)
  },
  inputDisabled: { // 仅控制输入框禁用/启用
    type: Boolean,
    default: false // 默认不禁用输入框
  },
  // 数值模式相关属性
  min: {
    type: Number,
    default: -Infinity
  },
  max: {
    type: Number,
    default: Infinity
  },
  step: {
    type: Number,
    default: 1
  },
  precision: {
    type: Number,
    default: 0 // 默认不保留小数位
  }
})

// 2. 定义 emits
const emit = defineEmits(['update:modelValue', 'input', 'validation-error', 'change'])

// 3. 响应式数据
const currentIndex = ref(0)
const optionsArr = ref([])
const showValidationError = ref(false)
const originalValue = ref('')
const internalValue = ref(0) // 内部数值模式的值或选项值
const isDirectInput = ref(false) // 标记是否是直接输入导致的值改变

// 4. 计算属性：判断当前模式
const isOptionsMode = computed(() => {
  return props.options && Array.isArray(props.options) && props.options.length > 0
})

// 5. 计算属性：获取显示值
const displayValue = computed(() => {
  if (isOptionsMode.value) {
    // 选项模式：直接返回当前选项值
    if (currentIndex.value >= 0 && currentIndex.value < optionsArr.value.length) {
      return optionsArr.value[currentIndex.value]
    } else {
      return internalValue.value
    }
  } else {
    return internalValue.value
  }
})

// 6. 计算属性：判断按钮是否禁用
const isDecrementDisabled = computed(() => {
  if (isOptionsMode.value) {
    // 选项模式：检查当前索引是否到达边界
    return currentIndex.value <= 0
  } else {
    return internalValue.value - props.step < props.min
  }
})

const isIncrementDisabled = computed(() => {
  if (isOptionsMode.value) {
    // 选项模式：检查当前索引是否到达边界
    return currentIndex.value >= optionsArr.value.length - 1
  } else {
    return internalValue.value + props.step > props.max
  }
})

// 7. 计算属性：验证错误信息
const validationErrorText = computed(() => {
  if (isOptionsMode.value) {
    return t('invalidValueRange')
  } else {
    return t('invalidValueTipRange')
  }
})

// 8. 智能匹配索引（用于选项模式）
const findMatchedIndex = (targetVal, options) => {
  // 第一步：严格相等匹配
  const strictIndex = options.findIndex(item => item === targetVal)
  if (strictIndex >= 0) return strictIndex

  // 第二步：字符串宽松匹配
  if (typeof targetVal === 'string' || typeof targetVal === 'number') {
    return options.findIndex(item => String(item) === String(targetVal))
  }

  return -1
}

// 9. 初始化模式
const initializeMode = () => {
  if (isOptionsMode.value) {
    // 选项模式
    optionsArr.value = [...props.options]
    initOptionsMode()
  } else {
    // 数值模式
    initNumericMode()
  }
}

// 10. 初始化选项模式
const initOptionsMode = () => {
  let newIndex = 0
  let newInternalValue = 0
  
  if (props.modelValue !== null && props.modelValue !== undefined) {
    const matchedIndex = findMatchedIndex(props.modelValue, optionsArr.value)
    if (matchedIndex >= 0) {
      newIndex = matchedIndex
      newInternalValue = optionsArr.value[newIndex]
    } else {
      // 如果没找到匹配项，使用第一个选项
      newIndex = 0
      newInternalValue = optionsArr.value[0]
    }
  } else {
    // 如果modelValue为空，默认使用第一个选项
    newIndex = 0
    newInternalValue = optionsArr.value[0]
  }

  if (newIndex !== currentIndex.value || newInternalValue !== internalValue.value) {
    currentIndex.value = newIndex
    internalValue.value = newInternalValue
    emit('update:modelValue', newInternalValue)
    emit('change', newInternalValue)
  }
}

// 11. 初始化数值模式
const initNumericMode = () => {
  let newValue = 0
  if (typeof props.modelValue === 'number') {
    newValue = Math.max(props.min, Math.min(props.max, props.modelValue))
  } else if (typeof props.modelValue === 'string') {
    const parsed = parseFloat(props.modelValue)
    if (!isNaN(parsed)) {
      newValue = Math.max(props.min, Math.min(props.max, parsed))
    }
  }
  
  // 应用精度限制
  newValue = applyPrecision(newValue)
  
  internalValue.value = newValue
  emit('update:modelValue', internalValue.value)
  emit('change', internalValue.value)
}

// 12. 应用精度限制
const applyPrecision = (value) => {
  if (props.precision > 0) {
    return Number(value.toFixed(props.precision))
  }
  return value
}

// 13. 监听 props 变化
watch(
  () => [props.options, props.modelValue],
  () => {
    initializeMode()
  },
  { immediate: true, deep: true }
)

// 14. 监听数值模式下的值变化
let previousValue = props.modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (isOptionsMode.value) {
      if (newVal === null || newVal === undefined || optionsArr.value.length === 0) return
      
      const matchedIndex = findMatchedIndex(newVal, optionsArr.value)
      if (matchedIndex >= 0) {
        currentIndex.value = matchedIndex
        internalValue.value = optionsArr.value[matchedIndex]
        
        // 只有当值真正发生变化时才触发change事件
        if (previousValue !== internalValue.value) {
          emit('change', internalValue.value)
          previousValue = internalValue.value
        }
      } else {
        // 如果新值不匹配任何选项，保持当前值不变
        currentIndex.value = Math.min(currentIndex.value, optionsArr.value.length - 1)
        internalValue.value = optionsArr.value[currentIndex.value]
      }
    } else {
      if (typeof newVal === 'number') {
        const clampedValue = Math.max(props.min, Math.min(props.max, newVal))
        const finalValue = applyPrecision(clampedValue)
        if (finalValue !== internalValue.value) {
          internalValue.value = finalValue
          
          // 只有当值真正发生变化时才触发change事件
          if (previousValue !== internalValue.value) {
            emit('change', internalValue.value)
            previousValue = internalValue.value
          }
        }
      }
    }
  },
  { immediate: true }
)

// 15. 输入框手动输入处理
const handleInput = (e) => {
  if (props.inputDisabled) return
  
  const inputVal = e.target.value
  originalValue.value = inputVal
  
  if (isOptionsMode.value) {
    // 选项模式：在选项模式下，我们只接受匹配现有选项的输入
    const matchedIndex = findMatchedIndex(inputVal, optionsArr.value)
    if (matchedIndex >= 0) {
      currentIndex.value = matchedIndex
      internalValue.value = optionsArr.value[matchedIndex]
      isDirectInput.value = true // 标记为直接输入
      emit('update:modelValue', internalValue.value)
      emit('change', internalValue.value)
      showValidationError.value = false
    } else if (inputVal === '') {
      // 允许空值输入
      showValidationError.value = false
    } else {
      showValidationError.value = true
      emit('validation-error', {
        value: inputVal,
        message: '请输入有效的选项值'
      })
    }
  } else {
    // 数值模式：允许输入任意在范围内的数值，不限制步长
    const numValue = parseFloat(inputVal)
    if (!isNaN(numValue)) {
      if (numValue >= props.min && numValue <= props.max) {
        const finalValue = applyPrecision(numValue)
        internalValue.value = finalValue
        emit('update:modelValue', internalValue.value)
        emit('change', internalValue.value)
        showValidationError.value = false
      } else {
        showValidationError.value = true
        emit('validation-error', {
          value: inputVal,
          message: `值应在 ${props.min} 到 ${props.max} 之间`
        })
      }
    } else if (inputVal === '') {
      // 允许空值输入
      showValidationError.value = false
    } else {
      showValidationError.value = true
      emit('validation-error', {
        value: inputVal,
        message: '请输入有效的数值'
      })
    }
  }
}

// 16. 输入框失焦处理 - 恢复有效值
const handleInputBlur = (e) => {
  if (props.inputDisabled) return
  
  if (isOptionsMode.value) {
    // 选项模式：如果输入无效，恢复到当前有效值
    const inputVal = e.target.value
    const matchedIndex = findMatchedIndex(inputVal, optionsArr.value)
    if (inputVal !== '' && matchedIndex < 0) {
      e.target.value = displayValue.value
      showValidationError.value = false
    }
  } else {
    // 数值模式：如果输入无效，恢复到当前有效值
    const inputVal = e.target.value
    if (inputVal !== '' && isNaN(parseFloat(inputVal))) {
      e.target.value = internalValue.value
      showValidationError.value = false
    }
  }
}

// 17. 键盘事件处理
const handleKeydown = (e) => {
  if (props.inputDisabled) return
  
  // 允许的按键：退格、删除、Tab、Escape、Enter、箭头键、Ctrl+A、Ctrl+C、Ctrl+V、Ctrl+X
  if (
    e.key === 'Backspace' ||
    e.key === 'Delete' ||
    e.key === 'Tab' ||
    e.key === 'Escape' ||
    e.key === 'Enter' ||
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown' ||
    (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
  ) {
    return
  }
  
  if (isOptionsMode.value) {
    // 选项模式：允许输入任何字符，因为选项可能是字符串
    return
  }
  
  // 数值模式时允许输入数字、小数点、负号
  if (
    e.key >= '0' && e.key <= '9' ||
    e.key === '.' ||
    e.key === '-' // 负号
  ) {
    return
  }
  
  // 阻止其他按键
  e.preventDefault()
}

// 18. 按钮点击事件
const handleMinus = () => {
  if (isOptionsMode.value) {
    // 选项模式：按索引递减
    if (currentIndex.value > 0) {
      currentIndex.value--
      const newValue = optionsArr.value[currentIndex.value]
      internalValue.value = newValue
      isDirectInput.value = false // 标记为按钮操作
      emit('update:modelValue', newValue)
      emit('change', newValue)
      showValidationError.value = false
    }
  } else {
    // 数值模式：按步长递减
    const newValue = internalValue.value - props.step
    if (newValue >= props.min) {
      const finalValue = applyPrecision(newValue)
      internalValue.value = finalValue
      emit('update:modelValue', internalValue.value)
      emit('change', internalValue.value)
      showValidationError.value = false
    }
  }
}

const handlePlus = () => {
  if (isOptionsMode.value) {
    // 选项模式：按索引递增
    if (currentIndex.value < optionsArr.value.length - 1) {
      currentIndex.value++
      const newValue = optionsArr.value[currentIndex.value]
      internalValue.value = newValue
      isDirectInput.value = false // 标记为按钮操作
      emit('update:modelValue', newValue)
      emit('change', newValue)
      showValidationError.value = false
    }
  } else {
    // 数值模式：按步长递增
    const newValue = internalValue.value + props.step
    if (newValue <= props.max) {
      const finalValue = applyPrecision(newValue)
      internalValue.value = finalValue
      emit('update:modelValue', internalValue.value)
      emit('change', internalValue.value)
      showValidationError.value = false
    }
  }
}

// 19. 国际化支持
const t = (key) => {
  const translations = {
    enterValue: '请输入值',
    enterValueInRange: '请输入范围内的值',
    invalidValueTip: '值不在有效范围内',
    invalidValueTipRange: '请输入有效范围内的数值',
    invalidValueRange: '值应在选项范围内'
  }
  return translations[key] || key
}
</script>

<style scoped>
/* 基础样式：紧凑设计，缩小整体尺寸 */
.custom-stepper {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  user-select: none;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  position: relative;
}

/* 小尺寸 */
.custom-stepper--small {
  font-size: 12px;
  border-radius: 5px;
}

/* 迷你尺寸 */
.custom-stepper--mini {
  font-size: 11px;
  border-radius: 4px;
}

/* 按钮样式：大幅缩小尺寸 */
.custom-stepper__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: #f9fafb;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

/* 小尺寸按钮 */
.custom-stepper--small .custom-stepper__btn {
  width: 24px;
  height: 24px;
}

/* 迷你尺寸按钮 */
.custom-stepper--mini .custom-stepper__btn {
  width: 20px;
  height: 20px;
}

/* 减号按钮圆角 */
.custom-stepper__btn--minus {
  border-radius: 5px 0 0 5px;
  border-right: 1px solid #e5e7eb;
}

.custom-stepper--small .custom-stepper__btn--minus {
  border-radius: 4px 0 0 4px;
}

.custom-stepper--mini .custom-stepper__btn--minus {
  border-radius: 3px 0 0 3px;
}

/* 加号按钮圆角 */
.custom-stepper__btn--plus {
  border-radius: 0 5px 5px 0;
  border-left: 1px solid #e5e7eb;
}

.custom-stepper--small .custom-stepper__btn--plus {
  border-radius: 0 4px 4px 0;
}

.custom-stepper--mini .custom-stepper__btn--plus {
  border-radius: 0 3px 3px 0;
}

/* 按钮悬浮效果 */
.custom-stepper__btn:not(.custom-stepper__btn--disabled):hover {
  background: #f3f4f6;
  color: #3b82f6;
}

/* 按钮点击效果 */
.custom-stepper__btn:not(.custom-stepper__btn--disabled):active {
  background: #e5e7eb;
}

/* 禁用按钮样式（仅索引限制） */
.custom-stepper__btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb !important;
  color: #9ca3af !important;
}

/* 图标样式：同步缩小 */
.custom-stepper__icon {
  width: 12px;
  height: 12px;
}

.custom-stepper--small .custom-stepper__icon {
  width: 10px;
  height: 10px;
}

.custom-stepper--mini .custom-stepper__icon {
  width: 8px;
  height: 8px;
}

/* 输入框容器：精简内边距 */
.custom-stepper__input-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* 输入框样式：紧凑设计 */
.custom-stepper__input {
  width: 42px;
  height: 28px;
  line-height: 28px;
  border: none;
  outline: none;
  text-align: center;
  background: transparent;
  color: #111827;
  font-size: inherit;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* 小尺寸输入框 */
.custom-stepper--small .custom-stepper__input {
  width: 42px;
  height: 24px;
  line-height: 24px;
  padding: 0 4px;
}

/* 迷你尺寸输入框 */
.custom-stepper--mini .custom-stepper__input {
  width: 42px;
  height: 20px;
  line-height: 20px;
  padding: 0 2px;
}


/* 输入框禁用样式 */
.custom-stepper__input:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* 输入框焦点样式 */
.custom-stepper__input:not(:disabled):focus {
  color: #3b82f6;
  background: #f9fafb;
  border-radius: 3px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 错误状态样式 */
.custom-stepper__input.error-state {
  color: #ef4444;
  background: #fef2f2;
}

/* 错误提示样式 */
.custom-stepper__error-tip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  margin-bottom: 4px;
}

.custom-stepper__error-tip--visible {
  opacity: 1;
  visibility: visible;
}

.custom-stepper__error-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #ef4444 transparent transparent transparent;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .custom-stepper {
    font-size: 13px;
  }
  
  .custom-stepper__input {
    width: 42px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .custom-stepper {
    background: #1f2937;
    border-color: #374151;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .custom-stepper__btn {
    background: #273040;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .custom-stepper__btn:not(.custom-stepper__btn--disabled):hover {
    background: #303c50;
    color: #60a5fa;
  }
  
  .custom-stepper__btn:not(.custom-stepper__btn--disabled):active {
    background: #374151;
  }
  
  .custom-stepper__btn--disabled {
    background: #273040 !important;
    color: #6b7280 !important;
  }
  
  .custom-stepper__input {
    color: #f9fafb;
    background: transparent;
  }
  
  .custom-stepper__input:disabled {
    color: #6b7280;
  }
  
  .custom-stepper__input:not(:disabled):focus {
    color: #60a5fa;
    background: #273040;
  }
  
  .custom-stepper__input.error-state {
    color: #fca5a5;
    background: #3f3f46;
  }
  
  .custom-stepper__error-tip {
    background: #7f1d1d;
  }
  
  .custom-stepper__error-tip::after {
    border-color: #7f1d1d transparent transparent transparent;
  }
}
</style>
