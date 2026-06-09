<template>
  <main class="page-container">
    <version-checker ref="updateModalRef" v-show="currentUser.gameId == 2" />

    <!-- ========== 骨架屏：数据加载中 ========== -->
    <div v-if="!isDataReady" class="skeleton-container">
      <div class="skeleton-top-card">
        <div class="skeleton-avatar skeleton-pulse"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line skeleton-pulse" style="width: 40%"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 65%"></div>
        </div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-card skeleton-pulse"></div>
        <div class="skeleton-card skeleton-pulse"></div>
        <div class="skeleton-card skeleton-pulse"></div>
      </div>
    </div>

    <!-- ========== 数据就绪后的真实内容 ========== -->
    <template v-if="isDataReady">
      <div class="fixed-top-card" v-if="config != null">
        <user-status-card
          class="user-status-card"
          :system-user="systemUser"
          @update:current-user="handleUserChange"
          @allot-success="() => getConfig(true)"
        />
      </div>

      <!-- ========== 引导区域 ========== -->
      <!-- 场景1：未登录系统账号 -->
      <div class="no-account-guide" v-if="config != null && !systemUserLocal">
        <div class="guide-arrow-container">
          <svg
            width="36"
            height="48"
            viewBox="0 0 36 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="guide-svg-arrow"
          >
            <path
              d="M18 4V36M18 36L8 26M18 36L28 26"
              stroke="#f472b6"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="18" cy="8" r="3" fill="#f472b6" opacity="0.3" />
            <circle cx="18" cy="16" r="2.5" fill="#f472b6" opacity="0.5" />
            <circle cx="18" cy="24" r="2" fill="#f472b6" opacity="0.7" />
          </svg>
        </div>
        <div class="guide-card guide-card-login" @click="goToLogin">
          <div class="guide-icon-wrapper guide-icon-login">
            <van-icon name="user-circle-o" size="28" color="#ec4899" />
          </div>
          <div class="guide-text">
            <div class="guide-title">欢迎来到莳花小助手</div>
            <div class="guide-desc">点击此处或底部「个人中心 → 登录」先登录或注册一个账号吧！</div>
          </div>
          <van-icon name="arrow-down" size="18" color="#ec4899" class="guide-bounce-arrow" />
        </div>
      </div>

      <!-- 场景2：已登录但未绑定游戏账号 -->
      <div
        class="no-account-guide"
        v-if="config != null && systemUserLocal && !systemUser.currentUser"
      >
        <div class="guide-arrow-container">
          <svg
            width="36"
            height="48"
            viewBox="0 0 36 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="guide-svg-arrow"
          >
            <path
              d="M18 4V36M18 36L8 26M18 36L28 26"
              stroke="#ff6767"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="18" cy="8" r="3" fill="#ff6767" opacity="0.3" />
            <circle cx="18" cy="16" r="2.5" fill="#ff6767" opacity="0.5" />
            <circle cx="18" cy="24" r="2" fill="#ff6767" opacity="0.7" />
          </svg>
        </div>
        <div class="guide-card" @click="openAccountModal">
          <div class="guide-icon-wrapper">
            <van-icon name="user-o" size="28" color="#ff6767" />
          </div>
          <div class="guide-text">
            <div class="guide-title">还没有绑定游戏账号</div>
            <div class="guide-desc">点击此处或点击底部菜单「更多 → 账号绑定」添加你的游戏账号</div>
          </div>
          <van-icon name="arrow-down" size="18" color="#ff6767" class="guide-bounce-arrow" />
        </div>
      </div>

      <!-- 场景3：已绑定游戏账号但无VIP（subscribeId == -1） -->
      <div
        class="no-account-guide"
        v-if="
          config != null &&
          systemUserLocal &&
          systemUser.currentUser &&
          currentUser?.subscribe?.subscribeId == -1
        "
      >
        <div class="guide-arrow-container">
          <svg
            width="36"
            height="48"
            viewBox="0 0 36 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="guide-svg-arrow"
          >
            <path
              d="M18 4V36M18 36L8 26M18 36L28 26"
              stroke="#faad14"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="18" cy="8" r="3" fill="#faad14" opacity="0.3" />
            <circle cx="18" cy="16" r="2.5" fill="#faad14" opacity="0.5" />
            <circle cx="18" cy="24" r="2" fill="#faad14" opacity="0.7" />
          </svg>
        </div>
        <!-- 子场景3a：库存无可用时长 → 引导去活动领新人试用 -->
        <div
          v-if="systemUserTimesTotalDays === 0"
          class="guide-card guide-card-vip"
          @click="openActivityPanel"
        >
          <div class="guide-icon-wrapper guide-icon-vip">
            <van-icon name="gift-o" size="28" color="#faad14" />
          </div>
          <div class="guide-text">
            <div class="guide-title">还没有会员时长</div>
            <div class="guide-desc">点击此处领取新人试用时长，即可开始使用小助手</div>
          </div>
          <van-icon name="arrow-down" size="18" color="#faad14" class="guide-bounce-arrow" />
        </div>
        <!-- 子场景3b：库存有可用时长但未分配给当前账号 → 引导点击有效期分配 -->
        <div class="fixed-top-card" v-if="config != null">
          <user-status-card
            ref="userStatusCardRef"
            class="user-status-card"
            :system-user="systemUser"
            @update:current-user="handleUserChange"
            @allot-success="() => getConfig(true)"
          />
        </div>
        <div v-else class="guide-card guide-card-vip" @click="scrollToVipCard">
          <div class="guide-icon-wrapper guide-icon-vip">
            <van-icon name="clock-o" size="28" color="#faad14" />
          </div>
          <div class="guide-text">
            <div class="guide-title">你有可分配的会员时长</div>
            <div class="guide-desc">点击上方有效期卡片，分配时长后即可使用</div>
          </div>
          <van-icon name="arrow-up" size="18" color="#faad14" class="guide-bounce-arrow-up" />
        </div>
      </div>

      <div class="config-wrapper" v-if="currentUser && currentUser?.subscribe?.subscribeId >= 0">
        <!-- VIP 子配置 — iOS 17 卡片式横向滑动分页（含 LoginConfig 作为首页） -->
        <template v-if="currentUser && currentUser?.subscribe?.subscribeId > 0">
          <!-- 模块指示器圆点 (iOS 17 小圆点) -->
          <div class="swipe-indicator" v-if="swipeModuleList.length > 1">
            <span
              v-for="(m, i) in swipeModuleList"
              :key="m.key"
              class="swipe-dot"
              :class="{ active: swipeCurrentIndex === i }"
              @click="swipeToModule(i)"
            ></span>
          </div>

          <!-- 滑动容器 — iOS 17 横向分页滑动（高度跟随当前页面内容） -->
          <div
            class="swipe-area"
            ref="swipeAreaRef"
            :style="{ height: swipeAreaHeight }"
            @touchstart="onSwipeTouchStart"
            @touchmove="onSwipeTouchMove"
            @touchend="onSwipeTouchEnd"
            @touchcancel="onSwipeTouchEnd"
          >
            <div
              class="swipe-track"
              :style="swipeTrackStyle"
              :class="{ 'swipe-animating': !isSwiping }"
            >
              <div
                v-for="(m, i) in swipeModuleList"
                :key="m.key"
                class="swipe-page"
                :data-page-key="m.key"
                :ref="(el) => setPageRef(el, m.key)"
              >
                <LoginConfig
                  v-if="m.key === 'enable'"
                  v-model:login="config.login"
                  :current-user="currentUser"
                  :next-run-time="nextRunTime"
                  :schedule-time-info="accountInfo.scheduleTimeInfo"
                  @get-config="getConfig"
                  :key="currentUser?.id"
                />
                <!-- 自动种植 -->
                <PlantConfig
                  v-if="m.key === 'plant'"
                  v-model:plantConfig="plantConfig"
                  :currentUser="currentUser"
                  :availableSeeds="availableSeeds"
                />
                <!-- 订单管理 -->
                <OrderConfig
                  v-else-if="m.key === 'order'"
                  v-model="orderConfig"
                  :currentUser="currentUser"
                />
                <!-- 小号管理 -->
                <AltConfig
                  v-else-if="m.key === 'alt'"
                  v-model:autoAccept="config.autoAccept"
                  v-model:userAlts="accountInfo.userAlts"
                  :currentUser="currentUser"
                  :friends="friends"
                />
                <!-- 摸花管理 (鲜花小镇) -->
                <StealFlowerConfig
                  v-else-if="m.key === 'stealFlower'"
                  v-model="stealFlowerConfig"
                  :currentUser="currentUser"
                  :friends="friends"
                  :availableSeeds="availableSeeds"
                  :currentUserId="currentUserId"
                />
                <!-- 摸花/爬架管理 (海蓝游戏) -->
                <StealConfig
                  v-else-if="m.key === 'steal'"
                  :user="currentUser"
                  :config="config"
                  :friends="currentUser.gameUser.friends || []"
                  :expand-states="expandStates"
                  @update:config="handleConfigUpdate"
                  @update-expand-states="handleExpandStateUpdate"
                />
                <!-- 店铺管理 -->
                <ShopConfig
                  v-else-if="m.key === 'shop'"
                  v-model="shopConfig"
                  :currentUser="currentUser"
                  :friends="friends"
                  :availableSeeds="availableSeeds"
                  :tradeMap="tradeMap"
                />
                <!-- 公会配置 -->
                <GuildConfig
                  v-else-if="m.key === 'guild'"
                  :user="currentUser"
                  :config="config"
                  :expand-states="expandStates"
                  @update:config="handleConfigUpdate"
                  @update-expand-states="handleExpandStateUpdate"
                />
                <!-- 兑换码 -->
                <ExchangeCodeConfig
                  v-else-if="m.key === 'exchangeCode'"
                  v-model:autoExchange="config.autoExchange"
                  :currentUserId="currentUserId"
                />
                <!-- 活动配置 -->
                <ActivityConfig
                  v-else-if="m.key === 'activity'"
                  :user="currentUser"
                  :config="config"
                  :expand-states="expandStates"
                  @update:config="handleConfigUpdate"
                  @update-expand-states="handleExpandStateUpdate"
                />
                <!-- 自动广告 -->
                <AutoAdConfig
                  v-else-if="m.key === 'autoAd'"
                  :user="currentUser"
                  :config="config"
                  :expand-states="expandStates"
                  @update:config="handleConfigUpdate"
                  @update-expand-states="handleExpandStateUpdate"
                />
                <!-- 其他配置 -->
                <OtherConfig
                  v-else-if="m.key === 'other'"
                  :user="currentUser"
                  :config="config"
                  :expand-states="expandStates"
                  @update:config="handleConfigUpdate"
                  @update-expand-states="handleExpandStateUpdate"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- 非VIP提示 -->
        <div
          v-if="!currentUser?.subscribe || currentUser?.subscribe?.subscribeId < 1"
          class="config-section non-vip-section"
        >
          <div class="upgrade-tip-card">
            <div class="upgrade-icon">
              <van-icon name="arrow-up" size="24" color="#faad14" />
            </div>
            <div class="upgrade-content">
              <div class="upgrade-title">升级VIP解锁更多功能</div>
              <div class="upgrade-desc">
                自动种植、订单管理、社团功能、资源自动领取等更多高级功能
              </div>
            </div>
            <van-button type="warning" size="small" plain class="upgrade-btn" @click="toggleExpand"
              >立即升级</van-button
            >
          </div>
        </div>
      </div>

      <!-- 模块选择悬浮按钮（仅在 VIP 且有配置时显示） -->
      <ModuleSelector
        v-if="config && currentUser?.subscribe?.subscribeId > 0"
        :game-id="currentUser.gameId"
        v-model:current-module="selectedModule"
      />

      <!-- 底部导航 -->
    </template>
    <bottom-nav
      ref="bottomNavRef"
      :running-status="runningStatus"
      :exchange-default-open-id="currentUser.openId"
      @save-config="saveConfig"
      @to-log="toLog"
      @trigger-robot="triggerRobot"
      @handle-user-action="handleUserAction"
      @go-to-profile="goToProfile"
      @go-to-security="goToSecurity"
      @logout="logout"
    />
  </main>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import request from '@/utils/request'
