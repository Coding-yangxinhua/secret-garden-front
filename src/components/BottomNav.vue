<template>
  <Teleport to="body">
  <div class="bottom-nav">
    <div class="nav-container">
      <!-- 保存配置 -->
      <div class="nav-item" @click="emit('saveConfig')">
        <cute-icon name="save"></cute-icon>
        <span>保存配置</span>
      </div>

      <!-- 日志 -->
      <div class="nav-item" @click="emit('toLog')">
        <cute-icon name="log" />
        <span>日志</span>
      </div>

      <!-- 占位 -->
      <div class="nav-item">
        <span></span>
      </div>

      <!-- 中心大按钮 -->
      <div
        class="nav-center-item"
        :class="{ disabled: runningStatus === -1 }"
        @click="handleTriggerRobot"
      >
        <cute-icon
          :name="runningStatus == 0 ? 'play' : runningStatus == -1 ? 'replay' : 'pause'"
          :color="runningStatus == 0 ? '#52c41a' : runningStatus == -1 ? '#d9d9d9' : '#ff6767'"
          size="24"
        />
        <span>
          {{
            isBatchOperate
              ? runningStatus == 0
                ? '一键启动'
                : runningStatus == -1
                  ? '未就绪'
                  : '一键停止'
              : runningStatus == 0
                ? '启用'
                : runningStatus == -1
                  ? '未就绪'
                  : '停止'
          }}
        </span>
      </div>

      <!-- 更多 -->
      <div class="nav-item" data-guide="more-entry" @click.stop="showMoreMenu = !showMoreMenu">
        <div class="more-icon-wrapper">
          <cute-icon name="more" />
          <span v-if="totalUnreadCount > 0" class="more-badge">{{
            totalUnreadCount > 99 ? '99+' : totalUnreadCount
          }}</span>
        </div>
        <span>更多</span>
      </div>

      <!-- 用户 -->
      <div class="nav-item user-nav-item" data-guide="login-entry" @click="handleUserAction">
        <cute-icon :name="systemUser ? 'user' : 'login'" />
        <span class="user-status-text">{{ systemUser ? '个人中心' : '登录' }}</span>
      </div>
    </div>

    <!-- 🍎 更多菜单 – iOS 17 Sheet -->
    <ModernSheet v-model="showMoreMenu" title="更多功能">
      <div class="more-sheet-content">
        <div class="more-menu-items">
          <div class="more-menu-item" @click="openExchangeModal">
            <div class="more-menu-item-icon">
              <cute-icon name="gift-voucher" size="20" />
            </div>
            <span class="more-menu-item-text">兑换码兑换</span>
          </div>
          <div class="more-menu-item" @click="openAccountModal">
            <div class="more-menu-item-icon">
              <cute-icon name="user-link" size="20" />
            </div>
            <span class="more-menu-item-text">账号绑定</span>
          </div>
          <div class="more-menu-item" @click="openNotificationPanel">
            <div class="more-menu-item-icon">
              <cute-icon name="envelope" size="20" />
            </div>
            <span class="more-menu-item-text">站内信</span>
            <span v-if="unreadCount > 0" class="menu-badge-sheet">{{
              unreadCount > 99 ? '99+' : unreadCount
            }}</span>
          </div>
          <div class="more-menu-item" @click="openActivityPanel">
            <div class="more-menu-item-icon">
              <cute-icon name="gift" size="20" />
            </div>
            <span class="more-menu-item-text">活动</span>
          </div>
          <div class="more-menu-item" @click="openFeedback">
            <div class="more-menu-item-icon">
              <cute-icon name="notes" size="20" />
            </div>
            <span class="more-menu-item-text">问题反馈</span>
          </div>
          <div class="more-menu-item" @click="openGroupBindPanel">
            <div class="more-menu-item-icon">
              <cute-icon name="vip" size="20" />
            </div>
            <span class="more-menu-item-text">开卡购买</span>
            <span v-if="groupBindUnreadBadge" class="menu-badge-sheet">{{
              groupBindUnreadBadge
            }}</span>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="more-sheet-divider"></div>

        <!-- 批量操作 -->
        <div
          class="more-menu-item more-menu-checkbox-item"
          @click="isBatchOperate = !isBatchOperate"
        >
          <div class="more-menu-item-icon more-checkbox-icon" :class="{ checked: isBatchOperate }">
            <van-icon :name="isBatchOperate ? 'success' : 'circle'" size="20" />
          </div>
          <span class="more-menu-item-text">批量操作</span>
        </div>
      </div>

      <div class="modern-sheet-safe-bottom"></div>
    </ModernSheet>

    <!-- 🍎 兑换码兑换 Sheet -->
    <ExchangeSheet
      ref="exchangeSheetRef"
      :default-open-id="exchangeDefaultOpenId"
      @exchange-success="handleExchangeSuccess"
    />

    <!-- 🍎 账号绑定 Sheet -->
    <AccountBindSheet ref="accountBindSheetRef" @account-updated="handleAccountUpdated" />

    <van-popup
      v-model:show="showActivityPanel"
      :teleport="'body'"
      :z-index="5000"
      :position="isMobile ? 'bottom' : 'right'"
      :style="
        isMobile
          ? { height: '60%', borderRadius: '20px 20px 0 0' }
          : { width: '420px', height: '100%' }
      "
      round
      closeable
      @close="showActivityPanel = false"
    >
      <div class="activity-panel-wrapper">
        <div class="panel-header">
          <h4>🎁活动</h4>
        </div>
        <ExtraRewardPanel />
      </div>
    </van-popup>

    <!-- 🍎 开卡购买 – ModernSheet（iOS 17 风格） -->
    <ModernSheet v-model="showGroupBindPanel" title="开卡购买">
      <div class="group-bind-sheet-content">
        <GroupBindCard @go-exchange="onGroupBindGoExchange" />
      </div>
      <div class="modern-sheet-safe-bottom"></div>
    </ModernSheet>

    <!-- 站内信面板（重构版） -->
    <van-popup
      v-model:show="showNotificationPanel"
      :teleport="'body'"
      :z-index="5000"
      :position="isMobile ? 'bottom' : 'right'"
      :style="
        isMobile
          ? { height: '70%', borderRadius: '20px 20px 0 0' }
          : { width: '420px', height: '100%' }
      "
      round
      closeable
      @close="showNotificationPanel = false"
      class="notification-panel"
    >
      <div class="notification-container">
        <div class="notification-header">
          <h3 class="panel-title">站内信</h3>
          <van-button v-if="unreadCount > 0" size="small" type="primary" plain @click="markAllRead"
            >全部已读</van-button
          >
        </div>
        <div
          class="notification-list"
          ref="notifyListRef"
          @scroll="handleScroll"
          v-if="displayedNotifications.length > 0"
        >
          <div
            class="notification-item"
            :class="{ unread: !item.isRead }"
            v-for="item in displayedNotifications"
            :key="item.id"
            @click="toggleDetail(item)"
          >
            <div class="item-main">
              <div class="item-left">
                <div class="unread-dot" v-if="!item.isRead"></div>
                <div class="item-content">
                  <!-- 时间上移 -->
                  <div class="item-time">{{ formatTime(item.gmtCreate) }}</div>
                  <div class="item-title">{{ item.title }}</div>
                </div>
              </div>
              <van-icon
                :name="expandedId === item.id ? 'arrow-up' : 'arrow-down'"
                size="14"
                color="#bbb"
              />
            </div>
            <!-- 展开详情（无跳转按钮） -->
            <transition name="slide-fade">
              <div class="item-detail" v-if="expandedId === item.id" @click.stop>
                <div class="detail-content">{{ item.content }}</div>
              </div>
            </transition>
          </div>
          <div v-if="loadingMore" class="load-more">加载中...</div>
        </div>
        <div class="empty-state" v-else>
          <van-icon name="bell" size="48" color="#dcdfe6" />
          <p>暂无通知</p>
        </div>
      </div>
    </van-popup>

    <!-- 🍎 个人中心 – 内嵌编辑功能的子组件 -->
    <UserProfileSheet v-model="showUserMenu" @logout="logout" />
  </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { showNotify, Button as VanButton } from 'vant'
