<!-- components/OtherFeatures.vue -->
<template>
  <div class="config-card other-features-card">
    <div class="card-header" @click="toggleExpand('otherFeatures')">
      <van-icon name="apps-o" size="20" color="#722ed1" />
      <span class="card-title">更多功能</span>
      <van-icon
        name="arrow-down"
        size="16"
        :class="{ 'rotate-180': expandStates.otherFeatures }"
        class="expand-icon"
      />
    </div>
    <div class="card-content" v-show="expandStates.otherFeatures">
      <div class="section-title">
        <van-icon name="list" size="16" color="#8c8c8c" />
        <span>高级功能</span>
      </div>

      <!-- 有详细配置的功能区域 -->
      <div class="advanced-features">
        <van-cell class="feature-cell" center label="鲜花自动升级">
          <template #title>
            <div class="feature-icon-text">
              <span class="feature-title">自动鲜花升级</span>
            </div>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.flowerUp.status"
              size="24"
            />
          </template>
        </van-cell>

        <!-- 鲜花升级配置区域 -->
        <div
          v-if="currentUser?.gameId == 2 && localConfig.other.flowerUp.status"
          class="indent flower-up-advanced-section"
        >
          <van-cell class="advanced-cell" title="等级限制" label="高于该等级，不再升级">
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.flowerUp.maxLevel"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>
          <van-cell class="advanced-cell" title="保留金币数（万）" label="到低于该金币数，不再升级">
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.flowerUp.minGold"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>
        </div>

        <van-cell class="feature-cell" center label="自动提交皇室特供">
          <template #title>
            <div class="feature-icon-text">
              <span class="feature-title">自动皇室特供</span>
            </div>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.palace.status"
              size="24"
            />
          </template>
        </van-cell>
        <!-- 皇室特供配置区域 -->
        <div
          v-if="currentUser?.gameId == 2 && localConfig.other.palace.status"
          class="indent flower-up-advanced-section"
        >
          <van-cell class="advanced-cell" title="每日提交次数" label="每天提交次数上限">
            <custom-array-stepper
              :min="0"
              :step="1"
              :max="3"
              v-model="localConfig.other.palace.num"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>

          <van-cell
            class="advanced-cell"
            title="刷新次数"
            label="每日总刷新次数，1为仅使用免费刷新"
          >
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.palace.refreshNum"
              :inputDisabled="false"
              class="steal-stepper"
            >
            </custom-array-stepper>
          </van-cell>

          <van-cell class="advanced-cell" title="自动种植" label="开启后会主动种植缺少的鲜花">
            <template #right-icon>
              <van-switch
                :disabled="!localConfig"
                v-model="localConfig.other.palace.autoPlant"
                size="24"
              />
            </template>
          </van-cell>

          <QualityColorSelector v-model="localConfig.other.palace.color" title="提交品质选择" />
        </div>

        <!-- 星灵派遣 -->
        <van-cell class="feature-cell" center label="星灵相关，会自动申请协助但不会领取哦">
          <template #title>
            <div class="feature-icon-text">
              <span class="feature-title">星灵派遣</span>
            </div>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.elves.status"
              size="24"
            />
          </template>
        </van-cell>

        <div
          v-if="currentUser?.gameId == 2 && localConfig.other.elves.status"
          class="indent flower-up-advanced-section"
        >
          <van-cell class="advanced-cell" title="自动协助" label="自动协助好友星灵">
            <template #right-icon>
              <van-switch
                :disabled="!localConfig"
                v-model="localConfig.other.elves.autoHelp"
                size="24"
              />
            </template>
          </van-cell>
          <van-cell class="advanced-cell" title="自动派遣" label="优先派遣当周双倍星灵">
            <template #right-icon>
              <van-switch
                :disabled="!localConfig"
                v-model="localConfig.other.elves.autoDispatch"
                size="24"
              />
            </template>
          </van-cell>
          <div
            v-if="currentUser?.gameId == 2 && localConfig.other.elves.autoDispatch"
            class="indent flower-up-advanced-section"
          >
            <van-cell class="advanced-cell" title="派遣数量" label="单个位置派遣数量">
              <custom-array-stepper
                :min="0"
                :step="1"
                :max="12"
                v-model="localConfig.other.elves.dispatchNum"
                :inputDisabled="false"
                class="steal-stepper"
              >
              </custom-array-stepper>
            </van-cell>
            <van-cell
              class="advanced-cell"
              v-show="localConfig.other.elves.autoDispatch"
              title="只派双倍"
              label="只派遣当周双倍的星灵"
            >
              <template #right-icon>
                <van-switch
                  :disabled="!localConfig"
                  v-model="localConfig.other.elves.onlyDouble"
                  size="24"
                />
              </template>
            </van-cell>
            <van-cell
              class="advanced-cell"
              title="临期加速（有问题，请勿开启）"
              label="当派遣结束时间跨周且为当周双倍时，自动加速"
            >
              <template #right-icon>
                <van-switch
                  :disabled="!localConfig || true"
                  v-model="localConfig.other.elves.speedUpDouble"
                  size="24"
                />
              </template>
            </van-cell>
          </div>
        </div>

        <!-- 鲜花培育配置区域 -->
        <van-cell class="feature-cell" center label="自动培育、视频加速、求助、分享">
          <template #title>
            <div class="feature-icon-text">
              <span class="feature-title">自动鲜花培育</span>
            </div>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.foster.status"
              size="24"
            />
          </template>
        </van-cell>

        <div
          v-if="currentUser?.gameId == 2 && localConfig.other.foster.status"
          class="indent flower-up-advanced-section"
        >
          <QualityColorSelector v-model="localConfig.other.foster.color" title="培育品质选择" />
        </div>
      </div>

      <!-- 自动任务 -->
      <van-cell class="feature-cell" center label="任务相关配置">
        <template #title>
          <div class="feature-icon-text">
            <span class="feature-title">自动任务</span>
          </div>
        </template>
        <template #right-icon>
          <van-switch :disabled="!localConfig" v-model="localConfig.other.task.status" size="24" />
        </template>
      </van-cell>

      <div v-if="localConfig.other.task.status" class="indent flower-up-advanced-section">
        <div class="subsection-title">主线任务</div>
        <van-cell class="advanced-cell" title="自动领取" label="自动领取主线奖励">
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.main.status"
              size="24"
            />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" title="自动完成" label="自动完成主线任务">
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.main.autoComplete"
              size="24"
            />
          </template>
        </van-cell>
        <div class="subsection-title">日常任务</div>
        <van-cell class="advanced-cell" title="自动领取" label="自动领取日常奖励">
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.daily.status"
              size="24"
            />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" title="自动完成" label="自动完成日常任务">
          <template #right-icon>
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.daily.autoComplete"
              size="24"
            />
          </template>
        </van-cell>
      </div>

      <!-- 分割线 -->
      <div class="divider-line"></div>

      <!-- 只有开关的功能区域 -->
      <div class="basic-features-grid">
        <div class="section-title">
          <van-icon name="list" size="16" color="#8c8c8c" />
          <span>基础功能</span>
        </div>

        <!-- 第一行功能 -->
        <div class="feature-item">
          <div class="feature-icon">
            <cute-icon name="shelf" size="16" color="#63B8FF" />
          </div>
          <div class="feature-info">
            <div class="feature-name">
              自动{{
                currentUser?.gameId == 1 ? '摆台' : currentUser?.gameId == 2 ? '售卖花艺' : '未知'
              }}
            </div>
            <div class="feature-desc">仓库由多到少自动售卖</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoSell" size="22" />
        </div>

        <!-- 第二行功能 -->
        <div class="feature-item" v-if="currentUser?.gameId == 1">
          <div class="feature-icon">
            <van-icon name="fire-o" size="20" color="#36cfc9" />
          </div>
          <div class="feature-info">
            <div class="feature-name">培育忘忧树</div>
            <div class="feature-desc">自动培育最高数量道具</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoCultivate" size="22" />
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <cute-icon name="cart" size="16" color="#B388EB" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动买商店</div>
            <div class="feature-desc">
              {{
                currentUser?.gameId == 1 ? '培育' : currentUser?.gameId == 2 ? '材料' : '未知'
              }}商店自动购买
            </div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoShop" size="22" />
        </div>

        <div class="feature-item" v-if="currentUser?.gameId == 1">
          <div class="feature-icon">
            <van-icon name="aim" size="20" color="#ff7a45" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动打地鼠</div>
            <div class="feature-desc">每日上限50次</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoMonster" size="22" />
        </div>

        <!-- 第三行功能 -->
        <div class="feature-item">
          <div class="feature-icon">
            <cute-icon name="shell" size="16" color="#E0BBE4" />
          </div>
          <div class="feature-info">
            <div class="feature-name">
              {{
                currentUser?.gameId == 1
                  ? '自动抓花农'
                  : currentUser?.gameId == 2
                    ? '自动珍珠雇佣'
                    : '未知'
              }}
            </div>
            <div class="feature-desc">随机抓捕推荐玩家</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoRob" size="22" />
        </div>

        <div class="feature-item" v-if="currentUser?.userName == null">
          <div class="feature-icon">
            <van-icon name="medal-o" size="20" color="#b71de8" />
          </div>
          <div class="feature-info">
            <div class="feature-name">更好的游戏</div>
            <div class="feature-desc">VIP功能/免广告</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.betterGame" size="22" />
        </div>

        <div class="feature-item" v-if="currentUser?.gameId == 1">
          <div class="feature-icon">
            <van-icon name="certificate" size="20" color="#5cadff" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动小游戏</div>
            <div class="feature-desc">完成活动游戏任务</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoGame" size="22" />
        </div>
        <div class="feature-item" v-if="currentUser?.gameId == 1">
          <div class="feature-icon">
            <van-icon name="play-circle-o" size="20" color="#5cadff" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动领取</div>
            <div class="feature-desc">领取所有广告奖励、转盘奖励、活动水滴'</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoAd" size="22" />
        </div>

        <div class="feature-item" v-if="currentUser?.gameId == 2">
          <div class="feature-icon">
            <cute-icon name="pet" size="16" color="#FF85A2" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动喂养宠物</div>
            <div class="feature-desc">自动抚摸、购买宠物粮、喂养宠物</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.other.autoPet" size="22" />
        </div>
        <div class="feature-item" v-if="currentUser?.gameId == 2">
          <div class="feature-icon">
            <cute-icon name="grid" size="16" color="#C0C0C0" />
          </div>
          <div class="feature-info">
            <div class="feature-name">自动开土地</div>
            <div class="feature-desc">自动开符合条件的土地</div>
          </div>
          <van-switch :disabled="!localConfig" v-model="localConfig.other.autoOpenLand" size="22" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import CuteIcon from '@/components/CuteIcon.vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import QualityColorSelector from './QualityColorSelector.vue'