import { showLoadingToast, showNotify } from 'vant'
import flowerUtil from '@/utils/flowerUtil'
import router from '@/router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import VersionChecker from '@/components/VersionChecker.vue'
import StealConfig from '@/components/StealConfigModal.vue'
import BottomNav from '@/components/BottomNav.vue'
import UserStatusCard from '@/components/UserStatusCard.vue'
import GuildConfig from '@/components/GuildConfig.vue'
import OtherConfig from '@/components/OtherConfig.vue'
import ActivityConfig from '@/components/ActivityConfig.vue'
import AutoAdConfig from '@/components/AutoAdConfig.vue'
import LoginConfig from '@/components/LoginConfig.vue'
// 新增拆分组件
import PlantConfig from '@/components/PlantConfig.vue'
import OrderConfig from '@/components/OrderConfig.vue'
import AltConfig from '@/components/AltConfig.vue'
import StealFlowerConfig from '@/components/StealFlowerConfig.vue'
import ShopConfig from '@/components/ShopConfig.vue'
import ExchangeCodeConfig from '@/components/ExchangeCodeConfig.vue'
import ModuleSelector from '@/components/ModuleSelector.vue'
import { isEqual, cloneDeep } from 'lodash-es'

const userStore = useUserStore()
const { userInfo: systemUserLocal } = storeToRefs(userStore)

