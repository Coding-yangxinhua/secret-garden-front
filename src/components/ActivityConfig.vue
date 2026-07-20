<template>
  <div class="activity-config-card apple-card" v-if="user.gameId == 2">
    <div class="apple-card-header">
      <cute-icon name="calendar-heart" size="20" color="#ff6767" />
      <span class="apple-card-title">活动管理</span>
    </div>
    <div class="apple-card-content">
      <!-- ==================== 花绣时光 hd17 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">花绣时光</div>
          <div class="apple-cell-label">自动领取已完成的任务</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd17.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd17.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">任务星级</div>
            <div class="apple-cell-label">低于此星级的任务不会自动完成</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="1"
              :max="5"
              :step="1"
              v-model="localConfig.activity.hd17.taskStar"
              :inputDisabled="true"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">刷新任务</div>
            <div class="apple-cell-label">刷新任务至指定星级</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd17.autoRefresh"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动完成</div>
            <div class="apple-cell-label">开启后将去自动完成任务</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd17.autoFinish"
              size="22"
            />
          </div>
        </div>

        <!-- 自动完成详细配置 -->
        <div v-show="localConfig.activity.hd17.autoFinish == 1" class="apple-sub-section">
          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">达成积分</div>
              <div class="apple-cell-label">达到该积分不会再自动完成任务</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :max="9000"
                :step="10"
                :default-value="265"
                v-model="localConfig.activity.hd17.taskScore"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>

          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">花艺自动下架</div>
              <div class="apple-cell-label">开启后花艺上架5分钟后自动下架</div>
            </div>
            <div class="apple-cell-right">
              <van-switch
                :disabled="!config"
                v-model="localConfig.activity.hd17.autoOffShelf"
                size="22"
              />
            </div>
          </div>

          <div class="apple-sub-header">
            <van-icon name="list-o" size="14" color="#86868B" />
            <span>任务配置</span>
          </div>
          <RaceTaskSelector
            :accept-type-options="[]"
            :accepts="[]"
            :tasks="hd17Options"
            :task-statuses="hd17TaskStatuses"
            @update:accepts="() => {}"
            @update:task-statuses="onHd17TaskStatusesChange"
          />
        </div>
      </div>

      <!-- ==================== 花香茶韵 hd24 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">花香茶韵</div>
          <div class="apple-cell-label">自动消消乐</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd24.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd24.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">倍率</div>
            <div class="apple-cell-label">单次消耗的体力，当积分不足时以对应积分倍率为准</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :options="[1, 5, 10, 25, 100]"
              v-model="localConfig.activity.hd24.multiple"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">任务优先</div>
            <div class="apple-cell-label">优先消除任务需要的目标</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd24.taskFirst"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">积分优先</div>
            <div class="apple-cell-label">优先消除积分更多的目标</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd24.pointFirst"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 镶芳聚华 hd23 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">镶芳聚华</div>
          <div class="apple-cell-label">镶芳聚华活动自动配置</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd23.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd23.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">流彩原石数量</div>
            <div class="apple-cell-label">达到此数量后不再上架花艺</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :max="9999"
              :step="100"
              v-model="localConfig.activity.hd23.stoneNum"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">花艺组合</div>
            <div class="apple-cell-label">选择需要上架的花艺</div>
          </div>
          <div class="apple-cell-right" style="max-width: 270px">
            <ArrangeSelect :gameId="2" v-model="localConfig.activity.hd23.arrangeId" />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动制作</div>
            <div class="apple-cell-label">自动制作所选花艺</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd23.autoMake"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动种植</div>
            <div class="apple-cell-label">对应鲜花不足时，自动种植</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd23.autoPlant"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 百花辑录 hd22 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">百花辑录</div>
          <div class="apple-cell-label">百花辑录活动自动配置</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd22.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd22.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">标本记录数量</div>
            <div class="apple-cell-label">达到此数量后不再提交和种植</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :max="9999"
              :step="100"
              v-model="localConfig.activity.hd22.score"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动种植</div>
            <div class="apple-cell-label">对应鲜花不足时，自动种植</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd22.autoPlant"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 深海大赢家 hd63 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">深海大赢家</div>
          <div class="apple-cell-label">达标后自动领奖并开启下一关</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd63.status" size="22" />
        </div>
      </div>

      <!-- ==================== 奇芳争艳 hd13 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">奇芳争艳</div>
          <div class="apple-cell-label">自动点赞、领取任务奖励</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd13.status" size="22" />
        </div>
      </div>
       <div v-show="localConfig.activity.hd13.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>
        
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">累计点赞</div>
            <div class="apple-cell-label">达到此数量后不再点赞</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :max="9999"
              :step="100"
              v-model="localConfig.activity.hd13.score"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 赏花大会 hd50 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">赏花大会</div>
          <div class="apple-cell-label">自动完成与提交</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd50.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd50.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="list-o" size="14" color="#86868B" />
          <span>大赛委托</span>
        </div>
        <RaceTaskSelector
          :accept-type-options="[]"
          :accepts="[]"
          :tasks="normalTaskList"
          :task-statuses="hd50TaskStatuses"
          @update:accepts="() => {}"
          @update:task-statuses="onHd50TaskStatusesChange"
        />

        <div class="apple-sub-header" style="margin-top: 12px">
          <van-icon name="flower-o" size="14" color="#86868B" />
          <span>赏花会场</span>
        </div>
        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">任务奖励领取</div>
            <div class="apple-cell-label">自动领取任务奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd50.taskRwd"
              size="22"
            />
          </div>
        </div>
         <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">免费加速（测试中）</div>
            <div class="apple-cell-label">当有免费加速时，只提交已有的最高品质的花，再加速</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd50.freeRefresh"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">热门鲜花种植</div>
            <div class="apple-cell-label">自动补仓热门鲜花以保持双倍奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd50.doubleFirst"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">金币提交次数</div>
            <div class="apple-cell-label">自动提交金币任务</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="1"
              :max="4"
              v-model="localConfig.activity.hd50.coinNum"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">鲜花钻石加速</div>
            <div class="apple-cell-label">使用钻石加速指定品质鲜花，达到指定积分后停止</div>
          </div>
          <div class="apple-cell-right">
            <van-switch :disabled="!config" v-model="localConfig.activity.hd50.speedUp" size="22" />
          </div>
        </div>

        <div v-show="localConfig.activity.hd50.speedUp" class="apple-sub-section">
          <div class="apple-sub-header">
            <van-icon name="setting-o" size="14" color="#86868B" />
            <span>加速配置</span>
          </div>

          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">只加速双倍</div>
              <div class="apple-cell-label">只加速双倍积分的花</div>
            </div>
            <div class="apple-cell-right">
              <van-switch
                :disabled="!config"
                v-model="localConfig.activity.hd50.doubleOnly"
                size="22"
              />
            </div>
          </div>

          <QualityColorSelector v-model="localConfig.activity.hd50.color" title="加速品质选择" />

          <div class="apple-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">积分限制</div>
              <div class="apple-cell-label">达到指定积分不再加速</div>
            </div>
            <div class="apple-cell-right">
              <custom-array-stepper
                :min="0"
                :step="1000"
                v-model="localConfig.activity.hd50.score"
                :inputDisabled="false"
                class="apple-stepper-wrap"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 果叽农场 hd69 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">果叽农场</div>
          <div class="apple-cell-label">自动看广告，领取奖励</div>
        </div>
        <div class="apple-cell-right">
          <van-switch :disabled="!config" v-model="localConfig.activity.hd69.status" size="22" />
        </div>
      </div>
      <div v-show="localConfig.activity.hd69.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动施肥</div>
            <div class="apple-cell-label">自动施肥</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              v-model="localConfig.activity.hd69.autoPlay"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 寻芳之旅 hd68 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">寻芳之旅</div>
          <div class="apple-cell-label">自动派遣与宝箱领取</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!config"
            :active-value="1"
            :inactive-value="0"
            v-model="localConfig.activity.hd68.status"
            size="22"
          />
        </div>
      </div>
      <div v-show="localConfig.activity.hd68.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动领取达标奖励</div>
            <div class="apple-cell-label">考察次数达标奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              :active-value="1"
              :inactive-value="0"
              v-model="localConfig.activity.hd68.autoRwd"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动购买免费礼包</div>
            <div class="apple-cell-label">自动购买免费出游礼包</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              :active-value="1"
              :inactive-value="0"
              v-model="localConfig.activity.hd68.autoBuy"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动加速</div>
            <div class="apple-cell-label">自动加速考察时间</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              :active-value="1"
              :inactive-value="0"
              v-model="localConfig.activity.hd68.autoSpeedUp"
              size="22"
            />
          </div>
        </div>
      </div>

      <!-- ==================== 采药济将 hd3003 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">采药济将</div>
          <div class="apple-cell-label">自动领水、疗伤，并领取达标奖励</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!config"
            :active-value="1"
            :inactive-value="0"
            v-model="localConfig.activity.hd3003.status"
            size="22"
          />
        </div>
      </div>

      <!-- ==================== 御敌守玉 hd1009 ==================== -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">御敌守玉</div>
          <div class="apple-cell-label">自动攻击，领取阶段与拼图奖励</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!config"
            :active-value="1"
            :inactive-value="0"
            v-model="localConfig.activity.hd1009.status"
            size="22"
          />
        </div>
      </div>
      <div v-show="localConfig.activity.hd1009.status" class="apple-sub-section apple-indent">
        <div class="apple-sub-header">
          <van-icon name="setting-o" size="14" color="#86868B" />
          <span>详细配置</span>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动攻击次数</div>
            <div class="apple-cell-label">每日攻击达到指定次数后停止</div>
          </div>
          <div class="apple-cell-right">
            <custom-array-stepper
              :min="0"
              :step="10"
              v-model="localConfig.activity.hd1009.atkNum"
              :inputDisabled="false"
              class="apple-stepper-wrap"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动领取阶段任务</div>
            <div class="apple-cell-label">领取已完成的阶段任务和节点奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              :active-value="1"
              :inactive-value="0"
              v-model="localConfig.activity.hd1009.stageTaskRwd"
              size="22"
            />
          </div>
        </div>

        <div class="apple-cell">
          <div class="apple-cell-left">
            <div class="apple-cell-title">自动领取拼图奖励</div>
            <div class="apple-cell-label">领取已完成的拼图单格任务奖励</div>
          </div>
          <div class="apple-cell-right">
            <van-switch
              :disabled="!config"
              :active-value="1"
              :inactive-value="0"
              v-model="localConfig.activity.hd1009.puzzleTaskRwd"
              size="22"
            />
          </div>
        </div>
      </div>



    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import ArrangeSelect from './ArrangeSelect.vue'
