<template>
  <!-- 小号绑定弹窗 -->
  <van-popup
    v-model:show="showAccountModal"
    round="24px"
    position="center"
    :style="{
      width: '90%',
      maxWidth: '480px',
      maxHeight: '80vh',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    }"
    closeable
    close-icon-position="top-right"
    @close="onModalClose"
    class="account-popup"
  >
    <!-- 弹窗内容区 -->
    <div class="account-modal">
      <!-- 顶部装饰 + 标题 -->
      <div class="modal-header">
        <div class="decor-line"></div>
        <div class="title-wrap">
          <div class="modal-title">{{ currentView === 'main' ? '游戏账号' : '绑定新账号' }}</div>
        </div>
      </div>

      <!-- 主视图：账号列表 -->
      <div v-if="currentView === 'main'">
        <!-- 已绑定账号列表 -->
        <div class="accounts-section" v-if="boundAccounts.length > 0">
          <div class="section-header">
            <div class="list-title">已绑定账号</div>
            <van-button
              size="mini"
              type="primary"
              plain
              hairline
              @click="toggleAccountsList"
              class="toggle-btn"
            >
              {{ showAccountsList ? '收起' : '展开' }}
            </van-button>
          </div>

          <!-- 🔥 修复1：固定高度容器，展开后内部滚动，不影响新增按钮 -->
          <div class="accounts-container" :class="{ expanded: showAccountsList }">
            <div class="accounts-list" v-show="showAccountsList">
              <div class="account-item" v-for="(account, index) in boundAccounts" :key="index">
                <div class="account-info">
                  <div class="game-type">
                    <van-icon name="apps-o" class="game-icon" />
                    <span>{{ getGameName(account.gameId) }}</span>
                    <span class="platform-tag">({{ getPlatformName(account.userType) }})</span>
                  </div>
                  <div class="server-info">
                    <van-icon name="cluster-o" class="server-icon" />
                    <span>区服: {{ account.serverId || '未设置' }}</span>
                  </div>
                  <div class="account-details">
                    <div class="account-name">{{ account.userName }}</div>
                    <div class="expire-time">
                      <van-icon name="clock-o" class="time-icon" />
                      <span>VIP过期时间: {{ formatDate(account.expireTime) }}</span>
                    </div>
                  </div>
                </div>
                <!-- 🔥 修复2：新增刷新按钮 -->
                <div class="account-actions">
                  <!-- 刷新按钮 → 带加载状态 -->
                  <van-button
                    size="small"
                    type="default"
                    plain
                    hairline
                    @click="refreshAccount(index)"
                    :loading="refreshingIndex === index"
                  >
                    刷新
                  </van-button>
                  <van-button
                    size="small"
                    type="primary"
                    plain
                    hairline
                    @click="editAccount(index)"
                  >
                    修改
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    plain
                    hairline
                    @click="unbindAccount(index)"
                  >
                    解绑
                  </van-button>
                </div>
              </div>
            </div>

            <!-- 账号数量摘要 -->
            <div class="accounts-summary" v-if="!showAccountsList && boundAccounts.length > 0">
              <div class="summary-content">
                <van-icon name="apps-o" class="summary-icon" />
                <span>已绑定 {{ boundAccounts.length }} 个账号</span>
              </div>
              <van-button
                size="mini"
                type="primary"
                plain
                hairline
                @click="toggleAccountsList"
                class="expand-btn"
              >
                查看全部
              </van-button>
            </div>
          </div>
        </div>

        <!-- 添加新账号按钮 → 永久固定在底部，不会被遮挡 -->
        <div class="add-account-section">
          <van-button type="default" class="add-account-btn" @click="switchToBindForm" block>
            <van-icon name="plus" class="add-icon" />
            添加新账号
          </van-button>
        </div>
      </div>

      <!-- 表单视图：绑定新账号 -->
      <div v-else-if="currentView === 'bindForm'" class="bind-form-view">
        <div class="form-header">
          <van-button
            icon="arrow-left"
            type="default"
            plain
            hairline
            size="small"
            @click="switchToMainView"
            class="back-btn"
          >
            返回
          </van-button>
        </div>

        <div class="bind-form">
          <div class="form-title">绑定新账号</div>
          <van-field
            v-model="newAccount.userName"
            placeholder="请输入游戏账号"
            class="form-field account-input"
            clearable
            border="none"
          >
            <template #left-icon>
              <van-icon name="user-o" class="field-icon" />
            </template>
          </van-field>
          <van-field
            v-model="newAccount.password"
            type="password"
            placeholder="请输入游戏密码"
            class="form-field password-input"
            clearable
            border="none"
          >
            <template #left-icon>
              <van-icon name="lock" class="field-icon" />
            </template>
          </van-field>
          <van-field
            readonly
            clickable
            v-model="selectedGameName"
            @click="showGameSelection"
            placeholder="请选择游戏类型"
            class="form-field game-select"
            border="none"
          >
            <template #left-icon>
              <van-icon name="apps-o" class="field-icon" />
            </template>
            <template #right-icon>
              <van-icon name="arrow-down" class="select-icon" />
            </template>
          </van-field>
          <van-action-sheet
            v-model:show="showGamePicker"
            :actions="gameOptions"
            @select="onGameSelect"
            cancel-text="取消"
          />
          <van-field
            readonly
            clickable
            v-model="selectedPlatformName"
            @click="showPlatformSelection"
            placeholder="请选择游戏平台"
            class="form-field platform-select"
            border="none"
          >
            <template #left-icon>
              <van-icon name="setting-o" class="field-icon" />
            </template>
            <template #right-icon>
              <van-icon name="arrow-down" class="select-icon" />
            </template>
          </van-field>
          <van-action-sheet
            v-model:show="showPlatformPicker"
            :actions="platformOptions"
            @select="onPlatformSelect"
            cancel-text="取消"
          />
          <van-field
            v-model="newAccount.serverId"
            type="number"
            placeholder="请输入游戏区服"
            class="form-field server-input"
            clearable
            border="none"
          >
            <template #left-icon>
              <van-icon name="cluster-o" class="field-icon" />
            </template>
          </van-field>
          <div class="action-buttons">
            <van-button
              type="primary"
              class="bind-btn"
              :loading="isBinding"
              :disabled="!canBind"
              @click="handleBind"
              block
            >
              {{ editingIndex !== null ? '保存修改' : '立即绑定' }}
            </van-button>
            <van-button
              type="default"
              class="cancel-btn"
              @click="switchToMainView"
              block
              style="margin-top: 12px"
            >
              取消
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import request from '@/utils/request'