// 引用
const updateModalRef = ref(null)
const bottomNavRef = ref(null)
const userStatusCardRef = ref(null)
const saveToast = ref()

// 当前选中的模块（默认显示启用配置，从 localStorage 恢复）
const selectedModule = ref(localStorage.getItem('currentSelectedModule') || 'enable')

// 用户与配置
const currentUserId = ref(localStorage.getItem('currentUserId') || '')
const accountInfo = ref({ config: {} })
const nextRunTime = ref(0)
const friends = ref([])

// 配置比较
const areConfigsEqual = (obj1, obj2) => isEqual(obj1, obj2)

// 修改跟踪
const initialConfigState = ref(null)
const hasUnsavedChanges = ref(false)
const lastUserId = ref(null)

// 数据就绪状态：接口返回数据后设为 true
const isDataReady = ref(false)

// 缓存 key（用于从日志返回时快速回显）
const ACCOUNT_INFO_CACHE_KEY = 'home_account_info_cache'
const CACHE_USER_ID_KEY = 'home_cache_user_id'

// 展开状态（供 StealConfig、GuildConfig 等仍需要的地方）
const expandStates = ref({})

// 工具映射
const tradeMap = flowerUtil.getFlowerTradeMap()
const allFlowers = flowerUtil.getAllFlowers()

// 系统用户
const systemUser = computed(
  () =>
    accountInfo.value.systemUser || {
      otherUsers: [],
      currentUser: null,
      times: {},
      userName: '',
      nickName: '',
    },
)

const currentUser = computed(
  () =>
    systemUser.value.currentUser || {
      refreshNeed: false,
      subscribe: { subscribeId: -1 },
      gameUser: {},
      userName: '',
    },
)

const config = computed(
  () =>
    accountInfo.value.config || {
      enable: false,
      login: {},
      autoPlant: 0,
      autoHarvest: 0,
      harvestWaitingTime: 30,
      minWaterNum: 0,
      periods: [],
      quality: { categoryNum: 0, level: 1, tidy: true, taskTidy: false, color: [] },
      autoComplete: 0,
      autoSale: 0,
      order: {
        orderMaxNum: 0,
        clothOrderMaxNum: 0,
        materialOrderMaxNum: 0,
        autoChallenge: 0,
        seedOnly: false,
        color: [],
      },
      autoAccept: false,
      autoSteal: false,
      steals: [],
      autoTradeOut: false,
      autoTradeIn: false,
      trade: { outs: [], ins: [] },
      autoExchange: false,
      // 其余已有字段由 GuildConfig 等组件通过 handleConfigUpdate 维护
    },
)

