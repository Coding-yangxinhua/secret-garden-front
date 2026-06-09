<template>
  <!-- 🍎 新苹果风格步进器 – iOS 17+ UIStepper 风格 -->
  <div
    class="custom-stepper"
    :class="[
      `custom-stepper--${size}`,
      {
        'custom-stepper--array-mode': isOptionsMode,
        'custom-stepper--disabled': inputDisabled,
      },
    ]"
  >
    <!-- 减号按钮 -->
    <button
      class="custom-stepper__btn custom-stepper__btn--minus"
      :class="{ 'custom-stepper__btn--disabled': isDecrementDisabled }"
      @click="handleMinus"
      :disabled="isDecrementDisabled"
      :aria-label="t('decrement')"
    >
      <svg viewBox="0 0 24 24" class="custom-stepper__icon">
        <path d="M19 13H5v-2h14v2z" fill="currentColor" />
      </svg>
    </button>

    <!-- 输入框 -->
    <div class="custom-stepper__input-wrap">
      <input
        type="text"
        class="custom-stepper__input"
        :class="{ 'custom-stepper__input--error': showValidationError }"
        :value="displayValue"
        :readonly="inputDisabled"
        :disabled="inputDisabled"
        @input="handleInput"
        @blur="handleInputBlur"
        @keydown="handleKeydown"
        :placeholder="t('enterValue')"
        :title="t('enterValueInRange')"
      />
      <!-- 验证提示 -->
      <div v-if="showValidationError" class="custom-stepper__error-tip">
        {{ validationErrorText }}
      </div>
    </div>

    <!-- 加号按钮 -->
    <button
      class="custom-stepper__btn custom-stepper__btn--plus"
      :class="{ 'custom-stepper__btn--disabled': isIncrementDisabled }"
      @click="handlePlus"
      :disabled="isIncrementDisabled"
      :aria-label="t('increment')"
    >
      <svg viewBox="0 0 24 24" class="custom-stepper__icon">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
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
    validator: (val) => ['default', 'small', 'mini'].includes(val),
  },
  inputDisabled: {
    // 仅控制输入框禁用/启用
    type: Boolean,
    default: false, // 默认不禁用输入框
  },
  // 数值模式相关属性
  min: {
    type: Number,
    default: -Infinity,
  },
  max: {
    type: Number,
    default: Infinity,
  },
  step: {
    type: Number,
    default: 1,
  },
  precision: {
    type: Number,
    default: 0, // 默认不保留小数位
  },
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
  const strictIndex = options.findIndex((item) => item === targetVal)
  if (strictIndex >= 0) return strictIndex

  // 第二步：字符串宽松匹配
  if (typeof targetVal === 'string' || typeof targetVal === 'number') {
    return options.findIndex((item) => String(item) === String(targetVal))
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
  { immediate: true, deep: true },
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
  { immediate: true },
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
        message: '请输入有效的选项值',
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
          message: `值应在 ${props.min} 到 ${props.max} 之间`,
        })
      }
    } else if (inputVal === '') {
      // 允许空值输入
      showValidationError.value = false
    } else {
      showValidationError.value = true
      emit('validation-error', {
        value: inputVal,
        message: '请输入有效的数值',
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
    (e.key >= '0' && e.key <= '9') ||
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
    invalidValueRange: '值应在选项范围内',
    decrement: '减少',
    increment: '增加',
  }
  return translations[key] || key
}
</script>

<style scoped>
/* ============================================================
   🍎 CustomArrayStepper – 全新苹果风格 (iOS 17+)
   ============================================================
   设计理念：
   - 整体胶囊形态，背景统一为浅灰
   - 按钮与输入区域共用同一背景，仅用垂直线分隔
   - 细腻的微交互动效
   - SF Pro 字体体系
   - 自适应深色模式
   ============================================================ */

.custom-stepper {
  display: inline-flex;
  align-items: center;
  height: 32px;
  background: #f2f2f7;
  border-radius: 20px;
  padding: 0;
  user-select: none;
  position: relative;
  transition: opacity 0.2s ease;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.8);
}

/* 小尺寸 */
.custom-stepper--small {
  height: 28px;
  border-radius: 18px;
}

/* 迷你尺寸 */
.custom-stepper--mini {
  height: 24px;
  border-radius: 16px;
}

/* 禁用态 - 整体半透明 */
.custom-stepper--disabled {
  opacity: 0.55;
}

/* ============================================================
   按钮样式 – 无边框、无背景、仅有分隔线
   ============================================================ */

.custom-stepper__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 100%;
  border: none;
  background: transparent;
  color: #007aff;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  position: relative;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* 小尺寸按钮 */
.custom-stepper--small .custom-stepper__btn {
  width: 28px;
}