import router from '@/router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import CuteIcon from './CuteIcon.vue'
import ModernSheet from './ModernSheet.vue'
import UserProfileSheet from './UserProfileSheet.vue'
import AccountBindSheet from './AccountBindSheet.vue'
import ExchangeSheet from './ExchangeSheet.vue'
import request from '@/utils/request'
import ExtraRewardPanel from './ExtraRewardPanel.vue'
import GroupBindCard from './GroupBindCard.vue'

const userStore = useUserStore()
const systemUser = storeToRefs(userStore).userInfo

// 子组件 ref
const exchangeSheetRef = ref(null)
const accountBindSheetRef = ref(null)

const handleAccountUpdated = () => {
  // 账号列表更新后触发父级刷新（无需额外操作）
}

const handleExchangeSuccess = () => {
  emit('saveConfig')
}

// 原有 props 和 emits
const props = defineProps({
  runningStatus: { type: Number, default: 0 },
  exchangeDefaultOpenId: { type: String, default: '' },
})
const emit = defineEmits(['saveConfig', 'toLog', 'triggerRobot', 'logout'])

// 在其他状态声明后添加
const showActivityPanel = ref(false)

const openActivityPanel = () => {
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }
  showMoreMenu.value = false
  nextTick(() => {
    showActivityPanel.value = true
  })
}