const gameId = computed(() => currentUser.value.gameId)

// 系统用户（API 返回）的 times 总可用时长（小时）
const systemUserTimesTotalDays = computed(() => {
  const times = systemUser.value?.times
  if (!times || !Array.isArray(times)) return 0
  const totalHours = times.reduce((sum, t) => sum + (t.hours || 0), 0)
  return Math.floor(totalHours / 24)
})

// 可用种子列表
const availableSeeds = computed(() => {
  const flowers = accountInfo.value.flowers || []
  return allFlowers[gameId.value]?.filter((f) => flowers.includes(f.value)) || []
})

// 各子配置对象（用于 v-model）
const plantConfig = computed({
  get() {
    const c = config.value
    return {
      autoPlant: c.autoPlant,
      autoHarvest: c.autoHarvest,
      harvestWaitingTime: c.harvestWaitingTime,
      minWaterNum: c.minWaterNum,
      quality: c.quality,
      periods: c.periods,
    }
  },
  set(val) {
    Object.assign(config.value, val)
    hasUnsavedChanges.value = true
  },
})

const orderConfig = computed({
  get() {
    const c = config.value
    return { autoComplete: c.autoComplete, autoSale: c.autoSale, order: c.order }
  },
  set(val) {
    Object.assign(config.value, val)
    hasUnsavedChanges.value = true
  },
})

const stealFlowerConfig = computed({
  get() {
    const c = config.value
    return { autoSteal: c.autoSteal, steals: c.steals }
  },
  set(val) {
    Object.assign(config.value, val)
    hasUnsavedChanges.value = true
  },
})

const shopConfig = computed({
  get() {
    const c = config.value
    return { autoTradeOut: c.autoTradeOut, autoTradeIn: c.autoTradeIn, trade: c.trade }
  },
  set(val) {
    Object.assign(config.value, val)
    hasUnsavedChanges.value = true
  },
})

// ===== iOS 17 卡片式横向分页滑动 =====
// 原理：所有页面水平排列在 swipe-track 中，通过 translateX 偏移 track，
// 手指跟随时实时偏移（无 transition），松手后以 iOS 弹簧曲线动画到目标页

const swipeAreaRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0) // 用于区分垂直/水平滑动
const touchOffsetX = ref(0) // 手指跟随偏移量（px）
const isSwiping = ref(false) // 手指是否按下跟随时
const isHorizontalSwipe = ref(false) // 是否已确认为水平滑动
const isAnimating = ref(false) // 动画进行中，阻止手势
const SWIPE_THRESHOLD = 50 // 触发翻页的最小偏移 px
const SWIPE_DAMPING = 0.25 // 超出边界时的阻尼系数

// 所有可滑动模块定义（与 ModuleSelector 保持一致，enable 为首页）
const allSwipeModules = [
  { key: 'enable', label: '启用配置', gameId: [1, 2] },
  { key: 'plant', label: '自动种植', gameId: [1, 2] },
  { key: 'order', label: '订单管理', gameId: [1, 2] },
  { key: 'alt', label: '小号管理', gameId: [1] },
  { key: 'stealFlower', label: '摸花管理', gameId: [1] },
  { key: 'steal', label: '摸花/爬架管理', gameId: [2] },
  { key: 'shop', label: '店铺管理', gameId: [1] },
  { key: 'guild', label: '公会配置', gameId: [1, 2] },
  { key: 'exchangeCode', label: '兑换码', gameId: [2] },
  { key: 'activity', label: '活动配置', gameId: [2] },
  { key: 'autoAd', label: '自动广告', gameId: [2] },
  { key: 'other', label: '其他配置', gameId: [1, 2] },
]

// 根据当前游戏ID过滤可用的滑动模块列表
const swipeModuleList = computed(() => {
  const gid = gameId.value
  if (!gid) return []
  return allSwipeModules.filter((m) => m.gameId.includes(gid))
})

// 当前选中模块在 swipeModuleList 中的索引
const swipeCurrentIndex = computed(() => {
  const idx = swipeModuleList.value.findIndex((m) => m.key === selectedModule.value)
  return idx >= 0 ? idx : 0
})

// 计算 track 的 translateX 偏移
// 基准位置 = -currentIndex * 100vw，加上手指跟随偏移
const swipeTrackStyle = computed(() => {
  const baseX = -swipeCurrentIndex.value * 100
  const offset = touchOffsetX.value
  // 当不是手指跟随状态且偏移为0时，不设置 transform 避免不必要的 GPU 合成
  if (!isSwiping.value && offset === 0 && !isAnimating.value) {
    return { transform: `translateX(${baseX}%)` }
  }
  // 计算实际偏移：基准 + 手指偏移（换算成百分比）
  // 注意：touchOffsetX 是 px，需要换算成百分比
  // 我们用 vw 单位来保证适配
  const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth
  const offsetPercent = areaWidth > 0 ? (offset / areaWidth) * 100 : 0
  return { transform: `translateX(${baseX + offsetPercent}%)` }
})

// ----- 触摸事件 — iOS 17 原生翻页逻辑 -----

function onSwipeTouchStart(e) {
  if (isAnimating.value) return
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchOffsetX.value = 0
  isSwiping.value = true
  isHorizontalSwipe.value = false
}

