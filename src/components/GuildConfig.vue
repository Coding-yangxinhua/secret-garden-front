<template>
  <div class="config-card other-features-card">
    <div class="card-header" @click="toggleExpand('guildConfig')">
      <van-icon name="cluster-o" size="20" color="#52c41a" />
      <span class="card-title">{{ currentUser.gameId == 1 ? '社团功能' : '公会功能' }}</span>
      <van-icon
        name="arrow-down"
        size="16"
        :class="{ 'rotate-180': expandStates.guildConfig }"
        class="expand-icon"
      />
    </div>
    <div class="card-content" v-show="expandStates.guildConfig">
      <van-cell class="feature-cell" center label="自动捐献指定资源">
        <template #title>
          <span class="feature-title">{{ currentUser.gameId == 1 ? '社团捐献' : '公会建设' }}</span>
        </template>
        <van-dropdown-menu class="feature-dropdown">
          <van-dropdown-item
            v-model="localConfig.autoDonate"
            :options="currentUser.gameId == 1 ? donateOptions : dsDonateOptions"
            class="dropdown-item"
          />
        </van-dropdown-menu>
      </van-cell>
      <van-cell
        class="feature-cell"
        center
        :label="currentUser.gameId == 1 ? '自动收获社团花盆' : '自动收获公会土地'"
      >
        <template #title>
          <span class="feature-title">{{ currentUser.gameId == 1 ? '社团收获' : '公会种植' }}</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.club.clubPlant.status"
            size="24"
          />
        </template>
      </van-cell>

      <!-- 种植详细配置 -->
      <div
        v-show="localConfig.club.clubPlant.status == 1 && currentUser.gameId == 2"
        class="indent race-advanced-section"
      >
        <van-cell class="feature-cell" center title="自动种植">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.club.clubPlant.autoPlant"
            size="22"
          />
        </van-cell>
        <div v-show="localConfig.club.clubPlant.autoPlant">
          <div class="section-title">
            <van-icon name="setting-o" size="16" color="#8c8c8c" />
            <span>种植配置</span>
          </div>
          <div class="order-advanced-section">
            <van-cell class="advanced-cell" title="等级限制" label="升级到此等级就不再种植">
              <custom-array-stepper
                :min="1"
                :max="20"
                :step="1"
                v-model="localConfig.club.clubPlant.level"
                :inputDisabled="false"
                class="steal-stepper"
              >
              </custom-array-stepper>
            </van-cell>
            <!-- 品质选择按钮组 -->
            <QualityColorSelector v-model="localConfig.club.clubPlant.color" title="种植品质选择" />
          </div>
        </div>
      </div>

      <van-cell
        class="feature-cell"
        center
        :label="currentUser.gameId == 1 ? '自动观看社团广告获取奖励' : '自动进行视频建设'"
      >
        <template #title>
          <span class="feature-title">{{ currentUser.gameId == 1 ? '视频捐献' : '视频建设' }}</span>
        </template>
        <template #right-icon>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoGuildAd" size="24" />
        </template>
      </van-cell>

      <!-- 公会协助 -->
      <van-cell class="feature-cell" center v-if="currentUser.gameId == 2" label="自动协助公会成员">
        <template #title>
          <span class="feature-title">公会协助</span>
        </template>
        <template #right-icon>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoHelp" size="24" />
        </template>
      </van-cell>
      <!-- 公会协助 -->
      <van-cell class="feature-cell" center v-if="currentUser.gameId == 2" label="自动抢公会红包">
        <template #title>
          <span class="feature-title">公会红包</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.activity.hd54.status"
            size="24"
          />
        </template>
      </van-cell>
      <!-- 公会竞赛 -->
      <van-cell class="feature-cell" center v-if="currentUser.gameId == 2" label="自动参加公会竞赛">
        <template #title>
          <span class="feature-title">公会竞赛</span>
        </template>
        <template #right-icon>
          <van-switch :disabled="!localConfig" v-model="localConfig.autoRace" size="24" />
        </template>
      </van-cell>

      <!-- 竞赛详细配置 -->
      <div v-show="localConfig.autoRace" class="indent race-advanced-section">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>竞赛配置</span>
        </div>

        <!-- 接取类型 -->
        <div class="accept-type-section">
          <div class="accept-type-title">特殊任务类型</div>
          <div class="accept-type-description">特殊情况下的任务接取规则配置</div>
          <div class="accept-type-wrapper">
            <div class="accept-type-container">
              <div
                v-for="option in acceptTypeOptions"
                :key="option.value"
                class="accept-type-option"
                :class="{ selected: localConfig.race.accepts.includes(option.value) }"
                @click="toggleAcceptType(option.value)"
              >
                {{ option.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- 积分配置 -->
        <van-cell
          class="advanced-cell"
          title="竞赛积分"
          label="低于该积分的任务不会接取, -1为不接取竞赛任务，"
        >
          <custom-array-stepper
            :min="-1"
            :max="60"
            v-model="localConfig.race.racePoint"
            class="steal-stepper"
          />
        </van-cell>
        <van-cell
          class="advanced-cell"
          title="原金积分"
          label="低于该积分的系统升级任务不会接（30分的任务显示为60分）, -1为不接取原金"
        >
          <custom-array-stepper
            :min="-1"
            :max="60"
            v-model="localConfig.race.highPoint"
            class="steal-stepper"
          />
        </van-cell>
        <van-cell class="advanced-cell" title="升级任务积分" label="达到此积分自动升级，-1为不升级">
          <custom-array-stepper
            :min="-1"
            :max="30"
            v-model="localConfig.race.upPoint"
            class="steal-stepper"
          />
        </van-cell>
        <van-cell class="advanced-cell" title="购买任务次数" label="自动购买指定次数">
          <custom-array-stepper
            :min="0"
            :max="6"
            v-model="localConfig.race.buyCount"
            class="steal-stepper"
          />
        </van-cell>
        <van-cell class="advanced-cell" title="删除任务" label="自动删除不高于此积分">
          <custom-array-stepper
            :min="0"
            :max="25"
            v-model="localConfig.race.deletePoint"
            class="steal-stepper"
          />
        </van-cell>
        <van-cell class="advanced-cell" title="自动放弃" label="无法完成且没有进度的任务自动放弃">
          <template #right-icon
            ><van-switch v-model="localConfig.race.abandon" size="24"
          /></template>
        </van-cell>
        <van-cell class="advanced-cell" title="自动加速" label="鲜花任务自动使用加速卡">
          <template #right-icon
            ><van-switch v-model="localConfig.race.autoSpeedCard" size="24"
          /></template>
        </van-cell>
        <van-cell class="advanced-cell" title="自动开宝箱" label="自动开启竞赛宝箱">
          <template #right-icon
            ><van-switch v-model="localConfig.race.autoOpenBox" size="24"
          /></template>
        </van-cell>

        <!-- 任务配置 -->
        <div class="section-title">
          <van-icon name="list-o" size="16" color="#8c8c8c" />
          <span>任务配置 - 优先接取积分更高的任务</span>
        </div>

        <!-- 收获鲜花：原生开关（单独一行，风格统一） -->
        <van-cell class="advanced-cell" title="收获鲜花">
          <template #right-icon>
            <van-switch
              :model-value="getTaskStatus(20046)"
              @change="toggleTaskStatus(20046)"
              size="24"
            />
          </template>
        </van-cell>
        <!-- 鲜花选择器：依赖任务状态显隐 -->
        <div v-if="getTaskStatus(20046)" class="flower-select-row indent">
          <FlowerSelect
            v-model="localConfig.race.flowerIds"
            :game-id="2"
            placeholder="可选择指定接取的鲜花"
          />
          <van-cell v-if="false" class="advanced-cell" title="清地" label="接取前清地">
            <template #right-icon>
              <van-switch v-model="localConfig.race.clearLand" size="22" />
            </template>
          </van-cell>
        </div>
        <!-- 其他任务：标签勾选 -->
        <div class="accept-type-section">
          <div class="accept-type-wrapper">
            <div class="accept-type-container">
              <div
                v-for="item in normalTaskList"
                :key="item.id"
                class="accept-type-option"
                :class="{ selected: getTaskStatus(item.id) }"
                @click="toggleTaskStatus(item.id)"
              >
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch, nextTick } from 'vue'
import CustomArrayStepper from './CustomArrayStepper.vue'
import FlowerSelect from './FlowerSelect.vue'
import QualityColorSelector from './QualityColorSelector.vue'

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
  }
}

