<template>
  <!-- 🍎 账号绑定 – iOS 20 原生 Settings 风格 Sheet -->
  <ModernSheet v-model="showSheet" title="账号绑定">
    <!-- ====== 主视图：账号列表 ====== -->
    <template v-if="currentView === 'main'">
      <div class="abs-content">
        <!-- 已绑定列表 -->
        <div class="abs-section" v-if="boundAccounts.length > 0">
          <div class="abs-section-header">
            <span class="abs-section-label">已绑定</span>
            <button class="abs-text-btn" @click="showAccountsList = !showAccountsList">
              {{ showAccountsList ? '收起' : '展开全部' }}
            </button>
          </div>

          <div class="abs-group" :class="{ expanded: showAccountsList }">
            <div class="abs-list" v-show="showAccountsList">
              <div
                class="abs-row"
                v-for="(account, index) in boundAccounts"
                :key="account.id || index"
                @click="editAccount(index)"
              >
                <div class="abs-row-icon">
                  <van-icon name="apps-o" size="18" color="#ff6767" />
                </div>
                <div class="abs-row-body">
                  <span class="abs-row-title">{{ account.userName }}</span>
                  <span class="abs-row-label">
                    {{ getGameName(account.gameId) }}
                    · {{ getPlatformName(account.userType) }} · {{ account.serverId || '无区服' }}
                  </span>
                </div>
                <div class="abs-row-accessory">
                  <van-icon name="arrow" size="14" color="#c7c7cc" />
                </div>
              </div>
            </div>

            <!-- 折叠摘要 -->
            <div class="abs-summary" v-if="!showAccountsList">
              <van-icon name="checkmark-circle" size="16" color="#ff6767" />
              <span>已绑定 {{ boundAccounts.length }} 个账号</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="abs-empty" v-else>
          <div class="abs-empty-icon">
            <van-icon name="user-o" size="28" color="#ff6767" />
          </div>
          <p class="abs-empty-title">暂无绑定账号</p>
          <p class="abs-empty-desc">点击下方按钮添加游戏账号</p>
        </div>

        <!-- 添加按钮 -->
        <button class="abs-btn abs-btn-primary" @click="switchToBindForm">
          <van-icon name="plus" size="16" />
          添加新账号
        </button>
      </div>
    </template>

    <!-- ====== 表单视图：绑定/编辑 ====== -->
    <template v-else-if="currentView === 'bindForm'">
      <div class="abs-content">
        <!-- 表单分组 (iOS Settings 白底圆角列表) -->
        <div class="abs-group">
          <div class="abs-row">
            <span class="abs-row-label-fixed">账号</span>
            <van-field
              v-model="form.userName"
              placeholder="请输入游戏账号"
              class="abs-field"
              clearable
              :border="false"
            />
          </div>
          <div class="abs-divider"></div>
          <div class="abs-row">
            <span class="abs-row-label-fixed">密码</span>
            <van-field
              v-model="form.password"
              type="password"
              placeholder="请输入游戏密码"
              class="abs-field"
              clearable
              :border="false"
            />
          </div>
          <div class="abs-divider"></div>
          <div class="abs-row" @click="showGamePicker = true">
            <span class="abs-row-label-fixed">游戏</span>
            <div class="abs-row-value">
              <span :class="{ 'abs-placeholder': !form.gameId }">
                {{ selectedGameName || '请选择' }}
              </span>
              <van-icon name="arrow" size="14" color="#c7c7cc" />
            </div>
          </div>
          <div class="abs-divider"></div>
          <div class="abs-row" @click="showPlatformPicker = true">
            <span class="abs-row-label-fixed">平台</span>
            <div class="abs-row-value">
              <span :class="{ 'abs-placeholder': !form.userType }">
                {{ selectedPlatformName || '请选择' }}
              </span>
              <van-icon name="arrow" size="14" color="#c7c7cc" />
            </div>
          </div>
          <div class="abs-divider"></div>
          <div class="abs-row">
            <span class="abs-row-label-fixed">区服</span>
            <van-field
              v-model="form.serverId"
              type="number"
              placeholder="请输入游戏区服"
              class="abs-field"
              clearable
              :border="false"
            />
          </div>
        </div>

        <!-- 编辑模式：刷新 / 解绑 -->
        <div class="abs-sub-actions" v-if="editingIndex !== null">
          <button class="abs-btn abs-btn-outline" @click="refreshCurrentAccount">
            <span v-if="refreshing" class="abs-spinner abs-spinner-pink"></span>
            <span v-else>刷新账号</span>
          </button>
          <button class="abs-btn abs-btn-danger" @click="unbindCurrentAccount">解绑账号</button>
        </div>

        <!-- 主操作按钮 -->
        <button
          class="abs-btn abs-btn-primary"
          :disabled="!canBind || isBinding"
          @click="handleBind"
        >
          <span v-if="isBinding" class="abs-spinner"></span>
          <span v-else>{{ editingIndex !== null ? '保存修改' : '立即绑定' }}</span>
        </button>
        <button class="abs-btn abs-btn-ghost" @click="switchToMainView">取消</button>
      </div>
    </template>

    <!-- 游戏选择器 -->
    <van-action-sheet
      v-model:show="showGamePicker"
      :actions="gameOptions"
      @select="onGameSelect"
      cancel-text="取消"
    />
    <!-- 平台选择器 -->
    <van-action-sheet
      v-model:show="showPlatformPicker"
      :actions="platformOptions"
      @select="onPlatformSelect"
      cancel-text="取消"
    />

    <div class="modern-sheet-safe-bottom"></div>
  </ModernSheet>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import ModernSheet from './ModernSheet.vue'