function onSwipeTouchMove(e) {
  if (!isSwiping.value || isAnimating.value) return

  const touch = e.touches[0]
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value

  // 方向锁定：首次判断是水平还是垂直滑动
  if (!isHorizontalSwipe.value) {
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    // 如果垂直距离 > 水平距离，说明是上下滑动，忽略横向操作
    // 设置一个最小触发距离（10px）避免误判微小的手指抖动
    if (absDy > absDx && absDy > 10) {
      // 垂直滑动 → 取消本次滑动，让页面正常上下滚动
      isSwiping.value = false
      touchOffsetX.value = 0
      return
    }
    // 水平距离 > 垂直距离且足够大 → 确认为水平滑动
    if (absDx > absDy && absDx > 10) {
      isHorizontalSwipe.value = true
    }
  }

  if (!isHorizontalSwipe.value) return

  // 水平滑动 — 边界阻尼效果
  const idx = swipeCurrentIndex.value
  const list = swipeModuleList.value
  if ((idx === 0 && dx > 0) || (idx === list.length - 1 && dx < 0)) {
    // 超出边界：施加阻尼，让拖拽感觉更自然
    touchOffsetX.value = dx * SWIPE_DAMPING
  } else {
    touchOffsetX.value = dx
  }
}

function onSwipeTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  isHorizontalSwipe.value = false

  const offset = touchOffsetX.value
  const absOffset = Math.abs(offset)
  const idx = swipeCurrentIndex.value
  const list = swipeModuleList.value

  // 计算容器宽度（用于判断翻页是否超过一半）
  const areaWidth = swipeAreaRef.value?.offsetWidth || window.innerWidth

  // 判断是否应该翻页
  let targetIndex = idx
  const threshold = Math.min(SWIPE_THRESHOLD, areaWidth * 0.2)

  if (absOffset > threshold) {
    if (offset < 0 && idx < list.length - 1) {
      targetIndex = idx + 1 // 左滑 → 下一页
    } else if (offset > 0 && idx > 0) {
      targetIndex = idx - 1 // 右滑 → 上一页
    }
  }

  // 如果目标页和当前页不同，切换
  if (targetIndex !== idx) {
    isAnimating.value = true
    const targetModule = list[targetIndex]
    selectedModule.value = targetModule.key
    localStorage.setItem('currentSelectedModule', targetModule.key)
    touchOffsetX.value = 0
    // 动画结束后解锁
    setTimeout(() => {
      isAnimating.value = false
    }, 350)
  } else {
    // 回弹到当前页 — 直接将偏移置0触发回弹动画
    touchOffsetX.value = 0
  }
}

// 点击指示器圆点跳转 — 直接跳转，带 iOS 弹簧动画
function swipeToModule(index) {
  const module = swipeModuleList.value[index]
  if (!module || isAnimating.value || index === swipeCurrentIndex.value) return
  isAnimating.value = true

  // 更新模块
  selectedModule.value = module.key
  localStorage.setItem('currentSelectedModule', module.key)
  touchOffsetX.value = 0

  // 动画完成后解锁
  setTimeout(() => {
    isAnimating.value = false
  }, 350)
}

// ===== 动态高度：swipe-area 高度跟随当前页面内容变化 =====
const swipeAreaHeight = ref('auto')
const pageRefMap = {} // { [key]: HTMLElement }
let resizeObserver = null
let heightUpdatePending = false // 防抖标记

function setPageRef(el, key) {
  if (el) {
    pageRefMap[key] = el
  }
}

// 计算最终高度（内容高度 vs 最小高度）
function calcFinalHeight(el) {
  const contentHeight = el.scrollHeight

  // 上方已占空间
  let topOffset = 56
  const fixedCard = document.querySelector('.fixed-top-card')
  if (fixedCard) topOffset += fixedCard.offsetHeight || 0
  const indicator = document.querySelector('.swipe-indicator')
  if (indicator) topOffset += indicator.offsetHeight || 0
  topOffset += 120 // bottom-nav

  const minHeight = Math.max(200, window.innerHeight - topOffset)
  return Math.max(contentHeight, minHeight)
}

// 设置高度（跳过 transition，直接瞬间改变）
function setHeightImmediate(height) {
  swipeAreaHeight.value = height > 0 ? height + 'px' : 'auto'
}

// 平滑过渡到新高度（使用 transition）
function setHeightAnimated(height) {
  swipeAreaHeight.value = height > 0 ? height + 'px' : 'auto'
}

// 获取当前页面元素的实际高度并应用
function updateSwipeAreaHeight(animated = false) {
  if (heightUpdatePending) return
  heightUpdatePending = true
  requestAnimationFrame(() => {
    heightUpdatePending = false
    const currentKey = selectedModule.value
    const el = pageRefMap[currentKey]
    if (el) {
      const h = calcFinalHeight(el)
      if (animated) {
        setHeightAnimated(h)
      } else {
        setHeightImmediate(h)
      }
    }
  })
}

// 监听当前页面内容变化
function observeCurrentPage() {
  if (resizeObserver) resizeObserver.disconnect()
  // 用 requestAnimationFrame 防抖，避免频繁触发
  resizeObserver = new ResizeObserver(() => {
    // 手指拖拽或动画中不触发高度变化
    if (isSwiping.value || isAnimating.value) return
    updateSwipeAreaHeight(true)
  })
  const currentKey = selectedModule.value
  const el = pageRefMap[currentKey]
  if (el) {
    resizeObserver.observe(el)
  }
}