// 开卡购买
const showGroupBindPanel = ref(false)

// 未绑定时显示角标"1"，已绑定后不显示
const groupBindUnreadBadge = computed(() => {
  if (!systemUser.value) return ''
  return systemUser.value.groupName ? '' : '1'
})

const openGroupBindPanel = () => {
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }
  showMoreMenu.value = false
  showGroupBindPanel.value = true
}

// 从开卡购买面板跳转到兑换
const onGroupBindGoExchange = () => {
  showGroupBindPanel.value = false
  exchangeSheetRef.value?.openSheet()
}

// 批量操作
const isBatchOperate = ref(localStorage.getItem('robot_batch_operate') === 'true')
watch(isBatchOperate, (val) => localStorage.setItem('robot_batch_operate', val))
const handleTriggerRobot = () => emit('triggerRobot', isBatchOperate.value)

// 弹窗状态
const showMoreMenu = ref(false)
const showUserMenu = ref(false)

const handleUserAction = () => {
  systemUser.value ? (showUserMenu.value = true) : router.push({ name: 'login' })
}

// ==================== 退出登录 ====================
const logout = async () => {
  showUserMenu.value = false
  emit('logout')
  showNotify({ type: 'success', message: '已成功退出登录', duration: 2000 })
}

const openExchangeModal = () => {
  showMoreMenu.value = false
  exchangeSheetRef.value?.openSheet()
}
const openAccountModal = () => {
  showMoreMenu.value = false
  openAccountBindSheet()
}

// ==================== 站内信功能（优化版） ====================
const showNotificationPanel = ref(false)
const allNotifications = ref([]) // 全量数据
const displayedCount = ref(0) // 当前已展示条数
const loadingMore = ref(false)
const notifyListRef = ref(null)
const expandedId = ref(null)
const unreadCount = ref(0)

// 总未读数（站内信 + 开卡购买提示）
const totalUnreadCount = computed(() => {
  const groupBadge = groupBindUnreadBadge.value
  const groupNum = groupBadge === '' || groupBadge === undefined ? 0 : Number(groupBadge)
  return unreadCount.value + groupNum
})

const isMobile = computed(() => window.innerWidth < 768)
const pageSize = 10

