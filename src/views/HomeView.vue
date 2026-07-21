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
          ref="userStatusCardRef"
          class="user-status-card"
          :system-user="systemUser"
          @update:current-user="handleUserChange"
          @allot-success="() => getConfig(true)"
        />
      </div>

      <div class="config-wrapper" v-if="currentUser && currentUser?.subscribe?.subscribeId >= 0">
        <!-- VIP 子配置 — 滑动分页组件 -->
        <template v-if="currentUser && currentUser?.subscribe?.subscribeId > 0">
          <SwipeModule
            v-model="selectedModule"
            v-model:direction="swipeDirection"
            :game-id="currentUser.gameId"
            :module-defs="visibleSwipeModules"
          >
            <template #enable>
              <LoginConfig
                v-model:login="config.login"
                :current-user="currentUser"
                :next-run-time="nextRunTime"
                :schedule-time-info="accountInfo.scheduleTimeInfo"
                @get-config="getConfig"
                :key="currentUser?.id"
              />
            </template>
            <template #plant>
              <PlantConfig
                v-model:plantConfig="plantConfig"
                :currentUser="currentUser"
                :availableSeeds="availableSeeds"
              />
            </template>
            <template #order>
              <OrderConfig v-model="orderConfig" :currentUser="currentUser" />
            </template>
            <template #alt>
              <AltConfig
                v-model:autoAccept="config.autoAccept"
                v-model:userAlts="accountInfo.userAlts"
                :currentUser="currentUser"
                :friends="friends"
              />
            </template>
            <template #stealFlower>
              <StealFlowerConfig
                v-model="stealFlowerConfig"
                :currentUser="currentUser"
                :friends="friends"
                :availableSeeds="availableSeeds"
                :currentUserId="currentUserId"
              />
            </template>
            <template #steal>
              <StealConfig
                :user="currentUser"
                :config="config"
                :friends="currentUser.gameUser.friends || []"
                :expand-states="expandStates"
                @update:config="handleConfigUpdate"
                @update-expand-states="handleExpandStateUpdate"
              />
            </template>
            <template #shop>
              <ShopConfig
                v-model="shopConfig"
                :currentUser="currentUser"
                :friends="friends"
                :availableSeeds="availableSeeds"
                :tradeMap="tradeMap"
              />
            </template>
            <template #guild>
              <GuildConfig
                :user="currentUser"
                :config="config"
                :expand-states="expandStates"
                @update:config="handleConfigUpdate"
                @update-expand-states="handleExpandStateUpdate"
              />
            </template>
            <template #exchangeCode>
              <ExchangeCodeConfig
                v-model:autoExchange="config.autoExchange"
                :currentUserId="currentUserId"
              />
            </template>
            <template #activity>
              <ActivityConfig
                :user="currentUser"
                :config="config"
                :expand-states="expandStates"
                @update:config="handleConfigUpdate"
                @update-expand-states="handleExpandStateUpdate"
              />
            </template>
            <template #autoAd>
              <AutoAdConfig
                :user="currentUser"
                :config="config"
                :expand-states="expandStates"
                @update:config="handleConfigUpdate"
                @update-expand-states="handleExpandStateUpdate"
              />
            </template>
            <template #other>
              <OtherConfig
                :user="currentUser"
                :config="config"
                :expand-states="expandStates"
                @update:config="handleConfigUpdate"
                @update-expand-states="handleExpandStateUpdate"
              />
            </template>
          </SwipeModule>
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
        v-model:swipe-direction="swipeDirection"
      />

      <!-- 底部导航 -->
      <SetupGuide
        v-model="showSetupSpotlight"
        :step="activeSetupGuideStep"
        @primary="handleSetupGuidePrimary"
        @dismiss="dismissSetupGuide"
      />
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
import { onMounted, onUnmounted, ref, computed, defineAsyncComponent, watch } from 'vue'
import request from '@/utils/request'
import { showLoadingToast, showNotify } from 'vant'
import flowerUtil from '@/utils/flowerUtil'
import router from '@/router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import BottomNav from '@/components/BottomNav.vue'
import SwipeModule from '@/components/SwipeModule.vue'
import SetupGuide from '@/components/SetupGuide.vue'
import { isEqual, cloneDeep } from 'lodash-es'
import { filterVisibleGameIds, isGameVisible } from '@/config/gameVisibility'

