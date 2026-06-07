<!-- AutoAdConfig.vue - 自动领取配置组件 -->
<template>
  <div class="config-card ad-config-card">
    <div class="card-header" @click="toggleExpand('adConfig')">
      <van-icon name="play-circle-o" size="20" color="#5cadff" />
      <span class="card-title">自动领取</span>
      <van-icon
        name="arrow-down"
        size="16"
        :class="{ 'rotate-180': expandStates.adConfig }"
        class="expand-icon"
      />
    </div>
    <div class="card-content" v-show="expandStates.adConfig">
      <van-cell class="feature-cell" center :label="adFeatureLabel">
        <template #title>
          <span class="feature-title">自动领取功能</span>
        </template>
      </van-cell>

      <!-- 自动领取详细配置 -->
      <div class="indent ad-advanced-section">
        <!-- 水滴相关配置 -->
        <div class="subsection-title">水滴</div>
        <van-cell class="advanced-cell" title="定时水滴">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.water.autoWaterAd"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" title="水桶领取">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.water.autoWater"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <div class="indent" v-if="localConfig.ad.water.autoWater">
          <van-cell class="advanced-cell" label="高于水桶领取数将不再领取">
            <template #title>
              <span>水桶领取数量</span>
            </template>
            <custom-array-stepper
              :min="0"
              :max="60"
              :step="10"
              v-model="localConfig.ad.water.maxWaterNum"
              :inputDisabled="false"
              class="steal-stepper"
              @change="onConfigChange"
            >
            </custom-array-stepper>
          </van-cell>
          <van-cell class="advanced-cell" title="按需领取" label="只有浇水时水滴不够才领取">
            <template #right-icon>
              <van-switch
                v-model="localConfig.ad.water.lackGet"
                size="24"
                @change="onConfigChange"
              />
            </template>
          </van-cell>
        </div>

        <!-- 珍珠相关配置 -->
        <div class="subsection-title">珍珠</div>
        <van-cell class="advanced-cell" title="珍珠广告">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlAd"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="珍珠收获">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlHarvest"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="珍珠抽奖">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlDraw"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>

        <!-- 土地相关配置 -->
        <div class="subsection-title">土地</div>
        <van-cell class="advanced-cell" title="视频加速">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.land.autoSpeedAd"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="自动加速卡">
          <template #right-icon>
            <van-switch
              v-model="localConfig.ad.land.autoSpeedCard"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <div class="indent" v-if="localConfig.ad.land.autoSpeedCard">
          <van-cell class="advanced-cell" label="只加速收获时间大于N分钟的土地">
            <template #title>
              <span>加速限制</span>
            </template>
            <custom-array-stepper
              :min="0"
              :max="600"
              :step="30"
              v-model="localConfig.ad.land.minHarvestGap"
              @change="onConfigChange"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>
          <van-cell class="advanced-cell" title="保留加速卡" label="加速卡太少就不使用了">
            <custom-array-stepper
              :min="0"
              :max="10000"
              :step="30"
              v-model="localConfig.ad.land.minSpeedCard"
              @change="onConfigChange"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>
        </div>
        <!-- 主要功能配置 -->
        <div class="subsection-title">其他功能</div>
        <van-cell class="advanced-cell" title="主线剧情">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoStory" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="免费钻石礼包">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoShopAd" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="视频双倍">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoAdExpired" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="排行榜点赞">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoLike" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="深海寻宝">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoWelfare" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="随机小动物互动">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoRandEvent" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="每日签到">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoSign" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="自动分享">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoShare" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="培育广告加速">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoFosterAd" size="24" @change="onConfigChange" />
          </template>
        </van-cell>

        <van-cell class="advanced-cell" title="反诈骗奖励">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.antoAntiFraud" size="24" @change="onConfigChange" />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" title="邮件奖励">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoMail" size="24" @change="onConfigChange" />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" title="宝箱奖励" label="订单、日常达到对应目标的奖励">
          <template #right-icon>
            <van-switch v-model="localConfig.ad.autoBox" size="24" @change="onConfigChange" />
          </template>
        </van-cell>
      </div>
    </div>
  </div>

  <!-- 时间选择器弹窗 -->
  <van-popup v-model:show="showTimeSelect" round position="bottom" class="custom-popup">
    <div class="popup-header">
      <span class="popup-title">{{
        timeSelectType === 'start' ? '选择开始时间' : '选择结束时间'
      }}</span>
    </div>
    <van-time-picker
      :formatter="formatter"
      @confirm="confirmTime"
      @cancel="cancelTime"
      class="custom-time-picker"
    />
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'