// 切换接取类型
const toggleAcceptType = (value) => {
  const index = localConfig.value.race.accepts.indexOf(value)
  index > -1
    ? localConfig.value.race.accepts.splice(index, 1)
    : localConfig.value.race.accepts.push(value)
}

// 展开收起
const toggleExpand = (key) => {
  emit('update-expand-states', { ...props.expandStates, [key]: !props.expandStates[key] })
}
</script>

<style scoped>
.config-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
  transition: transform 0.3s;
}
.rotate-180 {
  transform: rotate(180deg);
}
.feature-cell {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}
.feature-dropdown {
  width: 160px;
  --van-dropdown-menu-background: transparent;
  --van-dropdown-menu-shadow: none;
}

.indent {
  position: relative;
  padding-left: 14px;
  margin-left: 4px;
}
:deep(.indent::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background-image: repeating-linear-gradient(
    to bottom,
    #eaeaea 0px,
    #eaeaea 6px,
    transparent 6px,
    transparent 12px
  );
}
.race-advanced-section {
  margin-left: 20px;
  margin-top: 16px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin: 10px 0 6px;
}
.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.stealer-stepper {
  width: 100px;
}

/* 统一标签样式 */
.accept-type-section {
  margin-bottom: 12px;
}
/* ✅ 补充缺失的标题样式 */
.accept-type-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}
/* ✅ 补充缺失的描述文字样式 */
.accept-type-description {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
  line-height: 1.4;
}
.accept-type-wrapper {
  border: 1px solid #ffd6e7;
  border-radius: 12px;
  padding: 10px;
  background: #fff9fc;
}
.accept-type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.accept-type-option {
  padding: 4px 10px;
  border: 1px solid #f5c2d3;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.accept-type-option:hover {
  border-color: #ff85c0;
  background: #fff0f6;
}
.accept-type-option.selected {
  border-color: #ff6b9d;
  background: #ffadd2;
  color: #fff;
  font-weight: 500;
}

/* 鲜花选择器样式 */
.flower-select-row {
  margin-top: 8px;
  margin-bottom: 12px;
  width: 100%;
}
.flower-select-row :deep(.flower-select) {
  max-width: 100%;
}
</style>
