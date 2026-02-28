<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import request from '@/utils/request'
import timestampToFormattedDate from '@/utils/common'
import { showLoadingToast, showNotify } from 'vant'
import flowerUtil from '@/utils/flowerUtil'
import CustomArrayStepper from '@/components/icons/CustomArrayStepper.vue'
import ExchangeModal from '@/components/icons/ExchangeModal.vue'

// 搜索内容
const searchSeed = ref('')
const searchFriend = ref('')
const seedList = ref([])
const friendList = ref([])
const friends = ref([])
const saveToast = ref()

// 配置选项
const saleOptions = [
  { text: '关闭', value: 0 },
  { text: '缺花自动补种', value: 1 },
  { text: '缺花不处理', value: 2 },
]

const harvestOptions = [
  { text: '自动', value: 0 },
  { text: '手动', value: 1 },
  { text: '定时', value: 2 },
]

const challengeOptions = [
  { text: '关闭', value: 0 },
  { text: '免费挑战', value: 1 },
  { text: '付费挑战', value: 2 },
]

const donateOptions = [
  { text: '关闭', value: 0 },
  { text: '5000金币', value: 1 },
  { text: '20000金币', value: 2 },
  { text: '10玉石', value: 3 },
]

const altOptions = [{ text: '基础功能', value: 0 }]
const altOptions1 = [
  { text: '基础功能（摸花/爬架子）', value: 0 },
  { text: '完整功能', value: 1 },
]

const plantOptions = [
  { text: '关闭', value: 0 },
  {
    text: '补仓',
    value: 2,
    children: [
      { text: '鲜花>=1级', value: 2 },
      { text: '鲜花>8级', value: 3 },
      { text: '鲜花>12级', value: 4 },
    ],
  },
  { text: '自选', value: 1 },
]

// 响应式数据
const otherUsers = ref()
const currentUser = ref(localStorage.getItem('currentUser'))
const selectTime = ref()
const selectFlower = ref()
const showTimePicker = ref(false)
const showFlowerPicker = ref(false)
const showFriendPicker = ref(false)
const showPlant = ref(false)
const plantText = ref()
const friendInfo = ref({ flowers: [], exchangeCount: 10 })
const friendKey = ref()
const friendValue = ref()
const cascaderValue = ref([])
const tradeMap = flowerUtil.getFlowerTradeMap()
const exchangeModalRef = ref(null)

// 【新增】底部导航栏相关状态
const showMoreMenu = ref(false) // 控制"更多"二级菜单显示
const moreMenuRef = ref(null) // 更多菜单的DOM引用，用于点击外部关闭

const openExchangeModal = () => {
  exchangeModalRef.value.openModal()
}

// 用户配置信息
const accountInfo = ref({
  running: false,
})

const gameId = computed(() => accountInfo.value.user.gameId)

const user = computed(
  () =>
    accountInfo.value.user || {
      refreshNeed: false,
      subscribe: { subscribeId: -1 },
      gameUser: {},
      otherUsers: [],
      userName: '',
    },
)

const config = computed(
  () =>
    accountInfo.value.config || {
      enable: false,
      autoPlant: 0,
      autoSale: false,
      flowers: [],
      periods: [],
      steals: [],
      userAlts: [],
      shopItems: [],
      autoComplete: 0,
      autoChallenge: 0,
      orderMaxNum: 0,
      autoHarvest: 0,
      harvestWaitingTime: 30,
      autoAccept: false,
      autoSteal: false,
      autoSell: false,
      autoGuildPlant: false,
      autoDonate: 0,
      autoCultivate: false,
      autoShop: false,
      autoMonster: false,
      autoRob: false,
      betterGame: false,
      autoGame: false,
      autoBuy: false,
      altsUser: [],
      gameUser: { friends: [] },
      autoAd: false,
      autoGuildAd: false, // 新增社团广告开关
    },
)

const allFlowers = flowerUtil.getAllFlowers()

const tradeInfo = (out) => {
  if (!out || !out.seedId) {
    return [0]
  }
  if (out.seedId == -1) {
    return ['低价', '平价', '高价']
  }
  const trade = tradeMap.get(out.seedId)
  if (trade == null) {
    return [0]
  }
  return [trade.minPrice, trade.defaultPrice, trade.maxPrice]
}

// 运行状态计算属性（增强视觉区分）
const runningStatusDesc = computed(() => {
  if (runningStatus.value == -1) {
    return {
      icon: 'close',
      text: '需要重新登录游戏',
      color: '#ff4d4f',
      bgColor: 'rgba(255, 77, 79, 0.1)',
      borderColor: 'rgba(255, 77, 79, 0.2)',
    }
  } else if (runningStatus.value == 0) {
    return {
      icon: 'play-circle-o',
      text: '状态：未启用',
      color: '#8c8c8c',
      bgColor: 'rgba(140, 140, 140, 0.1)',
      borderColor: 'rgba(140, 140, 140, 0.2)',
    }
  } else if (runningStatus.value == 1) {
    return {
      icon: 'passed',
      text: '状态：运行中...',
      color: '#52c41a',
      bgColor: 'rgba(82, 196, 26, 0.1)',
      borderColor: 'rgba(82, 196, 26, 0.2)',
    }
  }
  return {
    icon: 'close',
    text: '状态：异常',
    color: '#fa8c16',
    bgColor: 'rgba(250, 140, 22, 0.1)',
    borderColor: 'rgba(250, 140, 22, 0.2)',
  }
})

const runningStatus = computed(() => {
  // 需要重新登录
  if (user.value.refreshNeed == 1) {
    return -1
  }
  // 运行中
  if (accountInfo.value.running) {
    return 1
  }
  // 未启用
  return 0
})

// 格式化时间
const formatTime = (milliseconds) => {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000))
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// 日期转时间戳
const toTime = (timeArr) => {
  return (timeArr[0] * 60 * 60 + timeArr[1] * 60) * 1000
}

// 时间格式化器
const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
}

// 折叠面板状态
const expandStates = ref({})