// 已显示的通知列表
const displayedNotifications = computed(() => {
  return allNotifications.value.slice(0, displayedCount.value)
})

// 是否还有更多数据
const hasMore = computed(() => displayedCount.value < allNotifications.value.length)

// 获取未读数
const fetchUnreadCount = async () => {
  if (!systemUser.value) return
  try {
    const res = await request({ url: '/system/notification/unreadCount', method: 'GET' })
    if (res.code === 200) unreadCount.value = res.data
  } catch (e) {}
}

// 获取全量通知列表
const fetchNotifications = async () => {
  if (!systemUser.value) return
  try {
    const res = await request({ url: '/system/notification/list', method: 'GET' })
    if (res.code === 200) {
      allNotifications.value = res.data || []
    }
  } catch (e) {}
}

// 打开面板
const openNotificationPanel = async () => {
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }
  showMoreMenu.value = false
  showNotificationPanel.value = true
  expandedId.value = null
  await fetchNotifications()
  // 初始加载第一页
  displayedCount.value = Math.min(pageSize, allNotifications.value.length)
  fetchUnreadCount()
}

// 滚动加载更多
const handleScroll = () => {
  const el = notifyListRef.value
  if (!el || loadingMore.value || !hasMore.value) return
  const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (scrollBottom < 50) {
    loadingMore.value = true
    setTimeout(() => {
      const nextCount = displayedCount.value + pageSize
      displayedCount.value = Math.min(nextCount, allNotifications.value.length)
      loadingMore.value = false
    }, 300)
  }
}

// 全部已读
const markAllRead = async () => {
  try {
    const res = await request({ url: '/system/notification/readAll', method: 'POST' })
    if (res.code === 200) {
      allNotifications.value.forEach((item) => {
        item.isRead = 1
      })
      unreadCount.value = 0
    } else {
      showNotify(res.remark || '操作失败')
    }
  } catch (e) {
    showNotify('操作失败')
  }
}

// 切换展开/折叠，并自动标记已读
const toggleDetail = async (item) => {
  expandedId.value = expandedId.value === item.id ? null : item.id
  if (item.isRead === 0) {
    try {
      const res = await request({
        url: '/system/notification/read',
        method: 'GET',
        params: { id: item.id },
      })
      if (res.code === 200) {
        item.isRead = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (e) {
      console.error('标记已读失败:', e)
    }
  }
}

// 时间格式化（用于站内信）
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 挂载时获取未读数（若已登录）
onMounted(() => {
  if (systemUser.value) fetchUnreadCount()
})

const openFeedback = () => {
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }
  showMoreMenu.value = false
  router.push({ name: 'feedback' })
}

const openAccountBindSheet = () => {
  if (!systemUser.value) {
    router.push({ name: 'login' })
    return
  }
  accountBindSheetRef.value?.openSheet()
}

defineExpose({
  showMoreMenu,
  showUserMenu,
  openActivityPanel,
  openAccountBindSheet,
  openExchangeModal,
})
</script>

<style scoped>
/* ========== 原有样式 ========== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  isolation: isolate;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  pointer-events: none;
}
.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 8px 0 4px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(30px) saturate(1.4);
  -webkit-backdrop-filter: blur(30px) saturate(1.4);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  pointer-events: auto;
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
  max-width: 70px;
}
.nav-item:hover {
  background-color: #f5f7fa;
}
.nav-center-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 64px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(30px) saturate(1.4);
  -webkit-backdrop-filter: blur(30px) saturate(1.4);
  border-radius: 50%;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 0 0 4px rgba(255, 255, 255, 0.45);
  cursor: pointer;
  position: absolute;
  top: -28px;
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
  margin-top: 2px;
  font-size: 11px;
  font-weight: 500;
}
.nav-item span {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
}
.nav-center-item.disabled {
  cursor: not-allowed;
  pointer-events: none;
}
.user-nav-item {
  position: relative;
}
.user-status-text {
  display: block;
  font-size: 11px;
  font-weight: 500;
}

/* 更多按钮上的未读角标 */
.more-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.more-badge {
  position: absolute;
  top: -12px;
  right: -20px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ee0a24;
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  box-sizing: border-box;
}

/* 菜单内角标 - 适配 Sheet 风格 */
.menu-badge-sheet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #ff3b30;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  line-height: 1;
  box-sizing: border-box;
}

