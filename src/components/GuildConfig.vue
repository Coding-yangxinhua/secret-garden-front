<template>
  <div class="guild-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="bank" size="20" color="#52c41a" />
      <span class="apple-card-title">{{ currentUser.gameId == 1 ? '社团功能' : '公会功能' }}</span>
    </div>
    <div class="apple-card-content">
      <!-- 捐献/建设 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">
            {{ currentUser.gameId == 1 ? '社团捐献' : '公会建设' }}
          </div>
          <div class="apple-cell-label">自动捐献指定资源</div>
        </div>
        <div class="apple-cell-right">
          <div class="apple-segment">
            <button
              v-for="opt in currentUser.gameId == 1 ? donateOptions : dsDonateOptions"
              :key="opt.value"
              class="apple-segment-btn"
              :class="{ active: localConfig.autoDonate === opt.value }"
              @click="localConfig.autoDonate = opt.value"
            >
              {{ opt.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 公会种植开关 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">
            {{ currentUser.gameId == 1 ? '社团收获' : '公会种植' }}
          </div>
          <div class="apple-cell-label">
            {{ currentUser.gameId == 1 ? '自动收获社团花盆' : '自动收获公会土地' }}
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.club.clubPlant.status"
            size="22"
          />
        </div>
      </div>

      <!-- 种植详细配置（子分区） -->
      <div
        v-show="localConfig.club.clubPlant.status == 1 && currentUser.gameId == 2"
        class="apple-sub-section apple-indent"
      >
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>种植配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动种植</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!localConfig"
              v-model="localConfig.club.clubPlant.autoPlant"
              size="22"
            />
          </div>
        </div>

        <div v-show="localConfig.club.clubPlant.autoPlant" class="apple-sub-section">
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">等级限制</div>
              <div class="apple-cell-label">升级到此等级就不再种植</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="1"
                :max="20"
                :step="1"
                v-model="localConfig.club.clubPlant.level"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>

          <QualityColorSelector v-model="localConfig.club.clubPlant.color" title="种植品质选择" />
        </div>
      </div>

      <!-- 视频捐献/建设 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">
            {{ currentUser.gameId == 1 ? '视频捐献' : '视频建设' }}
          </div>
          <div class="apple-cell-label">
            {{ currentUser.gameId == 1 ? '自动观看社团广告获取奖励' : '自动进行视频建设' }}
          </div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoGuildAd" size="22" />
        </div>
      </div>

      <!-- 公会协助 -->
      <div class="apple-cell" v-if="currentUser.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">公会协助</div>
          <div class="apple-cell-label">自动协助公会成员</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoHelp" size="22" />
        </div>
      </div>

      <!-- 公会红包 -->
      <div class="apple-cell" v-if="currentUser.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">公会红包</div>
          <div class="apple-cell-label">自动抢公会红包</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.activity.hd54.status"
            size="22"
          />
        </div>
      </div>

      <!-- 公会竞赛 -->
      <div class="apple-cell" v-if="currentUser.gameId == 2">
        <div class="apple-cell-left">
          <div class="apple-cell-title">公会竞赛</div>
          <div class="apple-cell-label">自动参加公会竞赛</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!localConfig" v-model="localConfig.autoRace" size="22" />
        </div>
      </div>

      <!-- 竞赛详细配置（子分区） -->
      <div v-show="localConfig.autoRace" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>竞赛配置</span>
        </div>

        <!-- ① 特殊任务类型 -->
        <div class="apple-cell" style="padding-bottom: 2px">
          <div class="apple-cell-left">
            <div class="apple-cell-title">特殊任务类型</div>
            <div class="apple-cell-label">特殊情况下的任务接取规则配置</div>
          </div>
        </div>
        <RaceTaskSelector
          :accept-type-options="acceptTypeOptions"
          :accepts="localConfig.race.accepts"
          :tasks="[]"
          :task-statuses="{}"
          @update:accepts="(v) => (localConfig.race.accepts = v)"
          @update:task-statuses="() => {}"
        />

        <!-- ② 积分配置 -->
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">竞赛积分</div>
            <div class="apple-cell-label">低于该积分的任务不会接取, -1为不接取竞赛任务</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="-1"
              :max="60"
              v-model="localConfig.race.racePoint"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">原金积分</div>
            <div class="apple-cell-label">
              低于该积分的系统升级任务不会接（30分的任务显示为60分）, -1为不接取原金
            </div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="-1"
              :max="60"
              v-model="localConfig.race.highPoint"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">升级任务积分</div>
            <div class="apple-cell-label">达到此积分自动升级，-1为不升级</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="-1"
              :max="30"
              v-model="localConfig.race.upPoint"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">购买任务次数</div>
            <div class="apple-cell-label">自动购买指定次数</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :max="6"
              v-model="localConfig.race.buyCount"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">删除任务</div>
            <div class="apple-cell-label">自动删除不高于此积分</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :max="25"
              v-model="localConfig.race.deletePoint"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动放弃</div>
            <div class="apple-cell-label">无法完成且没有进度的任务自动放弃</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.race.abandon" size="22" />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动加速</div>
            <div class="apple-cell-label">鲜花任务自动使用加速卡</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.race.autoSpeedCard" size="22" />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动开宝箱</div>
            <div class="apple-cell-label">自动开启竞赛宝箱</div>
          </div>
          <div class="apple-cell-right">
            <van-switch v-model="localConfig.race.autoOpenBox" size="22" />
          </div>
        </div>

        <!-- ③ 收获鲜花 -->
        <div class="apple-sub-header" style="margin-top: 16px">
          <van-icon name="flower-o" size="14" color="#86868B" />
          <span>收获鲜花</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">收获鲜花</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :model-value="getTaskStatus(20046)"
              @change="toggleTaskStatus(20046)"
              size="22"
            />
          </div>
        </div>
        <div v-if="getTaskStatus(20046)" class="apple-flower-select-wrap">
          <FlowerSelect
            v-model="localConfig.race.flowerIds"
            :game-id="2"
            placeholder="可选择指定接取的鲜花"
          />
        </div>

        <!-- ④ 任务配置 -->
        <div class="apple-sub-header" style="margin-top: 16px">
          <van-icon name="list-o" size="14" color="#86868B" />
          <span>任务配置 — 优先接取积分更高的任务</span>
        </div>
        <RaceTaskSelector
          :accept-type-options="[]"
          :accepts="[]"
          :tasks="normalTaskList"
          :task-statuses="computedTaskStatuses"
          @update:accepts="() => {}"
          @update:task-statuses="onTaskStatusesChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch, nextTick } from 'vue'
import CustomArrayStepper from './CustomArrayStepper.vue'
import FlowerSelect from './FlowerSelect.vue'
import QualityColorSelector from './QualityColorSelector.vue'
import RaceTaskSelector from './RaceTaskSelector.vue'

const props = defineProps({
  user: { type: Object, required: true },
  config: { type: Object, required: true },
  expandStates: { type: Object, required: true },
})
const emit = defineEmits(['update:config', 'update-expand-states'])

const localConfig = ref({})
const syncLocalConfig = (newConfig) => {
  localConfig.value = JSON.parse(JSON.stringify(newConfig))
  if (!localConfig.value.race.flowerIds) localConfig.value.race.flowerIds = []
}
syncLocalConfig(props.config)

watch(
  () => props.config,
  (newConfig) => {
    if (JSON.stringify(localConfig.value) !== JSON.stringify(newConfig)) syncLocalConfig(newConfig)
  },
  { deep: true, flush: 'pre' },
)

let isUpdatingFromChild = false
watch(
  localConfig,
  (newConfig) => {
    if (!isUpdatingFromChild) {
      isUpdatingFromChild = true
      emit('update:config', newConfig)
      nextTick(() => (isUpdatingFromChild = false))
    }
  },
  { deep: true },
)

// 配置项
const donateOptions = [
  { text: '关闭', value: 0 },
  { text: '5000金币', value: 1 },
  { text: '20000金币', value: 2 },
  { text: '10玉石', value: 3 },
]
const dsDonateOptions = [
  { text: '关闭', value: 0 },
  { text: '金币建设', value: 2 },
  { text: '钻石建设', value: 3 },
]
const acceptTypeOptions = [
  { text: '自己升级的任务', value: 2 },
  { text: '他人升级的任务', value: 3 },
  { text: '已有进度的任务', value: 1 },
]

// 普通任务列表（排除收获鲜花）
const normalTaskList = [
  { id: 2005, title: '材料商店购买' },
  { id: 20003, title: '培育鲜花' },
  { id: 20007, title: '顾客订单' },
  { id: 20009, title: '居民订单' },
  { id: 20010, title: '珍珠雇佣' },
  { id: 20011, title: '皇室特供订单' },
  { id: 20015, title: '升级鲜花' },
  { id: 20045, title: '制作花艺' },
]

const currentUser = computed(() => props.user)

// 获取任务状态（通用方法）
const getTaskStatus = (taskId) => {
  const task = localConfig.value.race.tasks.find((t) => t.id === taskId)
  return task?.status === 1
}

// 切换任务状态（所有任务共用一套逻辑）
const toggleTaskStatus = (taskId) => {
  const taskIndex = localConfig.value.race.tasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    const task = localConfig.value.race.tasks[taskIndex]
    task.status = task.status === 1 ? 0 : 1
  } else {
    // 如果 config 中不存在该任务（如新 config），则自动创建并默认启用
    localConfig.value.race.tasks.push({ id: taskId, status: 1 })
  }
}

// 计算任务状态映射（给子组件用）
const computedTaskStatuses = computed(() => {
  const map = {}
  if (localConfig.value?.race?.tasks) {
    for (const t of localConfig.value.race.tasks) {
      map[t.id] = t.status === 1
    }
  }
  return map
})

// 子组件任务状态变化回调
const onTaskStatusesChange = (newMap) => {
  if (!localConfig.value?.race?.tasks) return
  // 更新已有的
  for (const t of localConfig.value.race.tasks) {
    if (newMap[t.id] !== undefined) {
      t.status = newMap[t.id] ? 1 : 0
    }
  }
  // 追加 newMap 中有但 tasks 中没有的（例如用户参数没返回该任务，但 UI 需要能勾选）
  for (const [id, checked] of Object.entries(newMap)) {
    const idNum = Number(id)
    if (!localConfig.value.race.tasks.some((t) => t.id === idNum)) {
      localConfig.value.race.tasks.push({ id: idNum, status: checked ? 1 : 0 })
    }
  }
}
</script>

<style scoped>
/* ============================================================
   🏛 GuildConfig — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局），此处仅处理组件特有覆写
   ============================================================ */

/* ---------- 卡片容器微调 ---------- */
.guild-config-card {
  margin-bottom: 16px;
}

/* 覆盖全局 apple-card 部分 padding，使其更紧凑 */
.guild-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.guild-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* ---------- Apple 分段控制器（收获模式风格） ---------- */
.apple-segment {
  display: inline-flex;
  background: #f2f2f7;
  border-radius: 8px;
  padding: 2px;
  gap: 1px;
}

.apple-segment-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b5e6b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  background: transparent;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  letter-spacing: -0.05px;
  white-space: nowrap;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.apple-segment-btn.active {
  background: #ffffff;
  color: #5a3d5a;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.apple-segment-btn:active {
  opacity: 0.7;
}

/* ---------- Stepper 宽度统一 ---------- */
.apple-stepper-wrap {
  width: 108px;
}

/* ---------- 鲜花选择器包裹 ---------- */
.apple-flower-select-wrap {
  margin: 4px 0 10px;
  width: 100%;
}

.apple-flower-select-wrap :deep(.flower-select) {
  max-width: 100%;
}

/* ---------- 子分区内子分区缩进 ---------- */
.apple-sub-section .apple-sub-section {
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>