import RaceTaskSelector from './RaceTaskSelector.vue'
import QualityColorSelector from './QualityColorSelector.vue'

const props = defineProps({
  user: { type: Object, required: true },
  config: { type: Object, required: true },
  expandStates: { type: Object, required: true },
})

const normalTaskList = [
  { id: 20009, title: '居民订单' },
  { id: 20007, title: '顾客订单' },
  { id: 20011, title: '皇室特供订单' },
  { id: 20053, title: '使用加速卡' },
  { id: 20046, title: '收获鲜花' },
]

const emit = defineEmits(['update:config', 'update-expand-states'])

const localConfig = reactive({})

const ensureActivityDefaults = () => {
  if (!localConfig.activity) {
    localConfig.activity = {}
  }
  if (!localConfig.activity.hd1009) {
    localConfig.activity.hd1009 = {
      status: 0,
      atkNum: 150,
      stageTaskRwd: 0,
      puzzleTaskRwd: 0,
    }
  }
  if (!localConfig.activity.hd3003) {
    localConfig.activity.hd3003 = {
      status: 0,
    }
  }
}

const hd17Options = [
  { id: 20008, title: '种植鲜花' },
  { id: 20007, title: '顾客订单' },
  { id: 20009, title: '居民订单' },
  { id: 20010, title: '珍珠雇佣' },
  { id: 20019, title: '花艺售卖' },
]