/* ============================================================
   🍎 更多 Sheet – iOS 17 风格菜单
   ============================================================ */

.more-sheet-content {
  padding: 0 16px 8px;
}

.more-menu-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.more-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
  color: #1d1d1f;
  gap: 12px;
  -webkit-tap-highlight-color: transparent;
}

.more-menu-item:active {
  background: rgba(142, 142, 147, 0.12);
  transform: scale(0.98);
}

.more-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #007aff;
}

.more-menu-item-text {
  font-size: 15px;
  font-weight: 400;
  color: #1d1d1f;
  letter-spacing: 0.1px;
  flex: 1;
}

.more-sheet-divider {
  height: 0.5px;
  background: rgba(60, 60, 67, 0.08);
  margin: 6px 12px;
}

.more-menu-checkbox-item {
  cursor: pointer;
}

.more-menu-checkbox-item:active {
  background: rgba(142, 142, 147, 0.12) !important;
  transform: scale(0.98) !important;
}

/* 勾选图标 - 未选中 */
.more-checkbox-icon {
  color: #c7c7cc !important;
  transition: color 0.2s ease;
}

.more-checkbox-icon.checked {
  color: #007aff !important;
}

/* 安全区 */
.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* ========== 站内信面板样式（紧凑优化） ========== */
.notification-panel {
  display: flex;
  flex-direction: column;
  background: #f8f9fb;
}
.notification-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
  -webkit-overflow-scrolling: touch;
}
.notification-item {
  background: #fff;
  margin: 3px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  padding: 10px 12px;
}
.notification-item.unread {
  background: #e6f7ff;
}
.item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1890ff;
  margin-right: 10px;
  flex-shrink: 0;
}
.item-content {
  flex: 1;
  min-width: 0;
}
/* 时间在标题上方 */
.item-time {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}
.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 详情区域 */
.item-detail {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #ebedf0;
}
.detail-content {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 加载更多提示 */
.load-more {
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 13px;
}

.activity-panel-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fb;
}
.activity-panel-wrapper .panel-header {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.activity-panel-wrapper .panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* 开卡购买 Sheet 内容 */
.group-bind-sheet-content {
  padding: 0 16px 8px;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}
.slide-fade-enter-to {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
}
.slide-fade-leave-from {
  max-height: 300px;
  opacity: 1;
}
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #c0c4cc;
}
.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

/* PC端适配 */
@media (min-width: 768px) {
  .notification-panel :deep(.van-popup--right) {
    border-radius: 16px 0 0 16px !important;
  }
}

/* 移动端极致紧凑适配 */
@media (max-width: 767px) {
  .nav-container {
    padding: 6px 0 3px;
  }
  .nav-item {
    max-width: 60px;
  }
  .nav-center-item {
    width: 72px;
    height: 68px;
    top: -30px;
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.12),
      0 0 0 3px rgba(255, 255, 255, 0.5);
  }
  .nav-center-item :deep(.cute-icon),
  .nav-center-item svg,
  .nav-center-item img {
    width: 24px;
    height: 24px;
  }
  .nav-center-item span {
    font-size: 11px;
    margin-top: 2px;
  }
  .nav-item span {
    font-size: 10px;
    margin-top: 2px;
  }
  .nav-item :deep(.cute-icon),
  .nav-item svg,
  .nav-item img {
    width: 20px;
    height: 20px;
  }
  .user-status-text {
    font-size: 10px;
  }
  .more-badge {
    top: -10px;
    right: -16px;
    min-width: 14px;
    height: 14px;
    font-size: 9px;
    line-height: 14px;
  }
}
</style>
