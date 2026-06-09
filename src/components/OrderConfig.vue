<template>
  <div class="config-card order-config-card">
    <div class="card-header">
      <cute-icon name="order" size="20" color="#fa8c16" />
      <span class="apple-card-title">订单管理</span>
    </div>
    <div class="card-content">
      <!-- 顾客订单 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">{{ userGameName }}订单</div>
          <div class="apple-cell-label">若无订单所需鲜花，则会自动拒绝</div>
        </div>
        <div class="apple-cell-right">
          <button class="apple-disclosure-btn" @click="showCustomerSheet = true">
            <span
              class="apple-disclosure-text"
              :class="{ 'apple-disclosure-text--placeholder': curCustomerText === '请选择' }"
            >
              {{ curCustomerText }}
            </span>
            <van-icon name="arrow" size="12" color="#C7C7CC" />
          </button>
        </div>
      </div>

      <!-- 居民订单 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">{{ userOrderName }}订单</div>
          <div class="apple-cell-label">当订单所需鲜花不足时，会优先自动种植</div>
        </div>
        <div class="apple-cell-right">
          <button class="apple-disclosure-btn" @click="showSaleSheet = true">
            <span
              class="apple-disclosure-text"
              :class="{ 'apple-disclosure-text--placeholder': curSaleText === '请选择' }"
            >
              {{ curSaleText }}
            </span>
            <van-icon name="arrow" size="12" color="#C7C7CC" />
          </button>
        </div>
      </div>

      <!-- 高级设置：仅当 autoSale != 0 时显示 -->
      <div v-show="local.autoSale != 0" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>订单高级设置</span>
        </div>

        <div class="advanced-setting-group">
          <!-- 居民订单数量上限 -->
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">居民订单数量上限</div>
            </div>
            <div class="apple-cell-right">
              <CustomArrayStepper
                :min="0"
                :max="orderMaxLimit"
                :step="100"
                v-model="local.order.orderMaxNum"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>

          <!-- 仅 gameId == 2 显示云布上限 -->
          <div v-if="currentUser.gameId == 2" class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">云布订单数量上限</div>
            </div>
            <div class="apple-cell-right">
              <CustomArrayStepper
                v-model="local.order.clothOrderMaxNum"
                :min="0"
                :max="120"
                :step="20"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>

          <!-- 材料订单数量上限 -->
          <div v-if="currentUser.gameId == 2" class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">材料订单数量上限</div>
            </div>
            <div class="apple-cell-right">
              <CustomArrayStepper
                v-model="local.order.materialOrderMaxNum"
                :min="0"
                :max="120"
                :step="20"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>

          <!-- 挑战/团单 -->
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">
                {{ currentUser.gameId == 1 ? '订单挑战自动完成' : '组团订单自动完成' }}
              </div>
              <div class="apple-cell-label">
                {{ currentUser.gameId == 1 ? '自动参与订单相关挑战任务' : '自动完成团单' }}
              </div>
            </div>
            <div class="apple-cell-right">
              <div class="apple-segment">
                <button
                  v-for="opt in challengeOptions"
                  :key="opt.value"
                  class="apple-segment-btn"
                  :class="{ active: local.order.autoChallenge === opt.value }"
                  @click="local.order.autoChallenge = opt.value"
                >
                  {{ opt.text }}
                </button>
              </div>
            </div>
          </div>

          <!-- 团单品质选择（仅 gameId == 2 且开启了自动团单） -->
          <template v-if="currentUser.gameId == 2 && local.order.autoChallenge > 0">
            <div class="apple-cell">
              <div class="apple-cell-left">
                <div class="apple-cell-title">种子筛选</div>
                <div class="apple-cell-label">只提交有种子的鲜花</div>
              </div>
              <div class="apple-cell-right">
                <van-switch v-model="local.order.seedOnly" size="22" />
              </div>
            </div>

            <div class="apple-cell">
              <div class="apple-cell-left">
                <div class="apple-cell-title">品质选择</div>
                <div class="apple-cell-label">只会提交选择的品质</div>
              </div>
            </div>

            <div class="color-selection-section">
              <QualityColorSelector
                v-model="local.order.color"
                title="订单品质选择"
                :show-title="false"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- ========== 🍎 顾客订单选择 Sheet ========== -->
  <SingleSelectSheet
    v-model="showCustomerSheet"
    title="选择顾客订单模式"
    :current-value="local.autoComplete"
    :options="customerOptions"
    @update:current-value="local.autoComplete = $event"
  />

  <!-- ========== 🍎 居民订单选择 Sheet ========== -->
  <SingleSelectSheet
    v-model="showSaleSheet"
    title="选择居民订单模式"
    :current-value="local.autoSale"
    :options="saleOptions"
    @update:current-value="local.autoSale = $event"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { cloneDeep } from 'lodash-es'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import QualityColorSelector from '@/components/QualityColorSelector.vue'
