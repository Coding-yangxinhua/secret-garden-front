<template>
  <div class="plant-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="breed" size="20" color="#34C759" />
      <span class="apple-card-title">自动种植</span>
    </div>
    <div class="apple-card-content">
      <!-- 水滴阈值 -->
      <div class="apple-cell" v-show="currentUser.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">水滴阈值</div>
          <div class="apple-cell-label">低于水滴阈值将不再种植</div>
        </div>
        <div class="apple-cell-right">
          <CustomArrayStepper
            :min="0"
            :step="100"
            v-model="localConfig.minWaterNum"
            :inputDisabled="false"
            class="apple-stepper-wrap"
          />
        </div>
      </div>

      <!-- 收获模式：Apple 分段控制器 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">收获模式</div>
          <div class="apple-cell-label">配置收获模式</div>
        </div>
        <div class="apple-cell-right">
          <div class="apple-segment">
            <button
              v-for="opt in harvestOptions"
              :key="opt.value"
              class="apple-segment-btn"
              :class="{ active: localConfig.autoHarvest === opt.value }"
              @click="localConfig.autoHarvest = opt.value"
            >
              {{ opt.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 收获定时设置 -->
      <div v-show="localConfig.autoHarvest == 2" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>收获定时设置</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">定时收获</div>
            <div class="apple-cell-label">鲜花成熟后 N 秒收获</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              v-model="localConfig.harvestWaitingTime"
              :min="0"
              :step="30"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
      </div>

      <!-- 种植模式选择 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">种植模式</div>
          <div class="apple-cell-label">配置种植策略和时间计划</div>
        </div>
        <div class="apple-cell-right">
          <button class="apple-disclosure-btn" @click="showPlant = true">
            <span
              class="apple-disclosure-text"
              :class="{
                'apple-disclosure-text--placeholder': !plantText || plantText === '未选择',
              }"
            >
              {{ plantText || '请选择' }}
            </span>
            <van-icon name="arrow" size="12" color="#C7C7CC" />
          </button>
        </div>
      </div>

      <!-- 品质种植配置 -->
      <div v-if="localConfig.autoPlant == 5" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="star-o" size="14" color="#86868B" />
          <span>品质种植配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">补仓整齐</div>
            <div class="apple-cell-label">混乱或整齐，你喜欢哪个呢？</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.quality.tidy" size="22" />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">任务整齐</div>
            <div class="apple-cell-label">任务/订单种的花也保持整齐</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.quality.taskTidy" size="22" />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">等级限制</div>
            <div class="apple-cell-label">低于该等级的鲜花不会种哦</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              :min="1"
              :max="20"
              :step="1"
              v-model="localConfig.quality.level"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">总种类数量</div>
            <div class="apple-cell-label">设置所有品质的总种类数量</div>
          </div>
          <div class="apple-cell-right">
            <CustomArrayStepper
              :options="[0, 1, 2, 4, 8, 16, 32, 64]"
              :maxValueIndex="64"
              :default-value="4"
              v-model="localConfig.quality.categoryNum"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <QualityColorSelector v-model="localConfig.quality.color" title="种植品质选择" />
      </div>

      <!-- 种植时间段配置 -->
      <div v-show="localConfig.autoPlant == 1" class="plant-periods-section">
        <div class="apple-sub-header">
          <van-icon name="clock-o" size="14" color="#86868B" />
          <span>种植时间配置</span>
        </div>

        <div v-if="localConfig.periods.length === 0" class="apple-empty">
          <div class="apple-empty-icon">
            <van-icon name="clock-o" size="40" color="#C7C7CC" />
          </div>
          <div class="apple-empty-text">暂无种植时段</div>
          <div class="apple-empty-desc">点击下方按钮添加种植配置</div>
        </div>

        <div
          v-for="(period, index) in localConfig.periods"
          :key="`plant-${index}`"
          class="apple-row"
        >
          <div class="apple-row-item apple-period-seed" @click="showFlower(period)">
            <div class="apple-row-label">种子</div>
            <div class="apple-row-value">
              <span class="apple-row-text">{{ period.seedName || '未选择' }}</span>
              <van-icon
                v-if="period.seedId"
                :name="`${baseIconUrl}${period.seedId}.png`"
                class="apple-seed-icon"
              />
              <van-icon v-else name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>
          <div class="apple-row-item apple-period-time" @click="showTime(period, 'beginTime')">
            <div class="apple-row-label">开始</div>
            <div class="apple-row-value">
              <span>{{ formatTime(period.beginTime) }}</span>
              <van-icon name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>
          <div class="apple-row-item apple-period-time" @click="showTime(period, 'endTime')">
            <div class="apple-row-label">结束</div>
            <div class="apple-row-value">
              <span>{{ formatTime(period.endTime) }}</span>
              <van-icon name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>
          <button class="apple-delete-btn" @click="deletePlant(index)">
            <van-icon name="delete-o" size="16" color="#FF3B30" />
          </button>
        </div>

        <button class="apple-add-btn" @click="addPlant">
          <van-icon name="add-o" size="16" />
          <span>添加种植配置</span>
        </button>
      </div>
    </div>

    <!-- ========== 🍎 种植模式弹出层 – 使用 PlantModeSheet 子组件 ========== -->
    <PlantModeSheet
      v-model="showPlant"
      :current-value="localConfig.autoPlant"
      :options="plantModeOptions"
      :value-map="autoPlantTextMap"
      @update:current-value="onPlantModeChange"
      @closed="onSheetClosed"
    />

    <!-- ========== 🍎 时间选择弹出层 – 使用 TimePickerSheet 子组件 ========== -->
    <TimePickerSheet v-model="showTimePicker" @confirm="confirmTime" />

    <!-- ========== 🍎 花种选择弹出层 – 使用 FlowerPickerSheet 子组件 ========== -->
    <FlowerPickerSheet
      v-model="showFlowerPicker"
      :seeds="availableSeeds"
      @confirm="confirmFlower"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, toRaw } from 'vue'