// 初始化折叠面板状态
const initExpandStates = () => {
  const userId = currentUser.value || 'default'
  const savedStates = JSON.parse(localStorage.getItem(`expandStates_${userId}`) || '{}')

  expandStates.value = {
    mainSwitch: savedStates.mainSwitch ?? true,
    plantConfig: savedStates.plantConfig ?? true,
    orderConfig: savedStates.orderConfig ?? true,
    altConfig: savedStates.altConfig ?? true,
    stealConfig: savedStates.stealConfig ?? true,
    guildConfig: savedStates.guildConfig ?? true,
    otherFeatures: savedStates.otherFeatures ?? true,
    vip3Config: savedStates.vip3Config ?? true,
    tradeConfig: savedStates.tradeConfig ?? true,
    nonVipSteal: savedStates.nonVipSteal ?? true,
    tradeInConfig: savedStates.tradeInConfig ?? true,
  }
}

// 保存折叠状态到本地存储
const saveExpandState = (key, state) => {
  const userId = currentUser.value || 'default'
  const states = JSON.parse(localStorage.getItem(`expandStates_${userId}`) || '{}')
  states[key] = state
  localStorage.setItem(`expandStates_${userId}`, JSON.stringify(states))
}

// 切换折叠状态
const toggleExpand = (key) => {
  expandStates.value[key] = !expandStates.value[key]
  saveExpandState(key, expandStates.value[key])
}

// 弹出层方法
const showTime = (period, field) => {
  selectTime.value = [period, field]
  showTimePicker.value = true
}

const showFlower = (flower) => {
  seedList.value = []
  seedList.value.push(
    ...allFlowers[gameId.value].filter((f) => accountInfo.value.flowers.includes(f.value)),
  )
  selectFlower.value = flower
  showFlowerPicker.value = true
}

const showFriendAccept = (accept) => {
  friendList.value = [...friends.value]
  friendKey.value = 'userName'
  friendValue.value = 'openId'
  selectFlower.value = accept
  showFriendPicker.value = true
}

const showFriendSteal = (steal, limit = true) => {
  friendKey.value = 'townName'
  friendValue.value = 'userId'
  let altUserOpenIds = accountInfo.value.altsUser.map((friend) => friend.openId)
  friendList.value = friends.value.filter(
    (friend) => altUserOpenIds.includes(friend.value) || !limit,
  )
  if (user.value.subscribe.subscribeId != 0) {
    friendList.value = [{ value: '-1', text: '所有人' }, ...friendList.value]
  }
  selectFlower.value = steal
  showFriendPicker.value = true
}

const showFriendFlower = async (steal) => {
  let friendFlowerIds = [...friendInfo.value.flowers]
  seedList.value = [{ value: '-1', text: '所有花' }]
  seedList.value.push(
    ...allFlowers[gameId.value].filter(
      (flower) => friendFlowerIds.length == 0 || friendFlowerIds.includes(flower.value),
    ),
  )
  selectFlower.value = steal
  showFlowerPicker.value = true
}

// 确认选择
const confirmTime = ({ selectedValues }) => {
  const timestamp = toTime(selectedValues)
  selectTime.value[0][selectTime.value[1]] = timestamp
  showTimePicker.value = false
}

// 移除括号内容
const removeTextAfterBracket = (inputString) => {
  const bracketIndex = inputString.indexOf('（')
  return bracketIndex !== -1 ? inputString.substring(0, bracketIndex) : inputString
}

// VIP状态
const vipStatus = () => {
  if (!user.value.subscribe || user.value.subscribe.subscribeId == -1) return '暂无VIP'
  if (!user.value.subscribe.validUtil) return '永久有效'
  return `${timestampToFormattedDate(user.value.subscribe.validUtil)} 到期`
}

// VIP状态样式计算
const vipStatusStyle = computed(() => {
  const subscribe = user.value.subscribe
  // 无套餐
  if (!subscribe || subscribe.subscribeId == -1) {
    return { color: '#8c8c8c', bgColor: 'rgba(140, 140, 140, 0.1)' }
  }
  // 永久有效
  if (subscribe.subscribeId != -1 && !subscribe.validUtil) {
    return { color: '#722ed1', bgColor: 'rgba(114, 46, 209, 0.1)' }
  }
  // 普通日期
  return { color: '#1890ff', bgColor: 'rgba(24, 144, 255, 0.1)' }
})

// 确认选择
const confirmFlower = ({ selectedOptions }) => {
  selectFlower.value['seedId'] = selectedOptions[0].value
  selectFlower.value['seedName'] = removeTextAfterBracket(selectedOptions[0].text)
  showFlowerPicker.value = false
}

const confirmFriend = async ({ selectedOptions }) => {
  let openId = selectedOptions[0].value
  selectFlower.value[friendValue.value] = openId
  selectFlower.value[friendKey.value] = selectedOptions[0].text
  showFriendPicker.value = false

  if (openId != null && openId != -1) {
    friendInfo.value = await getFriendInfo(openId)
  }
  selectFlower.value['maxExchangeCount'] = friendInfo.value.exchangeCount
}

const onFinishPlant = ({ selectedOptions }) => {
  showPlant.value = false
  plantText.value = selectedOptions.map((option) => option.text).join('并且')
  config.value.autoPlant = selectedOptions[selectedOptions.length - 1].value
  cascaderValue.value = []
}

// 添加/删除配置
const addPlant = () => {
  config.value.periods.push({
    beginTime: 0,
    endTime: 86400000,
    seedId: '',
    seedName: '未选择',
  })
}

const addSteal = () => {
  config.value.steals.push({
    userId: '-1',
    townName: '所有人',
    seedId: '-1',
    seedName: '所有花',
    stealCount: 10,
    maxExchangeCount: 20,
    enable: true,
  })
}

const addTradeOut = () => {
  config.value.trade.outs.push({
    seedId: '-2',
    seedName: '无',
    price: 0,
    count: -1,
    enable: true,
  })
}

const addTradeIn = () => {
  config.value.trade.ins.push({
    seedId: '-1',
    seedName: '所有花',
    price: 0,
    count: -1,
    enable: true,
  })
}

const addStealLow = () => {
  config.value.steals.push({
    userId: '0',
    townName: '无',
    seedId: '-1',
    seedName: '所有花',
    stealCount: 10,
    maxExchangeCount: 10,
    enable: true,
  })
}

const addUserAlts = () => {
  accountInfo.value.userAlts.push({
    openId: '',
    userName: '',
    type: 0,
  })
}

const deletePlant = (index) => {
  config.value.periods.splice(index, 1)
}

const deleteSteal = (index) => {
  config.value.steals.splice(index, 1)
}