// 在 selectedModule 变化时切换监听的目标
watch(
  () => selectedModule.value,
  () => {
    // 先用最小高度撑住，避免高度跳动
    const fallbackH = Math.max(200, window.innerHeight - 200)
    setHeightImmediate(fallbackH)

    // 等 DOM 更新后，用新内容的高度（不带动画，等 transform 完成后再过渡）
    nextTick(() => {
      updateSwipeAreaHeight(false)
      observeCurrentPage()
    })
  },
)

// 运行状态
const runningStatus = computed(() => {
  if (currentUser.value.refreshNeed == 1) return -1
  return currentUser.value.runStatus
})

// ===== 缓存读写 =====
// 将最新的 accountInfo 快照写入缓存
function cacheAccountInfo(data) {
  try {
    localStorage.setItem(ACCOUNT_INFO_CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_USER_ID_KEY, currentUserId.value)
  } catch (e) {
    // localStorage 满或不可用时静默失败
  }
}

// 从缓存中恢复 accountInfo，返回 true 表示成功恢复
function restoreFromCache() {
  const cachedUserId = localStorage.getItem(CACHE_USER_ID_KEY)
  // 仅当缓存的用户 ID 与当前一致时才恢复
  if (cachedUserId && cachedUserId === currentUserId.value) {
    const cached = localStorage.getItem(ACCOUNT_INFO_CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.config) {
          accountInfo.value = parsed
          return true
        }
      } catch (e) {
        // 缓存损坏则忽略
      }
    }
  }
  return false
}

// 清除缓存（切换用户时调用）
function clearAccountInfoCache() {
  localStorage.removeItem(ACCOUNT_INFO_CACHE_KEY)
  localStorage.removeItem(CACHE_USER_ID_KEY)
}

// 获取配置
const getConfig = async (force = false) => {
  // 如果有未保存的修改且不是强制刷新，则只更新 systemUser 部分（用户状态），不覆盖 config
  const skipConfig = hasUnsavedChanges.value && !force
  let url = '/config/get'
  if (currentUserId.value) url += `?userId=${currentUserId.value}`
  try {
    const { data, code } = await request({ method: 'get', url })
    if (code !== 200) {
      showNotify({ type: 'warning', message: '请先登陆游戏！' })
      return
    }
    if (skipConfig) {
      // 只更新 systemUser 部分（runStatus、refreshNeed 等用户状态），保留用户正在修改的 config
      const oldConfig = accountInfo.value?.config
      accountInfo.value = {
        ...(accountInfo.value || {}),
        ...data,
        config: oldConfig || data.config,
      }
      // 不重置 hasUnsavedChanges 和 initialConfigState，保留用户未保存的修改
    } else {
      if (lastUserId.value == null) {
        accountInfo.value = { ...data }
      } else {
        accountInfo.value = {
          ...accountInfo.value,
          ...data,
          config: accountInfo.value.config || data.config,
        }
      }
      lastUserId.value = currentUserId.value

      // 初始化基准状态
      initialConfigState.value = cloneDeep(config.value)
      hasUnsavedChanges.value = false
    }
    friends.value = (currentUser.value.gameUser.friends || []).map((item) => ({
      value: item.userId,
      text: item.townName,
    }))
    nextRunTime.value = currentUser.value.nextRunTime

    // 首次无用户时自动选第一个
    if (!currentUserId.value && accountInfo.value.systemUser?.otherUsers?.length) {
      currentUserId.value = accountInfo.value.systemUser.otherUsers[0].id
      localStorage.setItem('currentUserId', currentUserId.value)
    }

    // 写入缓存，供下次快速回显
    cacheAccountInfo(accountInfo.value)

    // 标记数据已就绪（可能有缓存提前标记过，但以接口返回为准）
    isDataReady.value = true

    // 接口数据返回后，重新计算 swipe-area 高度
    nextTick(() => {
      updateSwipeAreaHeight(false)
      observeCurrentPage()
    })
  } catch {
    showNotify({ type: 'danger', message: '网络错误，无法获取配置' })
  }
}

// 保存配置
const saveConfig = async () => {
  if (
    currentUser.value.gameId == 2 &&
    updateModalRef.value &&
    (await updateModalRef.value.checkVersionUpdate())
  )
    return
  if (!accountInfo.value) return
  let url = '/config/update'
  if (currentUserId.value) url += `?userId=${currentUserId.value}`

  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '保存中...',
    loadingType: 'spinner',
  })

  try {
    const { flowers, ...newData } = accountInfo.value || {}
    const { code, remark } = await request({ method: 'post', url, data: newData })
    if (code === 200) {
      showNotify({ type: 'success', message: '保存成功' })
      initialConfigState.value = cloneDeep(config.value)
      hasUnsavedChanges.value = false
      await getConfig()
    } else {
      showNotify({ type: 'danger', message: remark || '保存失败' })
    }
  } finally {
    saveToast.value?.close()
  }
}