// 定义props
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

// 定义emits
const emit = defineEmits(['update:config', 'update:expand-states'])

// 创建本地数据副本
const localConfig = ref({})

// 同步props到本地数据的函数
const syncLocalConfig = (newConfig) => {
  localConfig.value = JSON.parse(JSON.stringify(newConfig))
}

// 初始化数据
syncLocalConfig(props.config)

// 监听props变化，同步到本地数据（使用immediate防止初始化时的递归）
watch(
  () => props.config,
  (newConfig) => {
    // 只有当本地数据与新配置不同时才更新
    if (JSON.stringify(localConfig.value) !== JSON.stringify(newConfig)) {
      syncLocalConfig(newConfig)
    }
  },
  { deep: true, flush: 'pre' },
)

// 防止递归更新的标志
let isUpdatingFromChild = false

// 监听本地数据变化，触发更新事件
watch(
  localConfig,
  (newConfig) => {
    // 如果是props变化引起的更新，则跳过
    if (!isUpdatingFromChild) {
      isUpdatingFromChild = true
      emit('update:config', newConfig)
      // 在下一个tick重置标志
      nextTick(() => {
        isUpdatingFromChild = false
      })
    }
  },
  { deep: true },
)

// 计算属性
const currentUser = computed(() => props.user)

// 方法
const toggleExpand = (key) => {
  const newExpandStates = { ...props.expandStates, [key]: !props.expandStates[key] }
  emit('update:expand-states', newExpandStates)
}