const emit = defineEmits(['account-updated'])

// 弹窗显示状态
const showAccountModal = ref(false)
const isBinding = ref(false)
const showGamePicker = ref(false)
const showPlatformPicker = ref(false)
const editingIndex = ref(null)
const showAccountsList = ref(true)
const currentView = ref('main')
// 🔥 新增：刷新按钮加载状态（记录当前刷新的索引）
const refreshingIndex = ref(null)

// 新账号绑定数据
const newAccount = reactive({
  userName: '',
  password: '',
  gameId: '',
  userType: '',
  serverId: '',
  expireTime: '',
  id: null,
})

// 已绑定账号列表
const boundAccounts = ref([])

// 游戏/平台选项
const gameOptions = [
  { name: '秘密花园', value: 1 },
  { name: '深海花园', value: 2 },
]
const platformOptions = [
  { name: 'IOS', value: 1 },
  { name: 'Android', value: 2 },
]

const selectedGameName = computed(() => {
  if (!newAccount.gameId) return ''
  const game = gameOptions.find((g) => g.value === newAccount.gameId)
  return game ? game.name : ''
})
const selectedPlatformName = computed(() => {
  if (!newAccount.userType) return ''
  const platform = platformOptions.find((p) => p.value === newAccount.userType)
  return platform ? platform.name : ''
})
const canBind = computed(() => {
  return (
    newAccount.userName.trim() !== '' &&
    newAccount.password.trim() !== '' &&
    newAccount.gameId !== '' &&
    newAccount.userType !== '' &&
    newAccount.serverId != ''
  )
})

// 获取账号列表
const listAccounts = async () => {
  try {
    const res = await request({ url: '/user/bindAccounts', method: 'GET' })
    if (res.code === 200) boundAccounts.value = res.data || []
    else showToast(res.remark || '获取账号列表失败')
  } catch (error) {
    showToast('网络异常，无法获取账号列表')
    console.error(error)
  }
}

// 打开弹窗
const openModal = async () => {
  showAccountModal.value = true
  currentView.value = 'main'
  resetForm()
  await listAccounts()
}

// 关闭弹窗
const onModalClose = () => {
  showAccountModal.value = false
  isBinding.value = false
  refreshingIndex.value = null // 重置刷新状态
  showGamePicker.value = false
  showPlatformPicker.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  newAccount.userName = ''
  newAccount.password = ''
  newAccount.gameId = ''
  newAccount.userType = ''
  newAccount.serverId = ''
  newAccount.expireTime = ''
  newAccount.id = null
  editingIndex.value = null
}