// 启动/停止
const triggerRobot = async (isBatch = false) => {
  if (!accountInfo.value) return
  let baseUrl = '/config/'
  const currentStatus = runningStatus.value
  if (currentStatus == 0) {
    if (hasUnsavedChanges.value) await saveConfig()
    baseUrl += 'run'
  } else if (currentStatus == 1 || currentStatus == 2) {
    baseUrl += 'stop'
  } else return

  const targetUserIds = isBatch
    ? (systemUser.value.otherUsers || [])
        .filter((u) => (currentStatus == 0 ? u.runStatus === 0 : [1, 2].includes(u.runStatus)))
        .map((u) => u.id)
    : [currentUserId.value]

  if (targetUserIds.length === 0) {
    showNotify({ type: 'primary', message: '所有账号已处于目标状态' })
    return
  }

  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: `${isBatch ? '一键' : ''}${currentStatus == 0 ? '启动' : '停止'}中...`,
    loadingType: 'spinner',
  })

  let success = 0,
    fail = 0
  for (const uid of targetUserIds) {
    try {
      const { code } = await request({ method: 'get', url: `${baseUrl}?userId=${uid}` })
      code === 200 ? success++ : fail++
    } catch {
      fail++
    }
  }

  showNotify({
    type: success > 0 ? 'success' : 'danger',
    message: `操作完成：成功${success}个，失败${fail}个`,
  })
  await getConfig()
  saveToast.value?.close()
}

// 用户切换
const handleUserChange = async (newUserId, restart = false) => {
  currentUserId.value = newUserId
  localStorage.setItem('currentUserId', newUserId)
  lastUserId.value = null
  // 切换用户，清除旧缓存；接口返回后会重新写入新缓存
  clearAccountInfoCache()
  isDataReady.value = false
  await getConfig(true)
  if (restart) await restartRobot()
}

// 重启机器人（如果正在运行则先停止再启动）
const restartRobot = async () => {
  if (runningStatus.value === 1 || runningStatus.value === 2) {
    await triggerRobot()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await triggerRobot()
  }
}

// 其他方法
const toLog = () => router.push({ name: 'log', query: { userId: currentUser.value.id } })
const openAccountModal = () => {
  if (!systemUserLocal.value) return router.push({ name: 'login' })
  // 通过 BottomNav 的 AccountBindSheet 子组件打开账号绑定
  if (bottomNavRef.value?.openAccountBindSheet) {
    bottomNavRef.value.openAccountBindSheet()
  } else {
    showNotify({ type: 'primary', message: '请点击底部「更多 → 账号绑定」' })
  }
}
// 跳转到登录/注册页
const goToLogin = () => {
  router.push({ name: 'login' })
}

// 打开活动面板（通过触发 BottomNav 的更多菜单 → 活动）
const openActivityPanel = () => {
  // 尝试直接触发 BottomNav 的 openActivityPanel 方法
  if (bottomNavRef.value && bottomNavRef.value.openActivityPanel) {
    bottomNavRef.value.openActivityPanel()
    return
  }
  // 降级：滚动到底部导航并提示
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  showNotify({ type: 'primary', message: '请点击底部「更多 → 活动」领取新人试用' })
}

// 滚动到 UserStatusCard 位置并打开时长分配弹窗
const scrollToVipCard = () => {
  const el = document.querySelector('.user-status-card')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-flash')
    setTimeout(() => el.classList.remove('highlight-flash'), 1500)
  }
  // 延迟打开时长分配弹窗（等待滚动完成）
  setTimeout(() => {
    if (userStatusCardRef.value) {
      userStatusCardRef.value.openAllocationPopup()
    }
  }, 500)
}

const handleUserAction = () => {
  /* 由 BottomNav 处理 */
}
const goToProfile = () => {}
const goToSecurity = () => {}
const logout = () => {
  userStore.clearUserInfo()
  clearAccountInfoCache()
  isDataReady.value = false
  showNotify({ type: 'success', message: '已退出登录' })
}
const handleConfigUpdate = (newConfig) => {
  Object.assign(accountInfo.value.config, newConfig)
  hasUnsavedChanges.value = true
}
const handleExpandStateUpdate = (newStates) => {
  expandStates.value = { ...newStates }
}
const toggleExpand = () => {} // VIP 升级占位

// 初始化
onMounted(() => {
  // 第一步：尝试从缓存恢复数据，让视图立即渲染（无闪烁）
  const hasCache = restoreFromCache()
  if (hasCache) {
    // 有缓存：直接标记就绪，先展示上次的视图
    isDataReady.value = true
    // 复用了缓存数据的 friends 和 nextRunTime 也需要恢复
    const cached = accountInfo.value
    if (cached?.systemUser?.currentUser?.gameUser?.friends) {
      friends.value = cached.systemUser.currentUser.gameUser.friends.map((item) => ({
        value: item.userId,
        text: item.townName,
      }))
    }
    if (cached?.systemUser?.currentUser?.nextRunTime) {
      nextRunTime.value = cached.systemUser.currentUser.nextRunTime
    }
  }
  // 第二步：发起网络请求获取最新数据
  // 有缓存时 isDataReady 已为 true，但接口返回后会用最新数据覆盖
  getConfig()
  const interval = setInterval(() => getConfig(), 20000)
  window.addEventListener('beforeunload', () => clearInterval(interval))

  // 初始化 swipe-area 高度观察（等 DOM 渲染后执行）
  nextTick(() => {
    updateSwipeAreaHeight(false)
    observeCurrentPage()
  })

  // 窗口 resize 时重新计算高度
  window.addEventListener('resize', onWindowResize)
})