import request from '@/utils/request'

const emit = defineEmits(['account-updated'])

// ---- 控制 ----
const showSheet = ref(false)
const currentView = ref('main') // 'main' | 'bindForm'
const showAccountsList = ref(true)
const showGamePicker = ref(false)
const showPlatformPicker = ref(false)

// ---- 状态 ----
const isBinding = ref(false)
const refreshing = ref(false)
const editingIndex = ref(null)
const boundAccounts = ref([])

const FEEDBACK_Z_INDEX = 7000

const showSheetToast = (message) => {
  showToast({
    message,
    zIndex: FEEDBACK_Z_INDEX,
  })
}

const showSheetDialog = (message, title = '操作失败') => {
  return showDialog({
    title,
    message,
    zIndex: FEEDBACK_Z_INDEX,
  })
}

const form = reactive({
  id: null,
  userName: '',
  password: '',
  gameId: '',
  userType: '',
  serverId: '',
})

// ---- 选项 ----
const gameOptions = [
  { name: '秘密花园', value: 1 },
  { name: '深海花园', value: 2 },
  { name: '我的花园世界', value: 3 },
]
const rawPlatformOptions = [
  { name: 'IOS', value: 1 },
  { name: 'Android', value: 2 },
]

const isMyGardenWorld = computed(() => Number(form.gameId) === 3)
const platformOptions = computed(() =>
  isMyGardenWorld.value ? rawPlatformOptions.filter((p) => p.value === 1) : rawPlatformOptions,
)

const selectedGameName = computed(() => {
  if (!form.gameId) return ''
  return gameOptions.find((g) => g.value === form.gameId)?.name || ''
})
const selectedPlatformName = computed(() => {
  if (!form.userType) return ''
  return rawPlatformOptions.find((p) => p.value == form.userType)?.name || ''
})
const canBind = computed(
  () =>
    form.userName.trim() !== '' &&
    form.password.trim() !== '' &&
    form.gameId !== '' &&
    form.userType !== '' &&
    form.serverId !== '' &&
    (!isMyGardenWorld.value || Number(form.userType) === 1),
)

// ---- API ----
const listAccounts = async () => {
  try {
    const res = await request({ url: '/user/bindAccounts', method: 'GET' })
    if (res.code === 200) boundAccounts.value = res.data || []
    else showSheetToast(res.remark || '获取账号列表失败')
  } catch {
    showSheetToast('网络异常')
  }
}

// ---- 公开方法 ----
const openSheet = async () => {
  showSheet.value = true
  currentView.value = 'main'
  resetForm()
  await listAccounts()
}

// ---- 内部方法 ----
const resetForm = () => {
  form.id = null
  form.userName = ''
  form.password = ''
  form.gameId = ''
  form.userType = ''
  form.serverId = ''
  editingIndex.value = null
}

const switchToMainView = () => {
  currentView.value = 'main'
  resetForm()
}

const switchToBindForm = () => {
  currentView.value = 'bindForm'
  if (editingIndex.value === null) resetForm()
}