const deleteTradeOut = (index) => {
  config.value.trade.outs.splice(index, 1)
}

const deleteTradeIn = (index) => {
  config.value.trade.ins.splice(index, 1)
}

const deleteUserAlts = (index) => {
  accountInfo.value.userAlts.splice(index, 1)
}

// 保存配置
const saveConfig = async () => {
  if (!accountInfo.value) return

  let url = '/config/update'
  if (currentUser.value) {
    url = url + '?userId=' + currentUser.value
  }

  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '保存中...',
    loadingType: 'spinner',
    className: 'custom-loading-toast',
  })

  try {
    const { flowers, ...newData } = accountInfo.value || {}
    const { code, remark } = await request({
      method: 'post',
      url,
      data: newData,
    })

    if (code === 200) {
      showNotify({
        type: 'success',
        message: '保存成功',
        duration: 2000,
        className: 'custom-notify',
      })
    } else {
      showNotify({
        type: 'danger',
        message: remark || '保存失败',
        duration: 3000,
        className: 'custom-notify',
      })
    }
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '网络错误，请重试',
      duration: 3000,
      className: 'custom-notify',
    })
  } finally {
    saveToast.value?.close()
  }
}

// 获取好友信息
const getFriendInfo = async (openId) => {
  try {
    const { data } = await request({
      method: 'get',
      url: `/config/friendFlowers?userId=${currentUser.value}&openId=${openId}`,
    })
    return data
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '获取好友信息失败，请重新登录游戏',
      duration: 3000,
      className: 'custom-notify',
    })
    return { flowers: [], exchangeCount: 10 }
  }
}

const triggerRobot = async () => {
  if (!accountInfo.value) return
  let url = '/config/'
  let msg = ''
  if (runningStatus.value == 0) {
    url += 'run'
    msg = '启动'
  } else if (runningStatus.value == 1) {
    url += 'stop'
    msg = '停止'
  } else {
    return
  }
  if (currentUser.value) {
    url += '?userId=' + currentUser.value
  }

  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: msg + '中...',
    loadingType: 'spinner',
    className: 'custom-loading-toast',
  })
  try {
    const { code, remark } = await request({
      method: 'get',
      url,
    })

    if (code === 200) {
      showNotify({
        type: 'success',
        message: msg + '成功！',
        duration: 2000,
        className: 'custom-notify',
      })
      getConfigPart()
    } else {
      showNotify({
        type: 'danger',
        message: remark || msg + '失败!',
        duration: 3000,
        className: 'custom-notify',
      })
    }
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '网络错误，请重试',
      duration: 3000,
      className: 'custom-notify',
    })
  } finally {
    saveToast.value?.close()
  }
}

// 获取图标URL
const getBaseIconUrl = () => {
  if ([1, 2].includes(accountInfo.value.gameId)) {
    return 'https://static.fthformal.com/flower/flower_newWX/ver/257/resource/assets/h5icon/i'
  } else if (accountInfo.value.gameId === 3) {
    return 'https://static22.supermoon.fun/beach_wxRL/ver/2.1.9/1/resource/assets/h5icon/i'
  } else if (accountInfo.value.gameId === 4) {
    return 'https://cdn-fth5-release.zhen-u.com/client/r1.0.86/resource/assets/h5icon/i'
  }
  return ''
}

// 过滤方法
const filterSeed = () => {
  seedList.value = seedList.value.filter((flower) =>
    flower.text.toLowerCase().includes(searchSeed.value.toLowerCase()),
  )
}

const filterFriend = () => {
  friendList.value = friends.value.filter((friend) =>
    friend.text.toLowerCase().includes(searchFriend.value.toLowerCase()),
  )
}

// 获取配置
const autoPlantArr = ['关闭', '自选', '补仓并且鲜花>=1级', '补仓并且鲜花>8级', '补仓并且鲜花>12级']

const getConfig = async () => {
  let url = '/config/get'
  if (currentUser.value) {
    url = url + '?userId=' + currentUser.value
    localStorage.setItem('currentUser', currentUser.value)
  }

  try {
    const { data, code } = await request({
      method: 'get',
      url,
    })

    if (code !== 200) {
      showNotify({ type: 'warning', message: '请先登陆游戏！' })
      return
    }

    accountInfo.value = { ...accountInfo.value, ...data }
    friends.value = user.value.gameUser.friends.map((item) => ({
      value: item.userId,
      text: item.townName,
    }))

    otherUsers.value = user.value.otherUsers.map((item) => ({
      value: item.id,
      text: item.userName,
    }))

    if (!currentUser.value && otherUsers.value?.length) {
      currentUser.value = otherUsers.value[0].value
    }
    plantText.value = autoPlantArr[config.value.autoPlant]

    // 初始化折叠状态
    initExpandStates()
  } catch (error) {
    showNotify({ type: 'danger', message: '网络错误，无法获取配置' })
  }
}

const getConfigPart = async () => {
  if (!currentUser.value) return

  let url = '/config/get'
  if (currentUser.value) {
    url = url + '?userId=' + currentUser.value
  }

  try {
    const { data, code } = await request({
      method: 'get',
      url,
    })

    if (code !== 200) return

    accountInfo.value = {
      ...accountInfo.value,
      shopItems: data.shopItems,
      running: data.running,
    }

    friends.value = user.value.gameUser.friends.map((item) => ({
      value: item.userId,
      text: item.townName,
    }))

    otherUsers.value = user.value.otherUsers.map((item) => ({
      value: item.id,
      text: item.userName,
    }))

    plantText.value = autoPlantArr[config.value.autoPlant]
  } catch (error) {
    console.error('获取配置片段失败:', error)
  }
}

// 监听配置变化，更新种植文本
watch(
  [() => config.value.autoPlant],
  () => {
    if (config.value) {
      plantText.value = autoPlantArr[config.value.autoPlant]
    }
  },
  { immediate: true },
)

// 监听用户切换，重新初始化折叠状态
watch(currentUser, () => {
  initExpandStates()
})

// 【新增】监听点击事件，关闭更多菜单
const handleClickOutside = (event) => {
  if (moreMenuRef.value && !moreMenuRef.value.contains(event.target)) {
    showMoreMenu.value = false
  }
}

