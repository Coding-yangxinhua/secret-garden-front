<!-- AutoAdConfig.vue - 自动领取配置组件 -->
<template>
  <div class="ad-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="ad-slash" size="20" color="#5cadff" />
      <span class="apple-card-title">自动领取</span>
    </div>
    <div class="apple-card-content">
      <!-- 功能描述行 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动领取功能</div>
          <div class="apple-cell-label">{{ adFeatureLabel }}</div>
        </div>
        <div class="apple-cell-right"></div>
      </div>

      <!-- 水滴相关配置 -->
      <div class="apple-sub-section" style="margin-top: 12px">
        <div class="apple-sub-header">
          <van-icon name="underway-o" size="14" color="#86868B" />
          <span>水滴</span>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">定时水滴</div>
            <div class="apple-cell-label">定时领取水滴广告</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.water.autoWaterAd"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">水桶领取</div>
            <div class="apple-cell-label">自动领取水桶中的水滴</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.water.autoWater"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>

        <div v-if="localConfig.ad.water.autoWater" class="apple-sub-section apple-indent">
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">水桶领取数量</div>
              <div class="apple-cell-label">高于此数量将不再领取</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="60"
                :step="10"
                v-model="localConfig.ad.water.maxWaterNum"
                :inputDisabled="false"
                class="apple-stepper-wrap"
                @change="onConfigChange"
              />
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">按需领取</div>
              <div class="apple-cell-label">只有浇水时水滴不够才领取</div>
            </div>
            <div class="apple-cell-right">
              <van-switch
                v-model="localConfig.ad.water.lackGet"
                size="22"
                @change="onConfigChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 珍珠相关配置 -->
      <div v-if="props.user.gameId === 2" class="apple-sub-section">
        <div class="apple-sub-header">
          <van-icon name="gem-o" size="14" color="#86868B" />
          <span>珍珠</span>
        </div>

        <div v-if="[2, 3].includes(props.user.gameId)" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">珍珠广告</div>
            <div class="apple-cell-label">自动领取珍珠广告奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlAd"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">珍珠收获</div>
            <div class="apple-cell-label">自动收获珍珠</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlHarvest"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">珍珠抽奖</div>
            <div class="apple-cell-label">自动参与珍珠抽奖</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.pearl.autoPearlDraw"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>
      </div>

      <!-- 土地相关配置 -->
      <div v-if="props.user.gameId === 2" class="apple-sub-section">
        <div class="apple-sub-header">
          <van-icon name="location-o" size="14" color="#86868B" />
          <span>土地</span>
        </div>
        <!-- 恢复：自动加速卡开关（之前被意外移除） -->
        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">视频加速</div>
            <div class="apple-cell-label">观看视频加速土地收获</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.land.autoSpeedAd"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>
        <div v-if="localConfig.ad.land.autoSpeedAd" class="apple-sub-section apple-indent">
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">加速类型</div>
              <div class="apple-cell-label">只加速对应条件的花</div>
            </div>
            <div class="apple-cell-right">
              <!-- 使用与 PlantConfig 一致的分段控制样式 -->
              <div class="apple-segment" role="tablist" aria-label="视频加速选项">
                <button
                  v-for="opt in [
                    { text: '所有花', value: 0 },
                    { text: '竞赛花', value: 1 }
                  ]"
                  :key="opt.value"
                  class="apple-segment-btn"
                  :class="{ active: localConfig.ad.land.autoSpeedMode === opt.value }"
                  @click="setAutoSpeedMode(opt.value)"
                >
                  {{ opt.text }}
                </button>
              </div>
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">加速限制</div>
              <div class="apple-cell-label">只加速收获时间大于 N 分钟的土地</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="600"
                :step="30"
                v-model="localConfig.ad.land.minAdHarvestGap"
                @change="onConfigChange"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">土地限制</div>
              <div class="apple-cell-label">需要加速的土地数少于 N 块就不加速</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="64"
                :step="16"
                v-model="localConfig.ad.land.minAdLand"
                @change="onConfigChange"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
        </div>
        <!-- 恢复：自动加速卡开关（之前被意外移除） -->
        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动加速卡</div>
            <div class="apple-cell-label">使用加速卡加速土地</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              v-model="localConfig.ad.land.autoSpeedCard"
              size="22"
              @change="onConfigChange"
            />
          </div>
        </div>
        <div v-if="localConfig.ad.land.autoSpeedCard" class="apple-sub-section apple-indent">
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">加速限制</div>
              <div class="apple-cell-label">只加速收获时间大于 N 分钟的土地</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="600"
                :step="30"
                v-model="localConfig.ad.land.minHarvestGap"
                @change="onConfigChange"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">保留加速卡</div>
              <div class="apple-cell-label">加速卡太少就不使用了</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="100000"
                :step="30"
                v-model="localConfig.ad.land.minSpeedCard"
                @change="onConfigChange"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 其他功能配置 -->
      <div class="apple-sub-section">
        <div class="apple-sub-header">
          <van-icon name="more-o" size="14" color="#86868B" />
          <span>其他功能</span>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">主线剧情</div>
            <div class="apple-cell-label">自动推进主线剧情</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoStory" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">免费钻石礼包</div>
            <div class="apple-cell-label">自动领取免费钻石礼包</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoShopAd" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">视频双倍</div>
            <div class="apple-cell-label">观看视频获得双倍奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoAdExpired" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="[2, 3].includes(props.user.gameId)" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">排行榜点赞</div>
            <div class="apple-cell-label">自动为排行榜好友点赞</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoLike" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">深海寻宝</div>
            <div class="apple-cell-label">自动参与深海寻宝活动</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoWelfare" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">随机小动物互动</div>
            <div class="apple-cell-label">自动与小动物互动</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoRandEvent" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="[2, 3].includes(props.user.gameId)" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">每日签到</div>
            <div class="apple-cell-label">自动完成每日签到</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoSign" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动分享</div>
            <div class="apple-cell-label">自动分享到社交平台</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoShare" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">培育广告加速</div>
            <div class="apple-cell-label">观看广告加速培育</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoFosterAd" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">反诈骗奖励</div>
            <div class="apple-cell-label">自动领取反诈骗奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.antoAntiFraud" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="[2, 3].includes(props.user.gameId)" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">邮件奖励</div>
            <div class="apple-cell-label">自动领取邮件奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoMail" size="22" @change="onConfigChange" />
          </div>
        </div>

        <div v-if="props.user.gameId === 2" class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">宝箱奖励</div>
            <div class="apple-cell-label">订单、日常达到对应目标的奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.ad.autoBox" size="22" @change="onConfigChange" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 🍎 Apple 风格弹窗（teleport 到 body） -->
  <teleport to="body" v-if="showTimeSelect">
    <div class="apple-popup-overlay" @click="cancelTime">
      <div class="apple-popup-sheet" @click.stop>
        <div class="apple-popup-header">
          <span class="apple-popup-title">{{
            timeSelectType === 'start' ? '选择开始时间' : '选择结束时间'
          }}</span>
          <van-icon name="cross" class="apple-popup-close" @click="cancelTime" />
        </div>
        <van-time-picker
          :formatter="formatter"
          @confirm="confirmTime"
          @cancel="cancelTime"
          class="apple-time-picker"
        />
      </div>
    </div>
  </teleport>
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

const toSwitchBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return value === '1' || value === 'true'
  return Boolean(value)
}

const normalizeBooleanSwitches = () => {
  const ad = localConfig.value.ad
  if (!ad) return

  if (ad.water) {
    ad.water.autoWaterAd = toSwitchBoolean(ad.water.autoWaterAd, true)
    ad.water.autoWater = toSwitchBoolean(ad.water.autoWater, true)
    ad.water.lackGet = toSwitchBoolean(ad.water.lackGet, false)
  }
  if (ad.pearl) {
    ad.pearl.autoPearlAd = toSwitchBoolean(ad.pearl.autoPearlAd, true)
    ad.pearl.autoPearlHarvest = toSwitchBoolean(ad.pearl.autoPearlHarvest, false)
    ad.pearl.autoPearlDraw = toSwitchBoolean(ad.pearl.autoPearlDraw, false)
  }
  if (ad.land) {
    ad.land.autoSpeedAd = toSwitchBoolean(ad.land.autoSpeedAd, false)
    ad.land.autoSpeedCard = toSwitchBoolean(ad.land.autoSpeedCard, false)
  }

  ad.autoWelfare = toSwitchBoolean(ad.autoWelfare, true)
  ad.autoStory = toSwitchBoolean(ad.autoStory, true)
  ad.autoShopAd = toSwitchBoolean(ad.autoShopAd, true)
  ad.autoAdExpired = toSwitchBoolean(ad.autoAdExpired, true)
  ad.autoLike = toSwitchBoolean(ad.autoLike, true)
  ad.autoShare = toSwitchBoolean(ad.autoShare, true)
  ad.autoRandEvent = toSwitchBoolean(ad.autoRandEvent, true)
  ad.autoFosterAd = toSwitchBoolean(ad.autoFosterAd, true)
  ad.autoSign = toSwitchBoolean(ad.autoSign, true)
  ad.antoAntiFraud = toSwitchBoolean(ad.antoAntiFraud, true)
  ad.autoMail = toSwitchBoolean(ad.autoMail, false)
  ad.autoBox = toSwitchBoolean(ad.autoBox, false)
}