/* 迷你尺寸按钮 */
.custom-stepper--mini .custom-stepper__btn {
  width: 24px;
}

/* 减号按钮 - 右侧分隔线 */
.custom-stepper__btn--minus::after {
  content: '';
  position: absolute;
  right: 0;
  top: 22%;
  height: 56%;
  width: 1px;
  background: #c7c7cc;
  transition: opacity 0.2s ease;
}

/* 加号按钮 - 左侧分隔线 */
.custom-stepper__btn--plus::before {
  content: '';
  position: absolute;
  left: 0;
  top: 22%;
  height: 56%;
  width: 1px;
  background: #c7c7cc;
  transition: opacity 0.2s ease;
}

/* 按钮悬浮状态 (仅桌面hover) */
@media (hover: hover) {
  .custom-stepper__btn:not(.custom-stepper__btn--disabled):hover {
    background: rgba(0, 122, 255, 0.06);
    color: #007aff;
  }
}

/* 按钮点击状态 */
.custom-stepper__btn:not(.custom-stepper__btn--disabled):active {
  background: rgba(0, 122, 255, 0.12);
  color: #007aff;
  transform: scale(0.92);
}

/* 禁用按钮 */
.custom-stepper__btn--disabled {
  opacity: 0.28;
  cursor: not-allowed;
  color: #c7c7cc !important;
  background: transparent !important;
}

/* 图标 */
.custom-stepper__icon {
  width: 16px;
  height: 16px;
  transition: transform 0.15s ease;
}

.custom-stepper--small .custom-stepper__icon {
  width: 14px;
  height: 14px;
}

.custom-stepper--mini .custom-stepper__icon {
  width: 12px;
  height: 12px;
}

/* ============================================================
   输入框样式
   ============================================================ */

.custom-stepper__input-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-width: 0;
}

.custom-stepper__input {
  width: 44px;
  height: 100%;
  line-height: 1;
  border: none;
  outline: none;
  text-align: center;
  background: transparent;
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 500;
  font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  padding: 0 2px;
  transition: color 0.2s ease;
  letter-spacing: 0.2px;
}

/* 小尺寸输入框 */
.custom-stepper--small .custom-stepper__input {
  width: 38px;
  font-size: 12px;
}

/* 迷你尺寸输入框 */
.custom-stepper--mini .custom-stepper__input {
  width: 34px;
  font-size: 11px;
}

/* 输入框禁用 */
.custom-stepper__input:disabled {
  color: #c7c7cc;
  cursor: not-allowed;
}

/* 输入框焦点 - 轻微高亮 */
.custom-stepper__input:not(:disabled):focus {
  color: #007aff;
  background: rgba(0, 122, 255, 0.06);
  border-radius: 6px;
}

/* 输入框错误状态 */
.custom-stepper__input--error {
  color: #ff3b30 !important;
}

/* ============================================================
   错误提示气泡 – 苹果风格
   ============================================================ */

.custom-stepper__error-tip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #ff3b30;
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  animation: errorTipBounce 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.custom-stepper__error-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #ff3b30;
}

/* ============================================================
   动画
   ============================================================ */

@keyframes errorTipBounce {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(4px) scale(0.96);
  }
  60% {
    transform: translateX(-50%) translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* ============================================================
   深色模式
   ============================================================ */

@media (prefers-color-scheme: dark) {
  .custom-stepper {
    background: #2c2c2e;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.3),
      inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  }

  .custom-stepper__btn {
    color: #0a84ff;
  }

  .custom-stepper__btn--minus::after,
  .custom-stepper__btn--plus::before {
    background: #38383a;
  }

  @media (hover: hover) {
    .custom-stepper__btn:not(.custom-stepper__btn--disabled):hover {
      background: rgba(10, 132, 255, 0.1);
      color: #0a84ff;
    }
  }

  .custom-stepper__btn:not(.custom-stepper__btn--disabled):active {
    background: rgba(10, 132, 255, 0.18);
    color: #0a84ff;
  }

  .custom-stepper__btn--disabled {
    color: #636366 !important;
  }

  .custom-stepper__input {
    color: #f2f2f7;
  }

  .custom-stepper__input:disabled {
    color: #636366;
  }

  .custom-stepper__input:not(:disabled):focus {
    color: #0a84ff;
    background: rgba(10, 132, 255, 0.1);
  }

  .custom-stepper__input--error {
    color: #ff453a !important;
  }

  .custom-stepper__error-tip {
    background: #ff453a;
    box-shadow: 0 4px 12px rgba(255, 69, 58, 0.3);
  }

  .custom-stepper__error-tip::after {
    border-top-color: #ff453a;
  }
}
</style>