// 异步加载组件（按需加载，减少首屏 JS 体积）
const VersionChecker = defineAsyncComponent(() => import('@/components/VersionChecker.vue'))
const StealConfig = defineAsyncComponent(() => import('@/components/StealConfigModal.vue'))
const UserStatusCard = defineAsyncComponent(() => import('@/components/UserStatusCard.vue'))
const GuildConfig = defineAsyncComponent(() => import('@/components/GuildConfig.vue'))
const OtherConfig = defineAsyncComponent(() => import('@/components/OtherConfig.vue'))
const ActivityConfig = defineAsyncComponent(() => import('@/components/ActivityConfig.vue'))
const AutoAdConfig = defineAsyncComponent(() => import('@/components/AutoAdConfig.vue'))
const LoginConfig = defineAsyncComponent(() => import('@/components/LoginConfig.vue'))
const PlantConfig = defineAsyncComponent(() => import('@/components/PlantConfig.vue'))
const OrderConfig = defineAsyncComponent(() => import('@/components/OrderConfig.vue'))
const AltConfig = defineAsyncComponent(() => import('@/components/AltConfig.vue'))
const StealFlowerConfig = defineAsyncComponent(() => import('@/components/StealFlowerConfig.vue'))
const ShopConfig = defineAsyncComponent(() => import('@/components/ShopConfig.vue'))
const ExchangeCodeConfig = defineAsyncComponent(() => import('@/components/ExchangeCodeConfig.vue'))
const ModuleSelector = defineAsyncComponent(() => import('@/components/ModuleSelector.vue'))

const userStore = useUserStore()
const { userInfo: systemUserLocal } = storeToRefs(userStore)

const CURRENT_USER_ID_KEY = 'currentUserId'
const getCurrentUserIdStorageKey = () => {
  const accountKey = systemUserLocal.value?.id || systemUserLocal.value?.userName
  return accountKey ? `${CURRENT_USER_ID_KEY}:${accountKey}` : CURRENT_USER_ID_KEY
}
const loadCurrentUserId = () => localStorage.getItem(getCurrentUserIdStorageKey()) || ''
const persistCurrentUserId = (userId) => {
  const storageKey = getCurrentUserIdStorageKey()
  if (userId) {
    localStorage.setItem(storageKey, userId)
  } else {
    localStorage.removeItem(storageKey)
  }
  if (storageKey !== CURRENT_USER_ID_KEY) {
    localStorage.removeItem(CURRENT_USER_ID_KEY)
  }
}

// 引用
const updateModalRef = ref(null)
const bottomNavRef = ref(null)
const userStatusCardRef = ref(null)
const saveToast = ref()

// 当前选中的模块（默认显示启用配置，从 localStorage 恢复）
const selectedModule = ref(localStorage.getItem('currentSelectedModule') || 'enable')

// 滑动方向（默认左右滑动，从 localStorage 恢复）
const swipeDirection = ref(localStorage.getItem('swipeDirection') || 'horizontal')

