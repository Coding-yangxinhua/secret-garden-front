<template>
  <div class="config-card other-features-card" v-if="user.gameId == 2">
    <div class="card-header" @click="toggleExpand('activityConfig')">
      <van-icon name="gift-o" size="20" color="#ff6767" />
      <span class="card-title">活动管理</span>
      <van-icon
        name="arrow-down"
        size="16"
        :class="{ 'rotate-180': expandStates.activityConfig }"
        class="expand-icon"
      />
    </div>
    <div class="card-content" v-show="expandStates.activityConfig">
      <!-- 花绣时光 hd17 -->
      <van-cell class="feature-cell" center label="自动领取已完成的任务">
        <template #title>
          <span class="feature-title">花绣时光</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd17.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd17.status" class="indent order-advanced-section">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>详细配置</span>
        </div>
        <div class="advanced-setting-group">
          <van-cell class="advanced-cell" title="任务星级" label="低于此星级的任务不会自动完成">
            <custom-array-stepper
              :min="1"
              :max="5"
              :step="1"
              v-model="localConfig.activity.hd17.taskStar"
              :inputDisabled="true"
              class="steal-stepper"
              @change="onConfigChange"
            >
            </custom-array-stepper>
          </van-cell>
          <van-cell class="advanced-cell" label="刷新任务至指定星级">
            <template #title>
              <span class="feature-title">刷新任务</span>
            </template>
            <template #right-icon>
              <van-switch
                :disabled="!config"
                v-model="localConfig.activity.hd17.autoRefresh"
                size="24"
                @change="onConfigChange"
              />
            </template>
          </van-cell>
          <van-cell class="advanced-cell" label="开启后将去自动完成任务">
            <template #title>
              <span class="feature-title">自动完成</span>
            </template>
            <template #right-icon>
              <van-switch
                :disabled="!config"
                v-model="localConfig.activity.hd17.autoFinish"
                size="24"
                @change="onConfigChange"
              />
            </template>
          </van-cell>

          <!-- 花绣时光自动完成详细配置 -->
          <div
            v-show="localConfig.activity.hd17.autoFinish == 1"
            class="indent order-advanced-section"
          >
            <div class="section-title">
              <van-icon name="setting-o" size="16" color="#8c8c8c" />
              <span>自动完成详细配置</span>
            </div>

            <van-cell class="advanced-cell" title="达成积分" label="达到该积分不会再自动完成任务">
              <custom-array-stepper
                :min="0"
                :max="9000"
                :step="10"
                :default-value="265"
                v-model="localConfig.activity.hd17.taskScore"
                :inputDisabled="false"
                class="steal-stepper"
                @change="onConfigChange"
              >
              </custom-array-stepper>
            </van-cell>

            <van-cell class="advanced-cell" label="开启后花艺上架5分钟后自动下架">
              <template #title>
                <span class="feature-title">花艺自动下架</span>
              </template>
              <template #right-icon>
                <van-switch
                  :disabled="!config"
                  v-model="localConfig.activity.hd17.autoOffShelf"
                  size="24"
                  @change="onConfigChange"
                />
              </template>
            </van-cell>

            <div class="section-title">
              <van-icon name="list-o" size="16" color="#8c8c8c" />
              <span>任务配置</span>
            </div>
            <TaskNormalList
              :task-list="hd17Options"
              v-model:tasks="localConfig.activity.hd17.tasks"
            />
          </div>
        </div>
      </div>

      <!-- 花香茶韵 hd24 -->
      <van-cell class="feature-cell" center label="自动消消乐">
        <template #title>
          <span class="feature-title">花香茶韵</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd24.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd24.status" class="indent order-advanced-section">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>详细配置</span>
        </div>
        <van-cell
          class="advanced-cell"
          title="倍率"
          label="单次消耗的体力，当积分不足时，以对应积分倍率为准"
        >
          <custom-array-stepper
            :options="[1, 5, 10, 25, 100]"
            v-model="localConfig.activity.hd24.multiple"
            :inputDisabled="false"
            class="steal-stepper"
            @change="onConfigChange"
          >
          </custom-array-stepper>
        </van-cell>
        <van-cell class="advanced-cell" label="优先消除任务需要的目标">
          <template #title>
            <span class="feature-title">任务优先</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd24.taskFirst"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" label="优先消除积分更多的目标">
          <template #title>
            <span class="feature-title">积分优先</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd24.pointFirst"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
      </div>

      <!-- ====================== 新增：镶芳聚华 hd23 ====================== -->
      <van-cell class="feature-cell" center label="镶芳聚华活动自动配置">
        <template #title>
          <span class="feature-title">镶芳聚华</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd23.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd23.status" class="indent order-advanced-section">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>详细配置</span>
        </div>
        <!-- 1. 流彩原石数量 -->
        <van-cell class="advanced-cell" title="流彩原石数量" label="达到此数量后不再上架花艺">
          <custom-array-stepper
            :min="0"
            :max="9999"
            :step="100"
            v-model="localConfig.activity.hd23.stoneNum"
            :inputDisabled="false"
            class="steal-stepper"
            @change="onConfigChange"
          >
          </custom-array-stepper>
        </van-cell>
        <!-- 2. 上架花艺ID -->
        <van-cell class="advanced-cell" title="花艺组合" label="选择需要上架的花艺"> </van-cell>
        <arrange-select
          :gameId="2"
          v-model="localConfig.activity.hd23.arrangeId"
          @update:model-value="onConfigChange"
        ></arrange-select>

        <!-- 3. 自动制作开关 -->
        <van-cell class="advanced-cell" label="自动制作所选花艺">
          <template #title>
            <span class="feature-title">自动制作</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd23.autoMake"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <!-- 4. 自动种植开关 -->
        <van-cell class="advanced-cell" label="对应鲜花不足时，自动种植">
          <template #title>
            <span class="feature-title">自动种植</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd23.autoPlant"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
      </div>

      <!-- ====================== 新增：百花辑录 hd22 ====================== -->
      <van-cell class="feature-cell" center label="百花辑录活动自动配置">
        <template #title>
          <span class="feature-title">百花辑录</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd22.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd22.status" class="indent order-advanced-section">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>详细配置</span>
        </div>
        <!-- 1. 积分要求 -->
        <van-cell class="advanced-cell" title="标本记录数量" label="达到此数量后不再提交和种植">
          <custom-array-stepper
            :min="0"
            :max="9999"
            :step="100"
            v-model="localConfig.activity.hd22.score"
            :inputDisabled="false"
            class="steal-stepper"
            @change="onConfigChange"
          >
          </custom-array-stepper>
        </van-cell>
        <!-- 2. 自动种植开关 -->
        <van-cell class="advanced-cell" label="对应鲜花不足时，自动种植">
          <template #title>
            <span class="feature-title">自动种植</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd22.autoPlant"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
      </div>
      <!-- ====================== 新增：深海大赢家 hd63 ====================== -->
      <van-cell class="feature-cell" center label="达标后自动领奖并开启下一关">
        <template #title>
          <span class="feature-title">深海大赢家</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd63.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>

      <!-- ====================== 新增：斗芳争艳 hd13 ====================== -->
      <van-cell class="feature-cell" center label="自动点赞、领取任务奖励">
        <template #title>
          <span class="feature-title">斗芳争艳</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd13.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>

      <!-- ====================== 新增：赏花大会 hd50 ====================== -->
      <van-cell class="feature-cell" center label="自动完成与提交">
        <template #title>
          <span class="feature-title">赏花大会</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd50.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd50.status" class="indent">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>大赛委托</span>
        </div>
        <TaskNormalList
          :task-list="normalTaskList"
          v-model:tasks="localConfig.activity.hd50.tasks"
        />
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>赏花会场</span>
        </div>
        <van-cell class="advanced-cell" label="自动补仓热门鲜花以保持双倍奖励">
          <template #title>
            <span class="feature-title">热门鲜花种植</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd50.doubleFirst"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <van-cell class="advanced-cell" label="自动提交金币任务">
          <template #title>
            <span class="feature-title">金币提交次数</span>
          </template>
          <custom-array-stepper
            :min="0"
            :step="1"
            :max="4"
            v-model="localConfig.activity.hd50.coinNum"
            :inputDisabled="false"
            class="steal-stepper"
            @change="onConfigChange"
          >
          </custom-array-stepper>
        </van-cell>
        <van-cell class="advanced-cell" label="加速指定品质鲜花，达到指定积分后停止">
          <template #title>
            <span class="feature-title">鲜花加速</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd50.speedUp"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
        <div v-show="localConfig.activity.hd50.speedUp" class="indent order-advanced-section">
          <div class="section-title">
            <van-icon name="setting-o" size="16" color="#8c8c8c" />
            <span>加速配置</span>
          </div>
          
          <van-cell class="advanced-cell " label="只加速双倍积分的花">
            <template #title>
              <span class="feature-title">只加速双倍</span>
            </template>
            <template #right-icon>
              <van-switch
                :disabled="!config"
                v-model="localConfig.activity.hd50.doubleOnly"
                size="24"
                @change="onConfigChange"
              />
            </template>
          </van-cell>
          <QualityColorSelector v-model="localConfig.activity.hd50.color" title="加速品质选择" />

          <van-cell class="advanced-cell" label="达到指定积分不再加速">
            <template #title>
              <span class="feature-title">积分限制</span>
            </template>
            <custom-array-stepper
              :min="0"
              :step="1000"
              v-model="localConfig.activity.hd50.score"
              :inputDisabled="false"
              class="steal-stepper"
              @change="onConfigChange"
            >
            </custom-array-stepper>
          </van-cell>
        </div>
      </div>

      <!-- ====================== 新增：果叽农场 hd69 ====================== -->
      <van-cell class="feature-cell" center label="自动看广告，领取奖励">
        <template #title>
          <span class="feature-title">果叽农场</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!config"
            v-model="localConfig.activity.hd69.status"
            size="24"
            @change="onConfigChange"
          />
        </template>
      </van-cell>
      <div v-show="localConfig.activity.hd69.status" class="indent">
        <div class="section-title">
          <van-icon name="setting-o" size="16" color="#8c8c8c" />
          <span>详细配置</span>
        </div>
        <van-cell class="advanced-cell" label="自动施肥">
          <template #title>
            <span class="feature-title">自动施肥</span>
          </template>
          <template #right-icon>
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd69.autoPlay"
              size="24"
              @change="onConfigChange"
            />
          </template>
        </van-cell>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import ArrangeSelect from './ArrangeSelect.vue'