// 接收父组件传递的props
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  expandStates: {
    type: Object,
    required: true,
  },
})

// 定义emit事件
const emit = defineEmits(['update:config', 'update-expand-states'])

// 创建本地配置副本
const localConfig = ref({})

// 时间选择相关状态
const showTimeSelect = ref(false)
const timeSelectType = ref('start')

// 监听props.config的变化，同步到本地配置
watch(
  () => props.config,
  (newConfig) => {
    // 深拷贝配置对象
    localConfig.value = JSON.parse(JSON.stringify(newConfig))
  },
  { deep: true, immediate: true },
)

// 时间格式化器
const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
}

// 切换展开状态 - 修复函数
const toggleExpand = (key) => {
  // 创建一个新的展开状态对象，翻转对应键的状态
  const newExpandStates = { ...props.expandStates }
  newExpandStates[key] = !newExpandStates[key]

  // 触发更新事件，让父组件更新状态
  emit('update-expand-states', newExpandStates)
}

// 确认选择时间
const confirmTime = ({ selectedValues }) => {
  const timestamp = (selectedValues[0] * 60 * 60 + selectedValues[1] * 60) * 1000

  if (timeSelectType.value === 'start') {
    localConfig.value.ad.startTime = timestamp
  } else {
    localConfig.value.ad.endTime = timestamp
  }

  onConfigChange()
  showTimeSelect.value = false
}

// 取消选择时间
const cancelTime = () => {
  showTimeSelect.value = false
}

// 配置变更处理
const onConfigChange = () => {
  emit('update:config', localConfig.value)
}

// 根据游戏ID动态生成功能描述
const adFeatureLabel = computed(() => {
  if (props.user.gameId === 1) {
    return '自动领取所有广告奖励、转盘奖励、活动水滴、剧情奖励等'
  } else if (props.user.gameId === 2) {
    return '自动领取所有广告、分享、转盘奖励、任务奖励等'
  } else {
    return '自动领取各类奖励'
  }
})
</script>

<style scoped>
.ad-config-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ad-advanced-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  margin: 20px 0 12px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  margin-right: 8px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #5cadff;
  margin: 16px 0 8px;
  padding-left: 8px;
  border-left: 3px solid #5cadff;
}

.time-picker-container {
  display: flex;
  align-items: center;
}

.time-display {
  padding: 4px 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
  cursor: pointer;
}

.feature-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.feature-cell {
  background-color: transparent;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.card-content {
  padding: 16px 20px;
  background: var(--van-cell-background);
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #7f8c8d;
}

.rotate-180 {
  transform: rotate(180deg);
}

.indent {
  position: relative !important;
  padding-left: 14px !important;
  margin-left: 4px !important;
}

:deep(.indent::before) {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  height: 100% !important;
  width: 2px !important;

  background-image: repeating-linear-gradient(
    to bottom,
    #eaeaea 0px,
    #eaeaea 6px,
    transparent 6px,
    transparent 12px
  ) !important;

  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
}

.custom-popup {
  border-radius: 20px 20px 0 0;
  padding: 0;
  overflow: hidden;
}

.popup-header {
  padding: 20px 24px 16px;
  background: linear-gradient(to right, #fff5f5, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.custom-time-picker {
  padding: 0 20px 20px;
}
</style>