watch(
  () => props.config,
  (newConfig) => {
    Object.assign(localConfig, newConfig)
    ensureActivityDefaults()
  },
  { deep: true, immediate: true },
)

watch(
  localConfig,
  () => {
    emit('update:config', localConfig)
  },
  { deep: true },
)

// ---------- 桥接 RaceTaskSelector 的数据转换 ----------

// hd17 任务状态映射（对象 → 对象映射）
const hd17TaskStatuses = computed(() => {
  const map = {}
  if (Array.isArray(localConfig.activity?.hd17?.tasks)) {
    for (const t of localConfig.activity.hd17.tasks) {
      map[t.id] = t.status === 1
    }
  }
  return map
})

const onHd17TaskStatusesChange = (newMap) => {
  const tasks = localConfig.activity.hd17.tasks
  if (!Array.isArray(tasks)) return

  // 更新已有的
  for (const t of tasks) {
    if (newMap[t.id] !== undefined) {
      t.status = newMap[t.id] ? 1 : 0
    }
  }

  // 追加 newMap 中有但 tasks 中没有的
  for (const [id, checked] of Object.entries(newMap)) {
    const idNum = Number(id)
    if (!tasks.some((t) => t.id === idNum)) {
      tasks.push({ id: idNum, status: checked ? 1 : 0 })
    }
  }
}

// hd50 大赛委托任务状态映射
const hd50TaskStatuses = computed(() => {
  const map = {}
  if (Array.isArray(localConfig.activity?.hd50?.tasks)) {
    for (const t of localConfig.activity.hd50.tasks) {
      map[t.id] = t.status === 1
    }
  }
  return map
})

const onHd50TaskStatusesChange = (newMap) => {
  const tasks = localConfig.activity.hd50.tasks
  if (!Array.isArray(tasks)) return

  // 更新已有的
  for (const t of tasks) {
    if (newMap[t.id] !== undefined) {
      t.status = newMap[t.id] ? 1 : 0
    }
  }

  // 追加 newMap 中有但 tasks 中没有的（例如用户参数没返回该任务，但 UI 需要能勾选）
  for (const [id, checked] of Object.entries(newMap)) {
    const idNum = Number(id)
    if (!tasks.some((t) => t.id === idNum)) {
      tasks.push({ id: idNum, status: checked ? 1 : 0 })
    }
  }
}
</script>

<style scoped>
/* ============================================================
   🎪 ActivityConfig — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局）
   ============================================================ */

.activity-config-card {
  margin-bottom: 16px;
}

.activity-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.activity-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* ---------- Stepper 宽度统一 ---------- */
.apple-stepper-wrap {
  width: 108px;
}
</style>