const onGameSelect = (action) => {
  if (action.name !== '取消') {
    form.gameId = action.value
    if (Number(action.value) === 3 && Number(form.userType) !== 1) {
      form.userType = 1
      showSheetToast('我的花园世界目前仅支持 iOS，已自动选择 IOS')
    }
  }
  showGamePicker.value = false
}
const onPlatformSelect = (action) => {
  if (action.name !== '取消') {
    if (isMyGardenWorld.value && Number(action.value) !== 1) {
      showSheetToast('我的花园世界目前仅支持 iOS')
      showPlatformPicker.value = false
      return
    }
    form.userType = action.value
  }
  showPlatformPicker.value = false
}

const getGameName = (id) => gameOptions.find((g) => g.value == id)?.name || '未知'
const getPlatformName = (t) => rawPlatformOptions.find((p) => p.value == t)?.name || '未知'

const editAccount = (index) => {
  Object.assign(form, boundAccounts.value[index])
  editingIndex.value = index
  switchToBindForm()
}

const unbindAccount = async (index) => {
  try {
    await showConfirmDialog({
      title: '确认解绑',
      message: '确定要解绑该游戏账号吗？此操作不可恢复。',
      zIndex: FEEDBACK_Z_INDEX,
    })
    const res = await request({
      url: `/user/unbind?userId=${boundAccounts.value[index].id}`,
      method: 'GET',
    })
    if (res.code === 200) {
      boundAccounts.value.splice(index, 1)
      showSheetToast('解绑成功')
      emit('account-updated', { action: 'unbind' })
    } else showSheetToast(res.remark || '解绑失败')
  } catch {}
}

const unbindCurrentAccount = async () => {
  if (editingIndex.value === null) return
  await unbindAccount(editingIndex.value)
  switchToMainView()
}

const refreshCurrentAccount = async () => {
  if (editingIndex.value === null) return
  const account = boundAccounts.value[editingIndex.value]
  try {
    refreshing.value = true
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
      showSheetToast('刷新成功')
      emit('account-updated', { action: 'refresh' })
    } else showSheetToast(res.remark || '刷新失败')
  } catch {
    showSheetToast('网络异常')
  } finally {
    refreshing.value = false
  }
}

const handleBind = async () => {
  if (!canBind.value) {
    showSheetToast('请填写完整信息')
    return
  }
  if (isMyGardenWorld.value && Number(form.userType) !== 1) {
    showSheetToast('我的花园世界目前仅支持 iOS')
    return
  }
  try {
    isBinding.value = true
    const apiData = { ...form }
    const res = await request({ url: '/user/bind', method: 'POST', data: apiData })
    if (res.code === 200) {
      if (editingIndex.value !== null) {
        Object.assign(boundAccounts.value[editingIndex.value], apiData)
        showSheetToast('修改成功')
      } else {
        boundAccounts.value.push({ ...apiData })
        showSheetToast('绑定成功')
        emit('account-updated', { action: 'update', account: apiData })
      }
      switchToMainView()
    } else {
      await showSheetDialog(res.remark || '操作失败')
    }
  } catch {
    await showSheetDialog('网络异常')
  } finally {
    isBinding.value = false
  }
}

// Sheet 关闭时重置
watch(showSheet, (val) => {
  if (!val) {
    isBinding.value = false
    refreshing.value = false
    showGamePicker.value = false
    showPlatformPicker.value = false
    resetForm()
  }
})

defineExpose({ openSheet })
</script>

<style scoped>
/* ============================================================
   🍎 AccountBindSheet — 粉调磨砂玻璃 iOS 20 风格
   参考 apple-card.css 磨砂体系 + GroupBindCard 品牌粉 #ff6767
   ============================================================ */

.abs-content {
  padding: 8px 16px 12px;
}

/* ---- 分区头部（Uppercase 小标题） ---- */
.abs-section {
  margin-bottom: 16px;
}
.abs-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 8px;
}
.abs-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #8e8e93;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-text-btn {
  font-size: 14px;
  color: #ff6767;
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  border-radius: 6px;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  transition: background 0.15s;
}
.abs-text-btn:active {
  background: rgba(255, 103, 103, 0.08);
}

/* ---- 磨砂玻璃分组卡片 ---- */
.abs-group {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}
.abs-group.expanded {
  max-height: 340px;
  overflow-y: auto;
}