import TaskNormalList from './TaskNormalList.vue'
import QualityColorSelector from './QualityColorSelector.vue'

// 定义组件接收的props
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

const normalTaskList = [
  { id: 20009, title: '居民订单' },
  { id: 20007, title: '顾客订单' },
  { id: 20011, title: '皇室特供订单' },
  { id: 20053, title: '使用加速卡' },
  { id: 20046, title: '收获鲜花' },
]

// 定义组件触发的事件
const emit = defineEmits(['update:config', 'update-expand-states'])

// 创建本地配置副本
// 🔥 修复1：改用 reactive 创建响应式对象（替换原来的 ref({})）
const localConfig = reactive({})

// 任务配置选项
const hd17Options = [
  { id: 20008, title: '种植鲜花' },
  { id: 20007, title: '顾客订单' },
  { id: 20009, title: '居民订单' },
  { id: 20010, title: '珍珠雇佣' },
  { id: 20019, title: '花艺售卖' },
]

// 监听props.config的变化，同步到本地配置
watch(
  () => props.config,
  (newConfig) => {
    Object.assign(localConfig, newConfig)
  },
  { deep: true, immediate: true },
)

// 切换展开状态
const toggleExpand = (key) => {
  const newExpandStates = { ...props.expandStates }
  newExpandStates[key] = !newExpandStates[key]
  emit('update-expand-states', newExpandStates)
}

// 配置变更处理（所有控件修改最终都走这里同步）
const onConfigChange = () => {
  emit('update:config', localConfig)
}

// 获取花绣时光任务标题
const getHd17TaskTitle = (taskId) => {
  const task = hd17Options.find((t) => t.id === taskId)
  return task ? task.title : '未知任务'
}

// 更新花绣时光任务状态
const updateHd17TaskStatus = (taskId, status) => {
  const task = localConfig.activity.hd17.tasks.find((t) => t.id === taskId)
  if (task) {
    task.status = status ? 1 : 0
    onConfigChange()
  }
}
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

.feature-cell {
  background-color: transparent;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.order-advanced-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.advanced-setting-group {
  padding-left: 10px;
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

.hd17-task-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hd17-task-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #eaecef;
}

.hd17-task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-cell {
  flex: 1;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