import { cloneDeep } from 'lodash-es'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import QualityColorSelector from '@/components/QualityColorSelector.vue'
import PlantModeSheet from '@/components/PlantModeSheet.vue'
import TimePickerSheet from '@/components/TimePickerSheet.vue'
import FlowerPickerSheet from '@/components/FlowerPickerSheet.vue'
// ==================== Props & Emits ====================
const props = defineProps({
  plantConfig: {
    type: Object,
    required: true,
    default: () => ({
      autoPlant: 0,
      autoHarvest: 0,
      harvestWaitingTime: 30,
      minWaterNum: 0,
      quality: {
        categoryNum: 0,
        level: 1,
        tidy: true,
        taskTidy: false,
        color: [],
      },
      periods: [],
    }),
  },
  currentUser: {
    type: Object,
    required: true,
  },
  availableSeeds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:plantConfig'])

// ==================== 本地配置副本，双向同步 ====================
const localConfig = reactive(cloneDeep(toRaw(props.plantConfig)))

// 监听本地变化向外发射
watch(
  localConfig,
  (newVal) => {
    emit('update:plantConfig', cloneDeep(newVal))
  },
  { deep: true },
)

// 外部传入变化时更新本地（例如重置）
watch(
  () => props.plantConfig,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localConfig)) {
      Object.assign(localConfig, cloneDeep(newVal))
    }
  },
  { deep: true },
)

// ==================== 常量与计算属性 ====================
const harvestOptions = [
  { text: '自动', value: 0 },
  { text: '手动', value: 1 },
  { text: '定时', value: 2 },
]