/* ---- 列表行 ---- */
.abs-row {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 8px 16px;
  gap: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.abs-row:active {
  background: rgba(255, 103, 103, 0.04);
}
.abs-list .abs-row + .abs-row {
  border-top: 0.5px solid rgba(60, 60, 67, 0.06);
}

.abs-row-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 103, 103, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.abs-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.abs-row-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-row-label {
  font-size: 12px;
  color: #8e8e93;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-row-accessory {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
/* ---- 折叠摘要 ---- */
.abs-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}

/* ---- 空状态 ---- */
.abs-empty {
  text-align: center;
  padding: 40px 0 24px;
}
.abs-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: rgba(255, 103, 103, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.abs-empty-title {
  font-size: 17px;
  font-weight: 590;
  color: #1d1d1f;
  margin: 0 0 4px;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-empty-desc {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}

/* ---- 表单标签 ---- */
.abs-row-label-fixed {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  width: 48px;
  flex-shrink: 0;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-row-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 16px;
  color: #1d1d1f;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
}
.abs-placeholder {
  color: #c7c7cc;
}

.abs-field {
  --van-field-padding: 4px 0 4px 8px;
  --van-field-input-font-size: 16px;
  --van-field-placeholder-color: #c7c7cc;
  --van-field-input-color: #1d1d1f;
  --van-field-input-text-align: right;
  --van-field-clear-icon-color: #c7c7cc;
  --van-field-clear-icon-size: 14px;
  background: transparent;
  flex: 1;
}

.abs-divider {
  height: 0.5px;
  background: rgba(60, 60, 67, 0.06);
  margin-left: 64px;
}

/* ============================================================
   按钮系统 — 品牌粉 #ff6767 + 磨砂质感
   ============================================================ */
.abs-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 590;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    opacity 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  font-family: -apple-system, 'PingFang SC', 'SF Pro Text', sans-serif;
  margin-top: 12px;
}
.abs-btn:active {
  opacity: 0.75;
  transform: scale(0.98);
}
.abs-btn:disabled {
  background: #e0e0e0;
  color: #fff;
  cursor: not-allowed;
  transform: none;
  opacity: 1;
  box-shadow: none;
}

.abs-btn-primary {
  background: linear-gradient(135deg, #ff6767 0%, #ff8a8a 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 103, 103, 0.25);
}

.abs-btn-ghost {
  background: transparent;
  color: #ff6767;
  border: 1px solid rgba(255, 103, 103, 0.15);
}
.abs-btn-ghost:active {
  background: rgba(255, 103, 103, 0.04);
}

.abs-btn-outline {
  background: transparent;
  color: #ff6767;
  border: 1px solid rgba(255, 103, 103, 0.15);
  flex: 1;
  margin-top: 0;
}
.abs-btn-outline:active {
  background: rgba(255, 103, 103, 0.04);
}

.abs-btn-danger {
  background: #ff3b30;
  color: #fff;
  flex: 1;
  margin-top: 0;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.15);
}

/* ---- 编辑模式副操作 ---- */
.abs-sub-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.abs-sub-actions .abs-btn {
  height: 38px;
  font-size: 14px;
  border-radius: 10px;
}

/* ---- 加载圈 ---- */
.abs-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: abs-spin 0.6s linear infinite;
}
.abs-spinner-pink {
  border-color: rgba(255, 103, 103, 0.2);
  border-top-color: #ff6767;
}
@keyframes abs-spin {
  to {
    transform: rotate(360deg);
  }
}

.modern-sheet-safe-bottom {
  height: env(safe-area-inset-bottom, 12px);
}

/* ============================================================
   🍎 暗色模式 — 深色磨砂玻璃
   ============================================================ */
@media (prefers-color-scheme: dark) {
  .abs-group {
    background: rgba(30, 30, 35, 0.72);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .abs-list .abs-row + .abs-row,
  .abs-divider {
    border-top-color: rgba(255, 255, 255, 0.06);
  }
  .abs-row-title,
  .abs-row-label-fixed,
  .abs-summary,
  .abs-empty-title {
    color: #f2f2f7;
  }
  .abs-field {
    --van-field-input-color: #f2f2f7;
    --van-field-placeholder-color: #636366;
  }
  .abs-btn-primary {
    background: linear-gradient(135deg, #ff6767 0%, #e85a5a 100%);
    box-shadow: 0 4px 14px rgba(255, 103, 103, 0.15);
  }
}
</style>