// 窗口尺寸变化重算高度
function onWindowResize() {
  updateSwipeAreaHeight(false)
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  max-width: 780px;
  background: linear-gradient(170deg, #fef6f9 0%, #fdf1f5 30%, #faf0f4 60%, #f8f4f7 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-bottom: 120px;
  margin: auto;
}

.fixed-top-card {
  position: sticky;
  top: 0;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  z-index: 10;
  background: rgba(254, 246, 249, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 0 0 18px 18px;
  box-shadow: 0 2px 12px rgba(180, 120, 140, 0.08);
}

.user-status-card {
  background: transparent !important;
  box-shadow: none !important;
  margin: 0;
}

.config-wrapper {
  padding: 4px 0 30px;
  position: relative;
  z-index: 1;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
}

.non-vip-section {
  margin-top: 16px;
}

.upgrade-tip-card {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
  border: 1px solid #ffe58f;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(250, 173, 20, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-content {
  flex: 1;
}

.upgrade-title {
  font-size: 15px;
  font-weight: 600;
  color: #faad14;
  margin-bottom: 4px;
}

.upgrade-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.upgrade-btn {
  white-space: nowrap;
}

/* ========== 未绑定账号引导样式 ========== */
.no-account-guide {
  padding: 0 16px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeInGuide 0.6s ease;
}

@keyframes fadeInGuide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.guide-arrow-container {
  display: flex;
  justify-content: center;
  margin: 16px 0 8px;
}

.guide-svg-arrow {
  animation: arrowBounce 2s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

.guide-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(255, 103, 103, 0.12);
  border: 1.5px dashed #ff6767;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.guide-card:hover,
.guide-card:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(255, 103, 103, 0.2);
  background: #fff8f8;
}

.guide-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 103, 103, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-text {
  flex: 1;
  min-width: 0;
}

.guide-title {
  font-size: 15px;
  font-weight: 600;
  color: #ff6767;
  margin-bottom: 4px;
}

.guide-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
}

.guide-bounce-arrow {
  flex-shrink: 0;
  animation: guideArrowBounce 1.5s ease-in-out infinite;
}

@keyframes guideArrowBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

/* 登录引导卡片（粉色风格） */
.guide-card-login {
  border-color: #f472b6;
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.15);
}

.guide-card-login:hover,
.guide-card-login:active {
  box-shadow: 0 6px 28px rgba(244, 114, 182, 0.25);
  background: #fef7ff;
}

.guide-icon-login {
  background: rgba(244, 114, 182, 0.12);
}

/* VIP 引导卡片（金色风格） */
.guide-card-vip {
  border-color: #faad14;
  box-shadow: 0 4px 20px rgba(250, 173, 20, 0.12);
}

.guide-card-vip:hover,
.guide-card-vip:active {
  box-shadow: 0 6px 28px rgba(250, 173, 20, 0.22);
  background: #fffbe6;
}

.guide-card-vip .guide-title {
  color: #d48806;
}

.guide-icon-vip {
  background: rgba(250, 173, 20, 0.12);
}

.guide-bounce-arrow-up {
  flex-shrink: 0;
  animation: guideArrowUpBounce 1.5s ease-in-out infinite;
}

@keyframes guideArrowUpBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 高亮闪烁动画（滚动到 VIP 卡片时） */
:global(.highlight-flash) {
  animation: highlightPulse 1.5s ease;
}

@keyframes highlightPulse {
  0%,
  100% {
    box-shadow: none;
  }
  50% {
    box-shadow: 0 0 0 4px rgba(250, 173, 20, 0.4);
  }
}

/* ============================================================
   📱 iOS 17 卡片式横向分页滑动
   - swipe-track: 所有页面水平排列，flex 行
   - swipe-animating: iOS 弹簧曲线过渡
   - swipe-page: 每个页面占满 swipe-area 宽度
   ============================================================ */

/* 滑动容器 — 固定宽度，overflow hidden，禁止水平滚动 */
.swipe-area {
  margin-top: 4px;
  touch-action: pan-y;
  overflow: hidden;
  position: relative;
  width: 100%;
  will-change: height;
}

/* 轨道 — 水平排列所有页面 */
.swipe-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start; /* 顶部对齐，不被拉伸 */
  width: auto;
  will-change: transform;
}

/* 动画进行时（非手指跟随状态）：iOS 弹簧曲线 */
.swipe-animating {
  transition: transform 0.35s cubic-bezier(0.32, 0.94, 0.6, 1) !important;
}

/* 每个页面占满 100% 宽度 */
.swipe-page {
  flex: 0 0 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  padding: 0 8px;
}

/* 指示器圆点 (iOS 17 风格) */
.swipe-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 4px;
}

.swipe-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dccec7;
  cursor: pointer;
  transition: all 0.3s ease;
}

.swipe-dot.active {
  width: 18px;
  border-radius: 3px;
  background: linear-gradient(90deg, #c08ca8, #d4a0b8);
  box-shadow: 0 1px 4px rgba(180, 120, 140, 0.3);
}

.swipe-dot:hover {
  background: #c4a8b4;
}

.swipe-dot.active:hover {
  background: linear-gradient(90deg, #c08ca8, #d4a0b8);
}

/* ========== 🦴 骨架屏 ========== */
.skeleton-container {
  padding: 16px;
  animation: skeletonFadeIn 0.3s ease;
}

@keyframes skeletonFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-top-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(180, 120, 140, 0.08);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0e8ec;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 14px;
  border-radius: 8px;
  background: #f0e8ec;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.skeleton-card {
  height: 90px;
  border-radius: 16px;
  background: #f0e8ec;
}

@keyframes skeletonPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.skeleton-pulse {
  animation: skeletonPulse 1.6s ease-in-out infinite;
}
</style>