// 初始化
onMounted(() => {
  getConfig()
  const interval = setInterval(getConfigPart, 20000)

  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)

  // 清理定时器
  const cleanup = () => {
    clearInterval(interval)
    document.removeEventListener('click', handleClickOutside)
  }
  window.addEventListener('beforeunload', cleanup)
  return () => {
    cleanup()
    window.removeEventListener('beforeunload', cleanup)
  }
})
</script>

<template>
  <main class="page-container">
    <!-- 【新增】顶部标题区域 -->
    <div class="top-title-bar">
      <h1 class="app-title">莳花小助手</h1>
      <span class="version-number">v1.0.2</span>
    </div>

    <!-- 顶部渐变装饰 -->
    <div class="top-decoration"></div>
    <exchange-modal ref="exchangeModalRef" :default-open-id="user.openId"></exchange-modal>

    <!-- 状态卡片区域 -->
    <div class="status-section">
      <div class="status-grid">
        <!-- 运行状态卡片 -->
        <div
          class="status-card"
          :style="{
            backgroundColor: runningStatusDesc.bgColor,
            borderColor: runningStatusDesc.borderColor,
            color: runningStatusDesc.color,
          }"
        >
          <van-icon :name="runningStatusDesc.icon" size="28" :color="runningStatusDesc.color" />
          <div class="status-text">{{ runningStatusDesc.text }}</div>
        </div>

        <!-- VIP状态卡片 -->
        <div
          class="status-card"
          :style="{
            backgroundColor: vipStatusStyle.bgColor,
            color: vipStatusStyle.color,
          }"
        >
          <van-icon name="diamond-o" size="28" :color="vipStatusStyle.color" />
          <div class="status-text">{{ vipStatus(user.subscribe) }}</div>
        </div>

        <!-- 用户选择卡片 -->
        <div class="status-card user-card" v-if="otherUsers?.length > 1">
          <van-icon name="contact-o" size="28" color="#ff6767" />
          <van-dropdown-menu direction="down" class="user-dropdown">
            <van-dropdown-item
              v-model="currentUser"
              :options="otherUsers"
              @change="getConfig"
              placeholder="选择用户"
              class="user-dropdown-item"
            />
          </van-dropdown-menu>
        </div>

        <!-- 用户名展示 -->
        <div class="status-card user-card" v-else>
          <van-icon name="flower-o" size="28" color="#ff6767" />
          <div class="status-text username-text">{{ user.userName || '未登录' }}</div>
        </div>
      </div>
    </div>

    <!-- 主要配置区域 -->
    <div class="config-wrapper" v-if="user && user?.subscribe?.subscribeId >= 0">
      <!-- VIP用户配置 -->
      <div v-if="user && user?.subscribe?.subscribeId > 0" class="config-section">
        <van-popup v-model:show="showPlant" round position="bottom" class="custom-popup">
          <div class="popup-header">
            <span class="popup-title">选择种植模式</span>
          </div>
          <van-cascader
            v-model="cascaderValue"
            title="种植模式"
            :options="plantOptions"
            @close="showPlant = false"
            @finish="onFinishPlant"
            class="cascader-select"
          />
        </van-popup>
        <!-- 自动种植配置 -->
        <div class="config-card plant-config-card">
          <div class="card-header" @click="toggleExpand('plantConfig')">
            <van-icon name="flower-o" size="20" color="#52c41a" />
            <span class="card-title">自动种植</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.plantConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.plantConfig">
            <van-cell class="plant-mode-cell" center label="配置收获模式">
              <template #title>
                <span class="feature-title">收获模式</span>
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoHarvest"
                  :options="harvestOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>
            <div v-show="config.autoHarvest == 2" class="order-advanced-section">
              <div class="section-title">
                <van-icon name="setting-o" size="16" color="#8c8c8c" />
                <span>收获定时设置</span>
              </div>

              <van-cell class="advanced-cell" title="定时收获" label="鲜花成熟后 N 秒收获">
                <van-stepper
                  v-model="config.harvestWaitingTime"
                  step="30"
                  integer
                  min="0"
                  theme="round"
                  button-size="24px"
                  class="stepper-control"
                />
              </van-cell>
            </div>

            <van-cell class="plant-mode-cell" center label="配置种植策略和时间计划">
              <template #title>
                <span class="feature-title">种植模式</span>
              </template>
              <van-field
                v-model="plantText"
                input-align="right"
                is-link
                readonly
                class="plant-selector"
                @click="showPlant = true"
                :placeholder="plantText || '请选择种植模式'"
              />
            </van-cell>

            <!-- 种植时间段配置 -->
            <div v-show="config.autoPlant == 1" class="plant-periods-section">
              <div class="section-title">
                <van-icon name="clock-o" size="16" color="#8c8c8c" />
                <span>种植时间配置</span>
              </div>

              <div v-if="config.periods.length === 0" class="empty-state">
                <van-empty description="暂无种植配置，点击添加按钮创建" class="empty-content" />
              </div>

              <div
                v-for="(period, index) in config.periods"
                :key="`plant-${index}`"
                class="config-item-row"
              >
                <div class="config-item-col seed-col">
                  <div class="config-item-label">种植种子</div>
                  <div class="config-item-value clickable" @click="showFlower(period)">
                    <span class="value-text">{{ period.seedName || '未选择' }}</span>
                    <van-icon
                      v-if="period.seedId"
                      :name="`${getBaseIconUrl()}${period.seedId}.png`"
                      class="seed-icon"
                    />
                    <van-icon v-else name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col time-col">
                  <div class="config-item-label">开始时间</div>
                  <div class="config-item-value clickable" @click="showTime(period, 'beginTime')">
                    <span class="value-text">{{ formatTime(period.beginTime) }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col time-col">
                  <div class="config-item-label">结束时间</div>
                  <div class="config-item-value clickable" @click="showTime(period, 'endTime')">
                    <span class="value-text">{{ formatTime(period.endTime) }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deletePlant(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addPlant">
                添加种植配置
              </van-button>
            </div>
          </div>
        </div>
        <!-- 订单配置 -->
        <div class="config-card order-config-card">
          <div class="card-header" @click="toggleExpand('orderConfig')">
            <van-icon name="completed-o" size="20" color="#fa8c16" />
            <span class="card-title">订单管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.orderConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.orderConfig">
            <van-cell class="feature-cell" center label="若无订单所需种子，则会自动拒绝">
              <template #title>
                <span class="feature-title">客户订单</span>
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoComplete"
                  :options="saleOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>

            <van-cell class="feature-cell" center label="当订单所需鲜花不足时，会优先自动种植">
              <template #title>
                <span class="feature-title">鲜花订单</span>
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoSale"
                  :options="saleOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>

            <!-- 订单高级配置 -->
            <div v-show="config.autoSale != 0" class="order-advanced-section">
              <div class="section-title">
                <van-icon name="setting-o" size="16" color="#8c8c8c" />
                <span>订单高级设置</span>
              </div>

              <van-cell
                class="advanced-cell"
                title="订单完成数量上限"
                label="达到指定数量后自动停止"
              >
                <van-stepper
                  v-model="config.orderMaxNum"
                  step="100"
                  integer
                  min="0"
                  max="1500"
                  theme="round"
                  button-size="24px"
                  class="stepper-control"
                />
              </van-cell>

              <van-cell
                class="advanced-cell"
                title="订单挑战自动完成"
                label="自动参与订单相关挑战任务"
              >
                <van-dropdown-menu class="feature-dropdown">
                  <van-dropdown-item
                    v-model="config.autoChallenge"
                    :options="challengeOptions"
                    placeholder="请选择"
                    class="dropdown-item"
                  />
                </van-dropdown-menu>
              </van-cell>
            </div>
          </div>
        </div>

        <!-- 小号配置 -->
        <div class="config-card alt-config-card">
          <div class="card-header" @click="toggleExpand('altConfig')">
            <van-icon name="friends-o" size="20" color="#1890ff" />
            <span class="card-title">小号管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.altConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.altConfig">
            <van-cell
              class="feature-cell"
              center
              label="只有配置的小号能进行摸花/爬架或使用完整功能"
            >
              <template #title>
                <span class="feature-title">小号功能启用</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoAccept" size="24" />
              </template>
            </van-cell>

            <!-- 小号列表配置 -->
            <div v-show="config.autoAccept" class="alt-list-section">
              <div class="section-title">
                <van-icon name="user-o" size="16" color="#8c8c8c" />
                <span>小号列表</span>
              </div>

              <div v-if="accountInfo.userAlts.length === 0" class="empty-state">
                <van-empty description="暂无小号配置，点击添加按钮创建" class="empty-content" />
              </div>

              <div
                v-for="(alt, index) in accountInfo.userAlts"
                :key="`alt-${index}`"
                class="config-item-row"
              >
                <div class="config-item-col alt-name-col">
                  <div class="config-item-label">小号名称</div>
                  <div class="config-item-value clickable" @click="showFriendAccept(alt)">
                    <span class="value-text">{{ alt.userName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col alt-type-col">
                  <div class="config-item-label">权限类型</div>
                  <van-dropdown-menu class="alt-type-dropdown">
                    <van-dropdown-item
                      v-model="alt.type"
                      :options="user.subscribe.ratio > 0 ? altOptions1 : altOptions"
                      placeholder="请选择"
                      class="dropdown-item"
                    />
                  </van-dropdown-menu>
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteUserAlts(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addUserAlts">
                添加小号配置
              </van-button>
            </div>
          </div>
        </div>

        <!-- 自动摸花 -->
        <div class="config-card steal-config-card">
          <div class="card-header" @click="toggleExpand('stealConfig')">
            <van-icon name="gift-o" size="20" color="#ff6767" />
            <span class="card-title">自动摸花</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.stealConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.stealConfig">
            <van-cell class="feature-cell" center label="可配置摸花好友、花种和次数上限">
              <template #title>
                <span class="feature-title">摸花功能启用</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoSteal" size="24" />
              </template>
            </van-cell>

            <!-- 摸花配置列表 -->
            <div v-show="config.autoSteal" class="steal-list-section">
              <div class="section-title">
                <van-icon name="flower-o" size="16" color="#8c8c8c" />
                <span>摸花配置</span>
              </div>

              <div v-if="config.steals.length === 0" class="empty-state">
                <van-empty description="暂无摸花配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(steal, index) in config.steals"
                :key="`steal-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col friend-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(steal, false)">
                    <span class="value-text">{{ steal.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col flower-col">
                  <div class="config-item-label">摸花花种</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(steal)">
                    <span class="value-text">{{ steal.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">摸花次数</div>
                  <van-stepper
                    v-model="steal.stealCount"
                    min="10"
                    :max="steal.maxExchangeCount"
                    step="5"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch :disabled="!config" v-model="steal.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteSteal(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addSteal">
                添加摸花配置
              </van-button>
            </div>
          </div>
        </div>

        <!-- 自动上架下架 -->
        <div class="config-card steal-config-card">
          <div class="card-header" @click="toggleExpand('tradeConfig')">
            <van-icon name="cart-o" size="20" color="#ff6767" />
            <span class="card-title">店铺管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.tradeConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.tradeConfig">
            <van-cell class="feature-cell" center label="">
              <template #title>
                <span class="feature-title">自动上架</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoTradeOut" size="24" />
              </template>
            </van-cell>

            <!-- 上架配置列表 -->
            <div v-show="config.autoTradeOut" class="steal-list-section">
              <div class="section-title">
                <van-icon name="cash-o" size="16" color="#8c8c8c" />
                <span>上架设置</span>
              </div>

              <div v-if="config.trade?.outs?.length === 0" class="empty-state">
                <van-empty description="暂无上架配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(out, index) in config.trade?.outs"
                :key="`out-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col trade-col">
                  <div class="config-item-label">上架鲜花</div>
                  <div class="config-item-value clickable" @click="showFlower(out)">
                    <span class="value-text">{{ out.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>
                <div class="config-item-col count-col">
                  <div class="config-item-label">上架价格</div>
                  <custom-array-stepper
                    :options="tradeInfo(out)"
                    :default-value="tradeInfo(out)[1]"
                    v-model="out.price"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">上架次数</div>
                  <van-stepper
                    v-model="out.count"
                    min="0"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">密码</div>
                  <van-field
                    v-model="out.password"
                    type="number"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="设置四位密码"
                    clearable
                    style="padding: 0px"
                  />
                </div>

                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch v-model="out.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteTradeOut(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addTradeOut">
                添加上架配置
              </van-button>
            </div>
          </div>

          <div class="card-content" v-show="expandStates.tradeConfig">
            <van-cell class="feature-cell" center label="">
              <template #title>
                <span class="feature-title">自动购买</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoTradeIn" size="24" />
              </template>
            </van-cell>

            <!-- 购买配置列表 -->
            <div v-show="config.autoTradeIn" class="steal-list-section">
              <div class="section-title">
                <van-icon name="paid" size="16" color="#8c8c8c" />
                <span>购买设置</span>
              </div>

              <div v-if="config.trade.ins.length === 0" class="empty-state">
                <van-empty description="暂无购买配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(inc, index) in config.trade.ins"
                :key="`in-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(inc, false)">
                    <span class="value-text">{{ inc.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标鲜花</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(inc)">
                    <span class="value-text">{{ inc.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">购买价格</div>
                  <custom-array-stepper
                    :options="tradeInfo(inc)"
                    :default-value="tradeInfo(inc)[1]"
                    v-model="inc.price"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </div>
                <div class="config-item-col count-col">
                  <div class="config-item-label">每日购买数量</div>
                  <van-stepper
                    v-model="inc.count"
                    min="-1"
                    step="100"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">密码</div>
                  <van-field
                    v-model="inc.password"
                    type="number"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="设置四位密码"
                    clearable
                    style="padding: 0px"
                  />
                </div>
                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch :disabled="!config" v-model="inc.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteTradeIn(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addTradeIn">
                添加购买配置
              </van-button>
            </div>
          </div>
        </div>

        <!-- 社团功能集合 -->
        <div class="config-card other-features-card">
          <div class="card-header" @click="toggleExpand('guildConfig')">
            <van-icon name="cluster-o" size="20" color="#52c41a" />
            <span class="card-title">社团功能</span>
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
                <span class="feature-title">社团捐献</span>
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoDonate"
                  :options="donateOptions"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>
            <van-cell class="feature-cell" center label="自动收获社团花盆">
              <template #title>
                <span class="feature-title">社团收获</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoGuildPlant" size="24" />
              </template>
            </van-cell>
            <van-cell class="feature-cell" center label="自动观看社团广告获取奖励">
              <template #title>
                <span class="feature-title">视频捐献</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoGuildAd" size="24" />
              </template>
            </van-cell>
          </div>
        </div>

        <!-- 其他功能集合 -->
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
            <div class="features-grid">
              <!-- 第一行功能 -->
              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="shop-o" size="20" color="#1890ff" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动摆台</div>
                  <div class="feature-desc">仓库有啥摆啥</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoSell" size="22" />
              </div>

              <!-- 第二行功能 -->
              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="fire-o" size="20" color="#36cfc9" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">培育忘忧树</div>
                  <div class="feature-desc">自动培育最高数量道具</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoCultivate" size="22" />
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="cart-o" size="20" color="#722ed1" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动买商店</div>
                  <div class="feature-desc">培育商店自动购买</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoShop" size="22" />
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="aim" size="20" color="#ff7a45" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动打地鼠</div>
                  <div class="feature-desc">每日上限50次</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoMonster" size="22" />
              </div>

              <!-- 第三行功能 -->
              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="bulb-o" size="20" color="#ff4d4f" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动抓花农</div>
                  <div class="feature-desc">随机抓捕推荐玩家</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoRob" size="22" />
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="medal-o" size="20" color="#b71de8" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">更好的游戏</div>
                  <div class="feature-desc">VIP功能/免广告</div>
                </div>
                <van-switch :disabled="!config" v-model="config.betterGame" size="22" />
              </div>

              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="certificate" size="20" color="#5cadff" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动小游戏</div>
                  <div class="feature-desc">完成活动游戏任务</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoGame" size="22" />
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <van-icon name="play-circle-o" size="20" color="#5cadff" />
                </div>
                <div class="feature-info">
                  <div class="feature-name">自动领取</div>
                  <div class="feature-desc">领取所有广告奖励、转盘奖励、活动水滴）</div>
                </div>
                <van-switch :disabled="!config" v-model="config.autoAd" size="22" />
              </div>
            </div>
          </div>
        </div>

        <!-- VIP专属功能 -->
        <div v-if="user?.subscribe?.subscribeId == 3" class="config-card vip3-card">
          <div class="card-header vip3-header" @click="toggleExpand('vip3Config')">
            <van-icon name="crown-o" size="20" color="#faad14" />
            <span class="card-title vip3-title">专享</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.vip3Config }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.vip3Config">
            <van-cell
              class="vip3-feature-cell"
              center
              label="每日自动获取4000水滴、加速券、好评券，页面数据每30秒更新一次"
            >
              <template #title>
                <span class="feature-title vip3-feature-title">自动领取资源</span>
              </template>
              <template #right-icon>
                <van-switch
                  :disabled="user?.subscribe?.subscribeId != 3"
                  v-model="config.autoBuy"
                  size="24"
                />
              </template>
            </van-cell>

            <div v-show="config.autoBuy" class="resources-progress-section">
              <div class="section-title">
                <van-icon name="waterdrop-o" size="16" color="#1890ff" />
                <span>今日资源获取进度</span>
              </div>

              <div
                v-for="shopItem in config.shopItems"
                :key="`shop-${shopItem.itemId}`"
                class="resource-item"
              >
                <div class="resource-info">
                  <span class="resource-name">{{ shopItem.itemName }}</span>
                  <span class="resource-count">{{ shopItem.num }} / 4000</span>
                </div>
                <van-progress
                  :percentage="Math.round(Math.min((shopItem.num / 4000) * 100, 100))"
                  height="8px"
                  class="resource-progress"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 小号用户配置 -->
      <div v-if="user?.subscribe?.subscribeId == 0" class="config-section non-vip-section">
        <div class="config-card non-vip-steal-card">
          <div class="card-header" @click="toggleExpand('nonVipSteal')">
            <van-icon name="hand-o-right" size="20" color="#ff6767" />
            <span class="card-title">基础摸花功能</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.nonVipSteal }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.nonVipSteal">
            <van-cell class="feature-cell" center label="小号只能摸被配置的好友，无其他高级功能">
              <template #title>
                <span class="feature-title">自动摸花</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoSteal" size="24" />
              </template>
            </van-cell>

            <!-- 基础摸花配置 -->
            <div v-show="config.autoSteal" class="basic-steal-section">
              <div class="section-title">
                <van-icon name="flower-o" size="16" color="#8c8c8c" />
                <span>摸花配置</span>
              </div>

              <div v-if="config.steals.length === 0" class="empty-state">
                <van-empty
                  image="empty-search"
                  description="暂无摸花配置，点击添加按钮创建"
                  class="empty-content"
                />
              </div>

              <div
                v-for="(steal, index) in config.steals"
                :key="`steal-low-${index}`"
                class="config-item-row basic-steal-row"
              >
                <div class="config-item-col friend-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(steal)">
                    <span class="value-text">{{ steal.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col flower-col">
                  <div class="config-item-label">摸花花种</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(steal)">
                    <span class="value-text">{{ steal.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteSteal(index)"
                  />
                </div>
              </div>
              <van-button class="add-button" block type="primary" icon="add-o" @click="addStealLow">
                添加摸花配置
              </van-button>
            </div>
          </div>
        </div>
        <!-- 自动购买 -->
        <div class="config-card steal-config-card">
          <div class="card-header" @click="toggleExpand('tradeInConfig')">
            <van-icon name="cart-o" size="20" color="#ff6767" />
            <span class="card-title">店铺管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.tradeInConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.tradeInConfig">
            <van-cell class="feature-cell" center label="">
              <template #title>
                <span class="feature-title">自动购买</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoTradeIn" size="24" />
              </template>
            </van-cell>

            <div v-show="config.autoTradeIn" class="steal-list-section">
              <div class="section-title">
                <van-icon name="paid" size="16" color="#8c8c8c" />
                <span>购买设置</span>
              </div>

              <div v-if="config.trade.ins.length === 0" class="empty-state">
                <van-empty description="暂无购买配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(inc, index) in config.trade.ins"
                :key="`in-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(inc, false)">
                    <span class="value-text">{{ inc.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标鲜花</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(inc)">
                    <span class="value-text">{{ inc.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">购买价格</div>
                  <custom-array-stepper
                    :options="tradeInfo(inc)"
                    :default-value="tradeInfo(inc)[1]"
                    v-model="inc.price"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </div>
                <div class="config-item-col count-col">
                  <div class="config-item-label">每日购买数量</div>
                  <van-stepper
                    v-model="inc.count"
                    min="-1"
                    step="100"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">密码</div>
                  <van-field
                    v-model="inc.password"
                    type="number"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="设置四位密码"
                    clearable
                    style="padding: 0px"
                  />
                </div>
                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch :disabled="!config" v-model="inc.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteTradeIn(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addTradeIn">
                添加购买配置
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!user?.subscribe || user?.subscribe?.subscribeId < 1"
      class="config-section non-vip-section"
    >
      <!-- 升级提示 -->
      <div class="upgrade-tip-card">
        <div class="upgrade-icon">
          <van-icon name="arrow-up" size="24" color="#faad14" />
        </div>
        <div class="upgrade-content">
          <div class="upgrade-title">升级VIP解锁更多功能</div>
          <div class="upgrade-desc">自动种植、订单管理、社团功能、资源自动领取等更多高级功能</div>
        </div>
        <van-button type="warning" size="small" plain class="upgrade-btn"> 立即升级 </van-button>
      </div>
    </div>

    <!-- 弹出选择器 -->
    <van-popup v-model:show="showTimePicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择时间</span>
      </div>
      <van-time-picker :formatter="formatter" @confirm="confirmTime" class="custom-time-picker" />
    </van-popup>

    <van-popup v-model:show="showFlowerPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择花种</span>
      </div>
      <van-field
        placeholder="搜索花种名称..."
        right-icon="search"
        clearable
        v-model="searchSeed"
        @update:model-value="filterSeed"
        class="search-field"
      />
      <van-picker
        :columns="seedList"
        @confirm="confirmFlower"
        class="custom-picker"
        show-toolbar
        cancel-button-text="取消"
        confirm-button-text="确认"
      />
    </van-popup>

    <van-popup v-model:show="showFriendPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择好友</span>
      </div>
      <van-field
        placeholder="搜索好友名称..."
        right-icon="search"
        clearable
        v-model="searchFriend"
        @update:model-value="filterFriend"
        class="search-field"
      />
      <van-picker
        :columns="friendList"
        @confirm="confirmFriend"
        class="custom-picker"
        show-toolbar
        cancel-button-text="取消"
        confirm-button-text="确认"
      />
    </van-popup>

    <!-- 【新增】底部导航栏 -->
    <div class="bottom-nav">
      <div class="nav-container">
        <div class="nav-item" @click="saveConfig">
          <van-icon name="setting-o" size="24" />
          <span>保存配置</span>
        </div>
        <div class="nav-item">
          <van-icon name="records" size="24" />
          <span>日志</span>
        </div>
        <div
          class="nav-center-item"
          :class="{ disabled: runningStatus === -1 }"
          @click="triggerRobot"
        >
          <van-icon
            :name="
              runningStatus == 0
                ? 'play-circle-o'
                : runningStatus == -1
                  ? 'replay'
                  : 'stop-circle-o'
            "
            :color="runningStatus == 0 ? '#52c41a' : runningStatus == -1 ? '#d9d9d9' : '#ff6767'"
            size="28"
          />
          <span>{{ runningStatus == 0 ? '启用' : runningStatus == -1 ? '未就绪' : '停止' }}</span>
        </div>
        <div class="nav-item" @click="showMoreMenu = !showMoreMenu" ref="moreMenuRef">
          <van-icon name="more-o" size="24" />
          <span>更多</span>
        </div>
        <div class="nav-item" @click="currentUser = null">
          <van-icon name="user-o" size="24" />
          <span>{{ currentUser ? '登出' : '登入' }}</span>
        </div>
      </div>

      <!-- 【新增】二级菜单 -->
      <div class="more-menu" v-show="showMoreMenu">
        <div class="menu-item" @click="openExchangeModal">
          <van-icon name="gift-card-o" size="20" />
          <span>兑换码兑换</span>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 全局样式重置和基础设置 */
.page-container {
  min-height: 100vh;
  max-width: 780px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e8f4f8 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-bottom: 120px; /* 为底部导航栏预留空间 */
  margin: auto;
}

/* 【新增】顶部标题区域样式 */
.top-title-bar {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 10px 16px 10px;
  text-align: center;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.app-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 1px;
}

.version-number {
  font-size: 14px;
  color: #9ca3af; /* 灰色调 */
  font-weight: normal;
  align-self: flex-end;
  margin-left: 5px; /* 增加左边距，使版本号离标题远一些 */
}
/* 状态卡片区域 */
.status-section {
  padding: 20px 16px 16px;
  position: relative;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.status-card {
  max-height: 65px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid transparent;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-card:active {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.user-card {
  background-color: #fff;
  border-color: rgba(24, 144, 255, 0.2);
}

.username-text {
  color: #ff6767;
  font-weight: 600;
}

.user-dropdown {
  flex: 1;
  margin-left: 4px;
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.alt-type-dropdown {
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.user-dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 14px;
}

/* 配置容器 */
.config-wrapper {
  padding: 0 16px 30px;
  position: relative;
  z-index: 1;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 配置卡片通用样式 */
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
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12); /* 增强阴影，保留点击反馈 */
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

/* 主要开关卡片 */
.main-switch-card {
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f8fb 100%);
  border: 1px solid #e6f7ff;
}

.main-switch-cell {
  background-color: transparent;
  padding: 0;
}

.main-switch {
  --van-switch-active-color: #1890ff;
  --van-switch-inactive-color: #d9d9d9;
}

/* 功能卡片样式 */
.feature-cell {
  background-color: transparent;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.feature-dropdown {
  width: 160px;
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 14px;
}

/* 种植配置样式 */
.plant-mode-cell {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.plant-selector {
  --van-field-label-width: 0;
  font-weight: 500;
}

.plant-periods-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 12px;
}

/* 配置项行样式 */
.config-item-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.config-item-row:last-child {
  border-bottom: none;
}

.config-item-col {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}

.seed-col {
  flex: 2;
}

.time-col {
  flex: 1.5;
}

.alt-name-col {
  flex: 2;
}

.alt-type-col {
  flex: 1.8;
}

.friend-col {
  flex: 1.8;
}

.flower-col {
  flex: 1.8;
}

.count-col {
  flex: 1.5;
}

.trade-col {
  flex: 1.5;
}

.switch-col {
  flex: 1.2;
}

.action-col {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

.config-item-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.config-item-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:active {
  color: #1890ff;
}

.value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seed-icon {
  margin-left: 6px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.arrow-icon {
  color: #cccccc;
}

/* 按钮样式 */
.delete-button {
  --van-button-danger-color: #ff4d4f;
  --van-button-border-radius: 6px;
  padding: 0;
  width: 32px;
  height: 32px;
}

.add-button {
  --van-button-primary-color: #1890ff;
  --van-button-border-radius: 12px;
  color: white;
  margin-top: 12px;
  height: 44px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 空状态样式 */
.empty-state {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}

.empty-content :deep(.van-empty__image) {
  width: 80px;
  height: 80px;
}

.empty-content :deep(.van-empty__description) {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

/* 订单高级配置 */
.order-advanced-section {
  margin-top: 16px;
}

.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.advanced-cell:last-child {
  border-bottom: none;
}

.stepper-control {
  width: 180px;
}

/* 摸花配置样式 */
.steal-row {
  flex-wrap: wrap;
}

.steal-stepper {
  width: 100%;
}

/* 其他功能网格 */
.features-grid {
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

.mini-dropdown {
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
  width: 100px;
}

.mini-dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 12px;
}

/* VIP3卡片样式 */
.vip3-card {
  background: linear-gradient(135deg, #fdf2f8 0%, #fef7fb 100%);
  border: 1px solid #fde2ef;
}

.vip3-header {
  background-color: rgba(250, 173, 20, 0.1);
  border-bottom-color: rgba(250, 173, 20, 0.2);
}

.vip3-title {
  color: #faad14;
}

.vip3-feature-cell {
  border-bottom: 1px solid #f5f5f5;
}

.vip3-feature-title {
  color: #faad14;
}

.resources-progress-section {
  margin-top: 16px;
}

.resource-item {
  margin-bottom: 12px;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.resource-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.resource-count {
  font-size: 12px;
  color: #8c8c8c;
}

.resource-progress {
  --van-progress-background-color: #f5f5f5;
  border-radius: 4px;
}

/* 非VIP用户样式 */
.non-vip-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.basic-steal-row {
  flex-wrap: wrap;
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
  line-height: 1.4;
}

.upgrade-btn {
  --van-button-warning-color: #faad14;
  white-space: nowrap;
}

/* 弹出层样式 */
.custom-popup {
  border-radius: 20px 20px 0 0;
  padding: 0;
  overflow: hidden;
}

.popup-header {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.search-field {
  margin: 16px 20px;
  --van-field-background-color: #f5f7fa;
  --van-field-border-radius: 12px;
}

.custom-time-picker {
  padding: 0 20px 20px;
}

.custom-picker {
  height: 300px;
  padding: 0 20px 20px;
}

/* 自定义加载提示和通知 */
:deep(.custom-loading-toast) {
  --van-toast-background-color: rgba(0, 0, 0, 0.8);
  --van-toast-text-color: #fff;
  border-radius: 12px;
  padding: 16px 20px;
}

:deep(.custom-notify) {
  --van-notify-border-radius: 8px;
  padding: 8px 16px;
}

/* 【新增】底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 12px 0;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 80px;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-center-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 83px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 4px #fff;
  cursor: pointer;
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.2s ease;
  z-index: 1001;
}

.nav-center-item:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.2),
    0 0 0 4px #fff;
}

.nav-center-item span {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
}

.nav-item span {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
}

.nav-center-item.disabled {
  cursor: not-allowed;
  pointer-events: none;
}

/* 【新增】二级菜单样式 */
.more-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  width: 160px;
  z-index: 1002;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item span {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .config-item-row {
    flex-direction: column;
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

  .nav-container {
    padding: 12px 8px;
  }

  .nav-item {
    max-width: 70px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-card {
  animation: fadeIn 0.3s ease-out;
}

.config-card:nth-child(1) {
  animation-delay: 0.05s;
}
.config-card:nth-child(2) {
  animation-delay: 0.1s;
}
.config-card:nth-child(3) {
  animation-delay: 0.15s;
}
.config-card:nth-child(4) {
  animation-delay: 0.2s;
}
.config-card:nth-child(5) {
  animation-delay: 0.25s;
}

:deep(.van-cell__value) {
  display: flex;
  justify-content: right;
}
</style>