// 监听props.config的变化，同步到本地配置
watch(
  () => props.config,
  (newConfig) => {
    // 深拷贝配置对象
    localConfig.value = JSON.parse(JSON.stringify(newConfig))
    // 规范化 ad.land.autoSpeedMode
    try {
      if (!localConfig.value.ad) localConfig.value.ad = {}
      if (!localConfig.value.ad.water) {
        localConfig.value.ad.water = {
          autoWaterAd: true,
          autoWater: true,
          maxWaterNum: 60,
          lackGet: false,
        }
      }
      if (!localConfig.value.ad.pearl) {
        localConfig.value.ad.pearl = {
          autoPearlAd: true,
          autoPearlHarvest: false,
          autoPearlDraw: false,
        }
      }
      if (!localConfig.value.ad.land) localConfig.value.ad.land = {}
      normalizeBooleanSwitches()
      // 兼容旧字段：如果存在 autoSpeedAd 布尔，则把 true 映射为 1（所有花），false -> 0
      if (typeof localConfig.value.ad.land.autoSpeedMode === 'undefined') {
        if (typeof localConfig.value.ad.land.autoSpeedAd !== 'undefined') {
          localConfig.value.ad.land.autoSpeedMode = localConfig.value.ad.land.autoSpeedAd ? 1 : 0
        } else {
          // 默认关闭
          localConfig.value.ad.land.autoSpeedMode = 0
        }
      }
    } catch (e) {
      // ignore
    }
  },
  { deep: true, immediate: true },
)

// 新增：设置视频加速模式
const setAutoSpeedMode = (mode) => {
  if (!localConfig.value.ad) localConfig.value.ad = {}
  if (!localConfig.value.ad.land) localConfig.value.ad.land = {}
  localConfig.value.ad.land.autoSpeedMode = mode
  onConfigChange()
}

// 时间格式化器
const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
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
/* ============================================================
   📦 AutoAdConfig — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局），此处仅处理组件特有覆写
   ============================================================ */

/* 卡片容器微调 */
.ad-config-card {
  margin-bottom: 16px;
}

/* 覆盖全局 apple-card 部分 padding，使其更紧凑 */
.ad-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.ad-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* CustomArrayStepper 宽度限制 */
.apple-stepper-wrap {
  width: 108px;
}

/* segmented control - use global apple-card styles for consistency */
.apple-segment {
  display: inline-flex;
  background: var(--apple-bg-secondary);
  border-radius: 8px;
  padding: 2px;
  gap: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.apple-segment-btn {
  padding: 5px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--apple-text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  white-space: nowrap;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.apple-segment-btn.active {
  background: #fff;
  color: var(--apple-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.apple-segment-btn:active {
  opacity: 0.7;
}

/* ============================================================
   🍎 Apple 风格弹窗 — 时间选择器
   对齐 StealConfigModal 的 teleport 弹窗体系
   ============================================================ */

/* 遮罩层 */
.apple-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: appleFadeIn 0.3s ease;
  touch-action: none;
  overscroll-behavior: contain;
}

/* 弹窗内容 — 磨砂玻璃卡片 */
.apple-popup-sheet {
  width: 92%;
  max-width: 400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
  animation: appleSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  overscroll-behavior: contain;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
}

/* 弹窗头部 */
.apple-popup-header {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.08);
  position: relative;
}

.apple-popup-title {
  font-size: 20px;
  font-weight: 630;
  line-height: 1.2;
  letter-spacing: -0.3px;
  color: var(--apple-text-primary, #1d1d1f);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Display', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.apple-popup-close {
  cursor: pointer;
  font-size: 22px;
  color: var(--apple-text-quaternary, #c7c7cc);
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  background: rgba(242, 242, 247, 0.6);
}

.apple-popup-close:active {
  background: rgba(229, 229, 234, 0.8);
  color: #86868b;
}

/* 时间选择器 */
.apple-time-picker {
  padding: 12px 20px 20px;
  --van-time-picker-title-font-size: 17px;
  --van-time-picker-confirm-action-color: var(--apple-text-link, #007aff);
  --van-time-picker-cancel-action-color: var(--apple-text-secondary, #86868b);
  --van-time-picker-option-font-size: 20px;
  --van-time-picker-option-text-color: var(--apple-text-primary, #1d1d1f);
  --van-time-picker-option-selected-text-color: var(--apple-text-primary, #1d1d1f);
}

/* ============================================================
   动画
   ============================================================ */
@keyframes appleFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes appleSlideUp {
  from {
    transform: translateY(20px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