import SingleSelectSheet from '@/components/SingleSelectSheet.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  currentUser: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// ==================== 本地配置副本，双向同步 ====================
const local = reactive(cloneDeep(toRaw(props.modelValue)))

watch(
  local,
  (v) => {
    emit('update:modelValue', cloneDeep(v))
  },
  { deep: true },
)

// 外部更新时同步回本地
watch(
  () => props.modelValue,
  (v) => {
    if (JSON.stringify(v) !== JSON.stringify(local)) {
      Object.assign(local, cloneDeep(v))
    }
  },
  { deep: true },
)

// ==================== 计算属性 ====================
const userGameName = computed(() => (props.currentUser.gameId == 1 ? '客户' : '顾客'))
const userOrderName = computed(() => (props.currentUser.gameId == 1 ? '鲜花' : '居民'))
const orderMaxLimit = computed(() => (props.currentUser.gameId == 1 ? 1500 : 1200))

// ==================== Sheet 弹窗状态 ====================
const showCustomerSheet = ref(false)
const showSaleSheet = ref(false)

// ==================== 当前显示文本（用于 disclosure button） ====================
const curCustomerText = computed(() => {
  const found = customerOptions.find((o) => o.value === local.autoComplete)
  return found ? found.text : '请选择'
})
const curSaleText = computed(() => {
  const found = saleOptions.find((o) => o.value === local.autoSale)
  return found ? found.text : '请选择'
})

// ==================== 选项常量 ====================
const customerOptions = [
  { text: '关闭', value: 0 },
  { text: '缺库存补种', value: 1 },
  { text: '缺库存不管', value: 2 },
  { text: '缺库存拒绝', value: 3 },
]

const saleOptions = [
  { text: '关闭', value: 0 },
  { text: '缺库存补种', value: 1 },
  { text: '缺库存不管', value: 2 },
]

const challengeOptions = [
  { text: '关闭', value: 0 },
  { text: '免费', value: 1 },
  { text: '免费&付费', value: 2 },
]
</script>

<style scoped>
/* ============================================================
   🍎 OrderConfig – iOS 17 Settings 风格
   与 PlantConfig 保持完全一致的样式体系
   ============================================================ */

/* 卡片容器：磨砂玻璃 + 圆角，与 PlantConfig 一致 */
.order-config-card {
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(32px) saturate(1.4);
  -webkit-backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 0.5px rgba(0, 0, 0, 0.02) inset;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
}

/* 卡片头部 */
.card-header {
  padding: 16px 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--apple-separator, rgba(60, 60, 67, 0.08)) 30%,
    var(--apple-separator, rgba(60, 60, 67, 0.08)) 70%,
    transparent 100%
  );
}

.card-title {
  font-size: 20px;
  font-weight: 630;
  color: var(--apple-text-primary, #1d1d1f);
  flex: 1;
  letter-spacing: -0.3px;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Display', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

/* 卡片内容区域 padding */
.card-content {
  padding: 4px 16px 12px;
}

/* ---------- Stepper 宽度 ---------- */
.apple-stepper-wrap {
  width: 108px;
}

/* ---------- 品质选择展开区域 ---------- */
.color-selection-section {
  padding: 4px 0 0;
}
</style>