// 选择器方法
const showGameSelection = () => (showGamePicker.value = true)
const showPlatformSelection = () => (showPlatformPicker.value = true)
const onGameSelect = (action) => {
  if (action.name !== '取消') newAccount.gameId = action.value
  showGamePicker.value = false
}
const onPlatformSelect = (action) => {
  if (action.name !== '取消') newAccount.userType = action.value
  showPlatformPicker.value = false
}

// 工具方法
const formatDate = (dateString) => {
  if (!dateString) return '无'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
const getGameName = (gameId) => {
  const game = gameOptions.find((g) => g.value == gameId)
  return game ? game.name : '未知游戏'
}
const getPlatformName = (userType) => {
  const platform = platformOptions.find((p) => p.value == userType)
  return platform ? platform.name : '未知平台'
}

// 编辑账号
const editAccount = (index) => {
  const account = boundAccounts.value[index]
  Object.assign(newAccount, account)
  editingIndex.value = index
  switchToBindForm()
}

// 解绑账号
const unbindAccount = async (index) => {
  try {
    await showConfirmDialog({
      title: '确认解绑',
      message: '确定要解绑该游戏账号吗？此操作不可恢复。',
    })
    const res = await request({
      url: `/user/unbind?userId=${boundAccounts.value[index].id}`,
      method: 'GET',
    })
    if (res.code === 200) {
      boundAccounts.value.splice(index, 1)
      showToast('解绑成功')
      emit('account-updated', { action: 'unbind' })
    } else showToast(res.remark || '解绑失败')
  } catch (error) {}
}

// 🔥 核心新增：账号刷新功能（调用修改接口，复用原参数）
const refreshAccount = async (index) => {
  const account = boundAccounts.value[index]
  try {
    // 开启加载状态
    refreshingIndex.value = index
    const res = await request({
      url: '/user/bind',
      method: 'POST',
      data: {
        id: account.id,
        userName: account.userName,
        password: account.password,
        gameId: account.gameId,
        userType: account.userType,
        serverId: account.serverId,
      },
    })
    if (res.code === 200) {
      showToast('账号刷新成功')
      emit('account-updated', { action: 'refresh' })
      // 可选：刷新后重新拉取列表，保证数据最新
      // await listAccounts()
    } else {
      showToast(res.remark || '刷新失败')
    }
  } catch (error) {
    showToast('网络异常，刷新失败')
    console.error('刷新账号失败：', error)
  } finally {
    // 关闭加载状态
    refreshingIndex.value = null
  }
}

// 切换列表展开/收起
const toggleAccountsList = () => {
  showAccountsList.value = !showAccountsList.value
}

// 视图切换
const switchToBindForm = () => {
  currentView.value = 'bindForm'
  if (editingIndex.value === null) resetForm()
}
const switchToMainView = () => {
  currentView.value = 'main'
  resetForm()
}

// 绑定/修改账号
const handleBind = async () => {
  if (!canBind.value) {
    showToast('请填写完整的账号信息')
    return
  }
  try {
    isBinding.value = true
    const apiData = { ...newAccount }
    let res
    if (editingIndex.value !== null) {
      res = await request({ url: '/user/bind', method: 'POST', data: apiData })
      if (res.code === 200) {
        Object.assign(boundAccounts.value[editingIndex.value], apiData)
        showToast('修改成功')
        switchToMainView()
      }
    } else {
      res = await request({ url: '/user/bind', method: 'POST', data: apiData })
      if (res.code === 200) {
        boundAccounts.value.push({ ...apiData, expireTime: '' })
        showToast('绑定成功')
        switchToMainView()
        emit('account-updated', { action: 'update', account: apiData })
      }
    }
    if (res.code !== 200) showToast(res.remark || '操作失败')
  } catch (error) {
    showToast('网络异常，请稍后再试')
    console.error(error)
  } finally {
    isBinding.value = false
  }
}

defineExpose({ openModal })
</script>

<style scoped>
/* 弹窗基础样式 */
.account-popup {
  --van-popup-background: #ffffff;
  --van-popup-close-icon-color: #c0c4cc;
}

.account-modal {
  padding: 36px 24px 28px;
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
  /* 弹性布局，保证新增按钮贴底 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 头部区域 */
.modal-header {
  text-align: center;
  margin-bottom: 8px;
  position: relative;
  flex-shrink: 0;
}

.decor-line {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e9f2, transparent);
  z-index: 1;
}

.title-wrap {
  position: relative;
  z-index: 2;
  display: inline-block;
  background: #fff;
  padding: 0 20px;
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

/* 已绑定账号部分 */
.accounts-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.toggle-btn {
  min-width: 60px;
  height: 28px;
  font-size: 12px;
}

/* 🔥 修复：列表容器固定高度，内部滚动 */
.accounts-container {
  background: #f9fafc;
  border-radius: 20px;
  padding: 16px;
  transition: all 0.3s ease;
  flex: 1;
  min-height: 80px;
}
/* 展开后固定高度，自动滚动 */
.accounts-container.expanded {
  height: 280px !important;
  max-height: 280px !important;
  overflow-y: auto;
}

/* 账号列表 */
.accounts-list {
  margin-bottom: 12px;
}

.account-item {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.account-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.account-info {
  flex: 1;
}

.game-type {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #303133;
  font-weight: 500;
}

.game-icon {
  margin-right: 8px;
  color: #7b61ff;
}

.platform-tag {
  margin-left: 8px;
  font-size: 12px;
  color: #7b61ff;
  background: rgba(123, 97, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.server-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #909399;
  font-size: 13px;
}

.server-icon {
  margin-right: 8px;
  color: #909399;
}

.account-details {
  padding-left: 24px;
}

.account-name {
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 4px;
}

.expire-time {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.time-icon {
  margin-right: 4px;
  font-size: 12px;
}

/* 按钮组间距适配 */
.account-actions {
  display: flex;
  gap: 6px;
}

.account-actions .van-button {
  min-width: 56px;
  height: 28px;
  font-size: 12px;
  padding: 0 6px;
}

/* 账号摘要 */
.accounts-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-weight: 500;
}

.summary-icon {
  color: #7b61ff;
}

.expand-btn {
  min-width: 60px;
  height: 28px;
  font-size: 12px;
}

/* 添加账号按钮 → 固定在底部，永久可见 */
.add-account-section {
  margin-top: 0;
  flex-shrink: 0;
}

.add-account-btn {
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  background: #f9fafc !important;
  color: #7b61ff !important;
  border: 2px dashed #e5e9f2 !important;
  transition: all 0.2s ease;
}

.add-account-btn:hover {
  background: #f0eeff !important;
  border-color: #7b61ff !important;
}

.add-icon {
  margin-right: 8px;
}

/* 表单视图 */
.bind-form-view {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-header {
  margin-bottom: 16px;
}

.back-btn {
  min-width: 80px;
  height: 32px;
  font-size: 14px;
}

/* 绑定表单区域 */
.bind-form {
  background: #f9fafc;
  border-radius: 20px;
  padding: 16px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
}

.form-field {
  --van-field-padding: 12px 0;
  --van-field-placeholder-color: #c0c4cc;
  --van-field-input-color: #303133;
  --van-field-input-font-size: 15px;
  margin-bottom: 0;
}

.field-icon {
  color: #9da3af;
  margin-right: 8px;
  font-size: 16px;
}

.select-icon {
  color: #c0c4cc;
  font-size: 16px;
}

/* 操作按钮组 */
.action-buttons {
  margin-top: 16px;
}

.bind-btn {
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #7b61ff, #5742d8) !important;
  border: none !important;
  box-shadow: 0 8px 16px rgba(123, 97, 255, 0.25);
  transition: all 0.2s ease;
}

.bind-btn:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: 0 4px 8px rgba(123, 97, 255, 0.2);
}

.bind-btn:deep(.van-button--disabled) {
  background: #e5e9f2 !important;
  color: #c0c4cc !important;
  box-shadow: none !important;
}

.cancel-btn {
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  background: #f9fafc !important;
  color: #606266 !important;
  border: 1px solid #e5e9f2 !important;
}

/* 关闭按钮样式优化 */
:deep(.van-popup__close-icon) {
  font-size: 20px;
  top: 20px;
  right: 20px;
  transition: color 0.2s;
}

:deep(.van-popup__close-icon):hover {
  color: #9da3af;
}

/* 输入框清除按钮样式 */
:deep(.van-field__clear-icon) {
  color: #c0c4cc;
  width: 16px;
  height: 16px;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .account-modal {
    padding: 28px 16px 24px;
  }

  .modal-title {
    font-size: 20px;
  }

  .bind-btn {
    height: 48px;
  }

  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .toggle-btn {
    align-self: flex-end;
  }
}
</style>