// 种植模式选项：根据游戏ID动态生成
const plantModeOptions = computed(() => {
  if (props.currentUser.gameId == 1) {
    return [
      { text: '关闭', value: 0 },
      {
        text: '补仓',
        value: 2,
        children: [
          { text: '鲜花>=1级', value: 2 },
          { text: '鲜花>8级', value: 3 },
          { text: '鲜花>12级', value: 4 },
        ],
      },
      { text: '自选', value: 1 },
    ]
  } else if (props.currentUser.gameId == 2) {
    return [
      { text: '关闭', value: 0 },
      { text: '自选', value: 1 },
      { text: '品质(补仓)', value: 5 },
    ]
  }
  return []
})

// 种植文本映射
const autoPlantTextMap = {
  0: '关闭',
  1: '自选',
  2: '补仓（鲜花>=1级）',
  3: '补仓（鲜花>8级）',
  4: '补仓（鲜花>12级）',
  5: '品质（补仓）',
}

const plantText = computed(() => {
  return autoPlantTextMap[localConfig.autoPlant] || '未选择'
})

// 图标基础URL
const baseIconUrl = computed(() => {
  const gameId = props.currentUser.gameId
  if (gameId === 1 || gameId === 2) {
    return 'https://static.fthformal.com/flower/flower_newWX/ver/257/resource/assets/h5icon/i'
  } else if (gameId === 3) {
    return 'https://static22.supermoon.fun/beach_wxRL/ver/2.1.9/1/resource/assets/h5icon/i'
  } else if (gameId === 4) {
    return 'https://cdn-fth5-release.zhen-u.com/client/r1.0.86/resource/assets/h5icon/i'
  }
  return ''
})

// ==================== 弹出层相关 ====================
const showPlant = ref(false)
const showTimePicker = ref(false)
const showFlowerPicker = ref(false)
const selectTime = ref(null) // 存储 [period, field]
const selectFlower = ref(null)

// Sheet 关闭后重置二级状态（为保证反向动画优雅）
const onSheetClosed = () => {
  // PlantModeSheet 内部已处理重置
}

// ==================== 时间与格式 ====================
const formatTime = (milliseconds) => {
  if (milliseconds == null) return '00:00'
  const hours = Math.floor(milliseconds / (60 * 60 * 1000))
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// ==================== 事件处理 ====================
/** PlantModeSheet 值变更回调 */
const onPlantModeChange = (value) => {
  localConfig.autoPlant = value
}

const showTime = (period, field) => {
  selectTime.value = [period, field]
  showTimePicker.value = true
}

/** TimePickerSheet 确认回调（timestamp 单位 ms） */
const confirmTime = (timestamp) => {
  if (selectTime.value) {
    selectTime.value[0][selectTime.value[1]] = timestamp
  }
  showTimePicker.value = false
}

const showFlower = (period) => {
  selectFlower.value = period
  showFlowerPicker.value = true
}

/** FlowerPickerSheet 确认回调 */
const confirmFlower = ({ seedId, seedName }) => {
  if (selectFlower.value) {
    selectFlower.value.seedId = seedId
    selectFlower.value.seedName = seedName
  }
  showFlowerPicker.value = false
}

const addPlant = () => {
  localConfig.periods.push({
    beginTime: 0,
    endTime: 86400000,
    seedId: '',
    seedName: '未选择',
  })
}

const deletePlant = (index) => {
  localConfig.periods.splice(index, 1)
}
</script>

<style scoped>
/* ============================================================
   🌱 PlantConfig 特有样式 — 通用样式见 apple-card.css
   ============================================================ */

/* 卡片容器微调：更透的磨砂 + 更圆润 */
.plant-config-card {
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

/* 卡片头部和内容的 padding 微调（覆盖全局） */
.plant-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.plant-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* 品种列宽：种子占更多空间 */
.apple-period-seed {
  flex: 1.5;
}

.apple-period-time {
  flex: 1;
}

/* 种子图标 */
.apple-seed-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* CustomArrayStepper 宽度限制 */
.apple-stepper-wrap {
  width: 108px;
}

/* 种植时段区块间距 */
.plant-periods-section {
  margin-top: 12px;
}
</style>
