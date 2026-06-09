<!-- OtherConfig.vue - 更多功能配置组件 -->
<template>
  <div class="other-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="settings" size="20" color="#722ed1" />
      <span class="apple-card-title">更多功能</span>
    </div>
    <div class="apple-card-content">
      <!-- ════════════════════════════════════════════════
           高级功能（带子配置区域）
           ════════════════════════════════════════════════ -->
      <div class="apple-sub-header">
        <van-icon name="star-o" size="14" color="#86868B" />
        <span>高级功能</span>
      </div>

      <!-- ───────── 自动鲜花升级 ───────── -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动鲜花升级</div>
          <div class="apple-cell-label">鲜花自动升级</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.other.flowerUp.status"
            size="22"
          />
        </div>
      </div>

      <div
        v-if="currentUser?.gameId == 2 && localConfig.other.flowerUp.status"
        class="apple-sub-section apple-indent"
      >
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">等级限制</div>
            <div class="apple-cell-label">高于该等级，不再升级</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.flowerUp.maxLevel"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">保留金币数（万）</div>
            <div class="apple-cell-label">低于该金币数，不再升级</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.flowerUp.minGold"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
      </div>

      <!-- ───────── 自动皇室特供 ───────── -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动皇室特供</div>
          <div class="apple-cell-label">自动提交皇室特供</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.other.palace.status"
            size="22"
          />
        </div>
      </div>

      <div
        v-if="currentUser?.gameId == 2 && localConfig.other.palace.status"
        class="apple-sub-section apple-indent"
      >
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">每日提交次数</div>
            <div class="apple-cell-label">每天提交次数上限</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="1"
              :max="3"
              v-model="localConfig.other.palace.num"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">刷新次数</div>
            <div class="apple-cell-label">每日总刷新次数，1为仅使用免费刷新</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="1"
              v-model="localConfig.other.palace.refreshNum"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动种植</div>
            <div class="apple-cell-label">开启后会主动种植缺少的鲜花</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.palace.autoPlant"
              size="22"
            />
          </div>
        </div>
        <QualityColorSelector v-model="localConfig.other.palace.color" title="提交品质选择" />
      </div>

      <!-- ───────── 星灵派遣 ───────── -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">星灵派遣</div>
          <div class="apple-cell-label">星灵相关，会自动申请协助但不会领取哦</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.other.elves.status" size="22" />
        </div>
      </div>

      <div
        v-if="currentUser?.gameId == 2 && localConfig.other.elves.status"
        class="apple-sub-section apple-indent"
      >
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动协助</div>
            <div class="apple-cell-label">自动协助好友星灵</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.elves.autoHelp"
              size="22"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动派遣</div>
            <div class="apple-cell-label">优先派遣当周双倍星灵</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.elves.autoDispatch"
              size="22"
            />
          </div>
        </div>

        <div
          v-if="currentUser?.gameId == 2 && localConfig.other.elves.autoDispatch"
          class="apple-sub-section"
        >
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">派遣数量</div>
              <div class="apple-cell-label">单个位置派遣数量</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :step="1"
                :max="12"
                v-model="localConfig.other.elves.dispatchNum"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">只派双倍</div>
              <div class="apple-cell-label">只派遣当周双倍的星灵</div>
            </div>
            <div class="apple-cell-right">
              <van-switch
                :disabled="!localConfig"
                v-model="localConfig.other.elves.onlyDouble"
                size="22"
              />
            </div>
          </div>
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">临期加速（有问题，请勿开启）</div>
              <div class="apple-cell-label">当派遣结束时间跨周且为当周双倍时，自动加速</div>
            </div>
            <div class="apple-cell-right">
              <van-switch
                :disabled="!localConfig || true"
                v-model="localConfig.other.elves.speedUpDouble"
                size="22"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ───────── 自动鲜花培育 ───────── -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动鲜花培育</div>
          <div class="apple-cell-label">自动培育、视频加速、求助、分享</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.other.foster.status"
            size="22"
          />
        </div>
      </div>

      <div
        v-if="currentUser?.gameId == 2 && localConfig.other.foster.status"
        class="apple-sub-section apple-indent"
      >
        <QualityColorSelector v-model="localConfig.other.foster.color" title="培育品质选择" />
      </div>

      <!-- ───────── 自动任务 ───────── -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动任务</div>
          <div class="apple-cell-label">任务相关配置</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.other.task.status" size="22" />
        </div>
      </div>

      <div v-if="localConfig.other.task.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="flag-o" size="14" color="#86868B" />
          <span>主线任务</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动领取</div>
            <div class="apple-cell-label">自动领取主线奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.main.status"
              size="22"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动完成</div>
            <div class="apple-cell-label">自动完成主线任务</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.main.autoComplete"
              size="22"
            />
          </div>
        </div>

        <div class="apple-sub-header" style="margin-top: 10px">
          <van-icon name="clock-o" size="14" color="#86868B" />
          <span>日常任务</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动领取</div>
            <div class="apple-cell-label">自动领取日常奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.daily.status"
              size="22"
            />
          </div>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动完成</div>
            <div class="apple-cell-label">自动完成日常任务</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.other.task.daily.autoComplete"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════
           基础功能（纯开关列表）
           ════════════════════════════════════════════════ -->
      <div class="apple-sub-header" style="margin-top: 16px">
        <van-icon name="list" size="14" color="#86868B" />
        <span>基础功能</span>
      </div>

      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">
            自动{{
              currentUser?.gameId == 1 ? '摆台' : currentUser?.gameId == 2 ? '售卖花艺' : '未知'
            }}
          </div>
          <div class="apple-cell-label">仓库由多到少自动售卖</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoSell" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 1">
        <div class="apple-cell-left">
          <div class="apple-cell-title">培育忘忧树</div>
          <div class="apple-cell-label">自动培育最高数量道具</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoCultivate" size="22" />
        </div>
      </div>

      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动买商店</div>
          <div class="apple-cell-label">
            {{
              currentUser?.gameId == 1 ? '培育' : currentUser?.gameId == 2 ? '材料' : '未知'
            }}商店自动购买
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoShop" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 1">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动打地鼠</div>
          <div class="apple-cell-label">每日上限50次</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoMonster" size="22" />
        </div>
      </div>

      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">
            {{
              currentUser?.gameId == 1
                ? '自动抓花农'
                : currentUser?.gameId == 2
                  ? '自动珍珠雇佣'
                  : '未知'
            }}
          </div>
          <div class="apple-cell-label">随机抓捕推荐玩家</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoRob" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.userName == null">
        <div class="apple-cell-left">
          <div class="apple-cell-title">更好的游戏</div>
          <div class="apple-cell-label">VIP功能/免广告</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.betterGame" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 1">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动小游戏</div>
          <div class="apple-cell-label">完成活动游戏任务</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoGame" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 1">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动领取</div>
          <div class="apple-cell-label">领取所有广告奖励、转盘奖励、活动水滴</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoAd" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动喂养宠物</div>
          <div class="apple-cell-label">自动抚摸、购买宠物粮、喂养宠物</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.other.autoPet" size="22" />
        </div>
      </div>

      <div class="apple-cell" v-if="currentUser?.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动开土地</div>
          <div class="apple-cell-label">自动开符合条件的土地</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.other.autoOpenLand" size="22" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
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

// 引入nextTick
import { nextTick } from 'vue'
</script>

<style scoped>
/* ============================================================
   🧩 OtherConfig — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局），此处仅处理组件特有覆写
   ============================================================ */

/* 卡片容器微调 */
.other-config-card {
  margin-bottom: 16px;
}

/* 覆盖全局 apple-card 部分 padding，使其更紧凑 */
.other-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.other-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* CustomArrayStepper 宽度限制 */
.apple-stepper-wrap {
  width: 108px;
}

/* 子分区内嵌套子分区 */
.apple-sub-section .apple-sub-section {
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>