// 引入nextTick
import { nextTick } from 'vue'
</script>

<style scoped>
.config-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.config-card:active {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.card-content {
  padding: 16px 20px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 有详细配置的功能区域样式 */
.advanced-features {
  margin-bottom: 16px;
}

.feature-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  background-color: transparent;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.feature-icon-text {
  display: flex;
  align-items: center;
}

/* 配置区域样式 */
.flower-up-advanced-section {
  margin-top: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 6px;
  margin-top: 12px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #5cadff;
  margin: 16px 0 8px;
  padding-left: 8px;
  border-left: 3px solid #5cadff;
}

.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.advanced-cell:last-child {
  border-bottom: none;
}

.steal-stepper {
  width: 100px;
}

/* 基础功能网格样式 */
.basic-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 12px;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 分割线样式 */
.divider-line {
  height: 1px;
  background-color: #f0f0f0;
  margin: 16px 0;
  width: 100%;
}

/* 缩进样式 */
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

/* 响应式适配 */
@media (max-width: 375px) {
  .basic-features-grid {
    grid-template-columns: 1fr;
  }

  .feature-item.full-width {
    width: 100%;
  }

  .config-item-row {
    align-items: flex-start;
    gap: 8px;
  }

  .config-item-col {
    width: 100%;
    margin-right: 0;
  }

  .action-col {
    align-self: flex-end;
  }
}
</style>