// 用户与配置
const currentUserId = ref(loadCurrentUserId())
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
const configGetCode = ref(null)
const showSetupSpotlight = ref(false)
const dismissedSetupGuideId = ref(localStorage.getItem('dismissedSetupGuideId') || '')

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
  () => {
    const user = accountInfo.value.systemUser
    if (!user) {
      return {
      otherUsers: [],
      currentUser: null,
      times: {},
      userName: '',
      nickName: '',
      }
    }
    const otherUsers = (user.otherUsers || []).filter((otherUser) => isGameVisible(otherUser.gameId))
    const currentUser = isGameVisible(user.currentUser?.gameId) ? user.currentUser : null
    return {
      ...user,
      otherUsers,
      currentUser,
    }
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
      quality: {
        status: 0,
        categoryNum: 0,
        level: 1,
        tidy: true,
        taskTidy: false,
        color: [],
        taskPlant: {
          status: 0,
          tasks: [],
        },
        elves: {
          status: 0,
          mainSeedId: '',
          subSeedId: '',
          plantTime: 0,
          helpCount: 0,
          clearMode: 0,
          harvestSpeedMode: 0,
          harvestMode: 2,
          harvestWaitingTime: 30,
        },
      },
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

const shouldShowSetupGuide = computed(() => configGetCode.value === 204)

const showLoginSetupGuideCard = computed(
  () => shouldShowSetupGuide.value && !systemUserLocal.value,
)

const showBindSetupGuideCard = computed(
  () => systemUserLocal.value && !systemUser.value.currentUser,
)

const showTrialSetupGuideCard = computed(
  () =>
    systemUserLocal.value &&
    systemUser.value.currentUser &&
    currentUser.value?.subscribe?.subscribeId == -1 &&
    systemUserTimesTotalDays.value === 0,
)

const showAllotSetupGuideCard = computed(
  () =>
    systemUserLocal.value &&
    systemUser.value.currentUser &&
    currentUser.value?.subscribe?.subscribeId == -1 &&
    systemUserTimesTotalDays.value > 0,
)

const activeSetupGuideStep = computed(() => {
  if (showLoginSetupGuideCard.value) {
    return {
      id: 'setup-login',
      target: '[data-guide="login-entry"]',
      kicker: '还差一步',
      title: '当前还没有可用配置',
      desc: '你可以登录后绑定游戏账号，生成专属配置。',
      actionText: '去登录',
      accent: '#ec4899',
      radius: 18,
    }
  }
  if (showBindSetupGuideCard.value) {
    return {
      id: 'setup-bind-account',
      target: '[data-guide="more-entry"]',
      kicker: '账号绑定',
      title: '绑定游戏账号',
      desc: '绑定后才能为对应账号生成和执行配置。',
      actionText: '去绑定',
      accent: '#ff6767',
      radius: 18,
    }
  }
  if (showTrialSetupGuideCard.value) {
    return {
      id: 'setup-trial',
      target: '[data-guide="more-entry"]',
      kicker: '新人试用',
      title: '领取新人试用',
      desc: '领取后就可以开始使用小助手。',
      actionText: '去领取',
      accent: '#faad14',
      radius: 18,
    }
  }
  if (showAllotSetupGuideCard.value) {
    return {
      id: 'setup-allot',
      target: '[data-guide="vip-status"]',
      kicker: '分配时长',
      title: '分配可用会员时长',
      desc: '点击上方有效期卡片，把可用时长分配给当前游戏账号。',
      actionText: '去分配',
      accent: '#faad14',
      radius: 16,
    }
  }
  return null
})

// 可用种子列表
const availableSeeds = computed(() => {
  const staticSeeds = [...(allFlowers[gameId.value] || [])]
  const nameMap = new Map(staticSeeds.map((seed) => [String(seed.value), seed.text]))
  const accountSeeds = (accountInfo.value?.flowers || [])
    .map((item) => (typeof item === 'object' ? item.id : item))
    .filter((id) => id !== undefined && id !== null)
    .map((id) => ({
      text: nameMap.get(String(id)) || `鲜花${id}`,
      value: id,
    }))
  if (Number(gameId.value) === 3 && accountSeeds.length) return accountSeeds
  return staticSeeds.length ? staticSeeds : accountSeeds
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

// 所有可滑动模块定义（供 SwipeModule 组件使用）
const allSwipeModules = [
  { key: 'enable', label: '启用配置', gameId: [1, 2, 3] },
  { key: 'plant', label: '自动种植', gameId: [1, 2, 3] },
  { key: 'order', label: '订单管理', gameId: [1, 2, 3] },
  { key: 'alt', label: '小号管理', gameId: [1] },
  { key: 'stealFlower', label: '摸花管理', gameId: [1] },
  { key: 'steal', label: '摸花/爬架管理', gameId: [2] },
  { key: 'shop', label: '店铺管理', gameId: [1] },
  { key: 'guild', label: '公会配置', gameId: [1, 2] },
  { key: 'exchangeCode', label: '兑换码', gameId: [2] },
  { key: 'activity', label: '活动配置', gameId: [2] },
  { key: 'autoAd', label: '自动广告', gameId: [2, 3] },
  { key: 'other', label: '其他配置', gameId: [1, 2] },
]

const visibleSwipeModules = computed(() =>
  allSwipeModules.map((module) => ({
    ...module,
    gameId: filterVisibleGameIds(module.gameId),
  })),
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

function clearCurrentUserSelection() {
  currentUserId.value = ''
  localStorage.removeItem(getCurrentUserIdStorageKey())
  localStorage.removeItem(CURRENT_USER_ID_KEY)
  lastUserId.value = null
  clearAccountInfoCache()
}

const switchFromHiddenGameIfNeeded = async (data, force) => {
  const current = data?.systemUser?.currentUser
  if (!current || isGameVisible(current.gameId)) return false

  const nextUser = (data.systemUser.otherUsers || []).find((user) => isGameVisible(user.gameId))
  if (!nextUser) {
    clearCurrentUserSelection()
    return false
  }

  currentUserId.value = nextUser.id
  persistCurrentUserId(currentUserId.value)
  clearAccountInfoCache()
  await getConfig(force)
  return true
}

// 获取配置
const getConfig = async (force = false) => {
  // 如果有未保存的修改且不是强制刷新，则只更新 systemUser 部分（用户状态），不覆盖 config
  const skipConfig = hasUnsavedChanges.value && !force
  let url = '/config/get'
  if (currentUserId.value) url += `?userId=${currentUserId.value}`
  try {
    const { data, code } = await request({ method: 'get', url })
    configGetCode.value = code
    if (code === 204) {
      accountInfo.value = {
        ...(data || {}),
        config: null,
        systemUser: data?.systemUser || accountInfo.value.systemUser,
      }
      isDataReady.value = true
      return
    }
    if (code !== 200) {
      showNotify({ type: 'warning', message: '请先登陆游戏！' })
      return
    }
    if (await switchFromHiddenGameIfNeeded(data, force)) return
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
      persistCurrentUserId(currentUserId.value)
    }

    // 写入缓存，供下次快速回显
    cacheAccountInfo(accountInfo.value)

    // 标记数据已就绪（可能有缓存提前标记过，但以接口返回为准）
    isDataReady.value = true
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
  persistCurrentUserId(newUserId)
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

const handleSetupGuidePrimary = () => {
  const id = activeSetupGuideStep.value?.id
  showSetupSpotlight.value = false
  if (id === 'setup-login') return goToLogin()
  if (id === 'setup-bind-account') return openAccountModal()
  if (id === 'setup-trial') return openActivityPanel()
  if (id === 'setup-allot') return scrollToVipCard()
}

const dismissSetupGuide = () => {
  const id = activeSetupGuideStep.value?.id
  if (id) {
    dismissedSetupGuideId.value = id
    localStorage.setItem('dismissedSetupGuideId', id)
  }
  showSetupSpotlight.value = false
}

const handleUserAction = () => {
  /* 由 BottomNav 处理 */
}
const goToProfile = () => {}
const goToSecurity = () => {}
const logout = () => {
  userStore.clearUserInfo()
  clearCurrentUserSelection()
  clearAccountInfoCache()
  isDataReady.value = false
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
  // 轮询间隔改为 120 秒（原 20 秒太频繁），减轻服务器压力
  const interval = setInterval(() => getConfig(), 20000)
  // 页面不可见时暂停轮询
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面隐藏时不做什么，自然等定时器触发
      // 但如果返回时数据过期了，getConfig 会更新
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', () => clearInterval(interval))

  // 组件卸载时清除定时器，避免离开页面后仍在请求
  onUnmounted(() => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
})

watch(
  activeSetupGuideStep,
  (step) => {
    if (!step || dismissedSetupGuideId.value === step.id) {
      showSetupSpotlight.value = false
      return
    }
    window.setTimeout(() => {
      if (activeSetupGuideStep.value?.id === step.id && dismissedSetupGuideId.value !== step.id) {
        showSetupSpotlight.value = true
      }
    }, 480)
  },
  { immediate: true },
)

watch(
  gameId,
  (id) => {
    const modules = visibleSwipeModules.value.filter((m) => m.gameId.includes(id))
    if (modules.length > 0 && !modules.some((m) => m.key === selectedModule.value)) {
      selectedModule.value = modules[0].key
      localStorage.setItem('currentSelectedModule', selectedModule.value)
    }
  },
  { immediate: true },
)
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
