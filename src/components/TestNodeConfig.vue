<template>
  <div class="test-node-config">
    <!-- 功能开关 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">测试节点功能开关</span>
        <van-switch v-model="enabled" :loading="savingSwitch" @change="onSwitchChange" />
      </div>
    </div>

    <!-- 测试节点选择 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">测试节点选择</span>
        <span class="card-subtitle">已选 {{ selectedNodeIds.length }} 个节点</span>
      </div>
      <div v-if="runningNodes.length === 0" class="empty-state">暂无运行中的节点</div>
      <div class="node-checkbox-list" v-else>
        <div
          class="node-checkbox-item"
          :class="{ checked: selectedNodeIds.includes(node.nodeId) }"
          v-for="node in runningNodes"
          :key="node.nodeId"
          @click="toggleNode(node.nodeId)"
        >
          <van-checkbox
            :model-value="selectedNodeIds.includes(node.nodeId)"
            shape="square"
            @click.stop
          />
          <span class="node-label"
            >{{ node.nodeId }} (负载: {{ (node.loadRatio * 100).toFixed(2) }})</span
          >
        </div>
      </div>
    </div>

    <!-- 测试用户列表 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">测试用户管理</span>
        <span class="card-subtitle">
          已选 {{ selectedUserIds.length }} 个用户
          <template v-if="cachedTestUserCount"> · 本地名单 {{ cachedTestUserCount }} 人</template>
        </span>
      </div>
      <div class="user-panel">
        <!-- 左栏：搜索 -->
        <div class="user-column left-column">
          <div class="column-label">搜索用户</div>
          <div class="search-box">
            <van-icon name="search" size="16" color="#999" />
            <input
              v-model="searchKeyword"
              type="text"
              class="input search-input"
              placeholder="输入昵称搜索..."
              @input="debounceSearch"
            />
            <van-loading v-if="searching" size="16" color="#1989fa" />
          </div>
          <div class="search-results" v-if="searchResults.length > 0">
            <div
              class="search-result-item"
              :class="{ selected: isUserSelected(user) }"
              v-for="user in searchResults"
              :key="user.id"
              @click="toggleUser(user)"
            >
              <span class="user-display">{{ getUserDisplayName(user) }}(id: {{ getUserId(user) }})</span>
              <van-icon
                v-if="isUserSelected(user)"
                name="success"
                color="#07c160"
                size="18"
              />
              <van-icon v-else name="plus" color="#999" size="18" />
            </div>
          </div>
          <div v-else-if="searchKeyword && !searching" class="empty-state-small">暂无匹配用户</div>
        </div>
        <!-- 右栏：已选用户 -->
        <div class="user-column right-column">
          <div class="column-label">已选用户</div>
          <div class="selected-users" v-if="selectedUserIds.length > 0">
            <div class="selected-user-item" v-for="user in selectedUsers" :key="user.id">
              <div class="user-info-row">
                <span
                  class="status-dot"
                  :class="getStatusClass(user)"
                  :title="user.userStatusText || '未获取状态'"
                ></span>
                <span class="user-display">{{ getUserDisplayName(user) }}(id: {{ getUserId(user) }})</span>
                <van-icon
                  name="cross"
                  color="#999"
                  size="16"
                  class="remove-btn"
                  @click="removeUser(getUserId(user))"
                />
              </div>
              <div class="user-status-row" v-if="user.nodeId">
                <span class="status-node">节点: {{ user.nodeId }}</span>
                <span class="status-text" :class="getStatusTextClass(user)">
                  {{ user.userStatusText || '未知' }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state-small">暂未选择用户</div>
        </div>
      </div>
      <!-- 刷新状态按钮 -->
      <div class="status-actions">
        <button
          class="action-btn refresh-status-btn"
          @click="refreshUserStatus"
          :disabled="selectedUserIds.length === 0"
        >
          <van-icon name="replay" size="14" />
          刷新用户状态
        </button>
        <button
          class="action-btn import-cache-btn"
          @click="importCachedTestUsers"
          :disabled="cachedTestUserCount === 0"
        >
          <van-icon name="down" size="14" />
          导入测试名单
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="primary-btn save-btn" @click="saveConfig" :disabled="saving">
        <van-loading v-if="saving" size="18" color="#fff" style="margin-right: 6px" />
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
      <button
        class="danger-btn transfer-btn"
        @click="showTransferDialog = true"
        :disabled="selectedUserIds.length === 0"
      >
        一键转移到指定节点
      </button>
    </div>

    <!-- 转移节点选择弹窗 -->
    <van-dialog
      v-model:show="showTransferDialog"
      title="选择目标节点"
      show-cancel-button
      confirm-button-text="确认转移"
      @confirm="confirmTransfer"
    >
      <div class="transfer-node-list">
        <van-radio-group v-model="transferTargetNodeId">
          <van-radio
            v-for="node in allNodeList"
            :key="node.nodeId"
            :name="node.nodeId"
            class="transfer-radio"
          >
            {{ node.nodeId }} (负载: {{ (node.loadRatio * 100).toFixed(2) }})
          </van-radio>
        </van-radio-group>
      </div>
    </van-dialog>

    <!-- 状态弹窗 -->
    <van-dialog v-model:show="showResultDialog" :title="resultDialogTitle">
      <div class="result-content">{{ resultDialogMessage }}</div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import request from '@/utils/request'
import {
  Switch as VanSwitch,
  Checkbox as VanCheckbox,
  Loading as VanLoading,
  Icon as VanIcon,
  Dialog as VanDialog,
  RadioGroup as VanRadioGroup,
  Radio as VanRadio,
  showNotify,
} from 'vant'

// ================= Props & Emit =================
const emit = defineEmits(['config-saved'])

// ================= 状态变量 =================
const enabled = ref(false)
const savingSwitch = ref(false)
const saving = ref(false)
const showTransferDialog = ref(false)
const showResultDialog = ref(false)
const resultDialogTitle = ref('')
const resultDialogMessage = ref('')
const transferTargetNodeId = ref('')
const searching = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const cachedTestUserCount = ref(0)

// 节点列表
const allNodeList = ref([])
const selectedNodeIds = ref([])

// 用户相关
const selectedUserIds = ref([])
const selectedUsers = ref([]) // 存储用户详细信息及状态
const userStatusMap = ref({}) // userId -> { userId, status, statusText, nodeId }

// 配置key
const CONFIG_MODULE_KEY = 'test_node_config'
const TEST_USER_CACHE_KEY = 'test_node_cached_users'

const LONG_NUMBER_RE = /"((?:userId|id|testUserIds|userIds))"\s*:\s*(-?\d{16,})/g
const LONG_NUMBER_ARRAY_RE =
  /"((?:testUserIds|userIds))"\s*:\s*\[([^\]]*?\d{16,}[^\]]*?)\]/g

const parseLongIdSafeJson = (text) => {
  if (typeof text !== 'string') return text
  const safeText = text
    .replace(LONG_NUMBER_RE, '"$1":"$2"')
    .replace(LONG_NUMBER_ARRAY_RE, (match, key, body) => {
      const safeBody = body.replace(/(?<=\[|,)\s*(-?\d{16,})\s*(?=,|\])/g, '"$1"')
      return `"${key}":[${safeBody}]`
    })
  return JSON.parse(safeText)
}

const safeRequest = async (config) => {
  const response = await request({
    ...config,
    transformResponse: [
      (data) => {
        if (!data) return data
        try {
          return parseLongIdSafeJson(data)
        } catch {
          return data
        }
      },
    ],
  })
  return response
}

const normalizeId = (id) => {
  if (id === null || id === undefined) return ''
  return String(id).trim()
}

const getUserId = (user) => normalizeId(user?.userId ?? user?.id)

const normalizeUser = (user, fallbackId = '') => {
  const uid = getUserId(user) || normalizeId(fallbackId)
  return {
    ...user,
    id: uid,
    userId: uid,
    nickName: user?.nickName || user?.userName || uid,
  }
}

const normalizeIdList = (ids) => {
  if (typeof ids === 'string') {
    return ids
      .split(',')
      .map(normalizeId)
      .filter(Boolean)
  }
  if (!Array.isArray(ids)) return []
  return ids.map(normalizeId).filter(Boolean)
}

const normalizeUserList = (users = []) => {
  if (!Array.isArray(users)) return []
  const seen = new Set()
  return users.map((user) => normalizeUser(user)).filter((user) => {
    if (!user.id || seen.has(user.id)) return false
    seen.add(user.id)
    return true
  })
}

const getUserDisplayName = (user) => user?.nickName || user?.userName || getUserId(user)

const isUserSelected = (user) => selectedUserIds.value.includes(getUserId(user))

const loadCachedTestUsers = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(TEST_USER_CACHE_KEY) || '[]')
    const users = normalizeUserList(cached)
    cachedTestUserCount.value = users.length
    return users
  } catch {
    cachedTestUserCount.value = 0
    return []
  }
}

const cacheCurrentTestUsers = () => {
  const users = selectedUserIds.value.map((uid) => {
    const detail = selectedUsers.value.find((user) => getUserId(user) === uid)
    return normalizeUser(detail || { id: uid, userId: uid, nickName: uid })
  })
  localStorage.setItem(TEST_USER_CACHE_KEY, JSON.stringify(users))
  cachedTestUserCount.value = users.length
}

const importCachedTestUsers = () => {
  const cachedUsers = loadCachedTestUsers()
  if (cachedUsers.length === 0) {
    showNotify({ type: 'warning', message: '暂无可导入的本地测试名单' })
    return
  }
  selectedUsers.value = cachedUsers
  selectedUserIds.value = cachedUsers.map((user) => user.id)
  refreshUserStatus()
  showNotify({ type: 'success', message: `已导入 ${cachedUsers.length} 个测试用户` })
}

// ================= 计算属性 =================
const runningNodes = computed(() => {
  return allNodeList.value.filter((n) => n.status === 1)
})

// ================= 初始化加载 =================
onMounted(() => {
  loadCachedTestUsers()
  loadAllData()
})

// ================= 数据加载 =================
const loadAllData = async () => {
  await Promise.all([fetchNodeList(), fetchConfig()])
}

// 获取节点列表
const fetchNodeList = async () => {
  try {
    const res = await request({ url: '/manage/status', method: 'GET' })
    if (res.code === 200 && res.data) {
      allNodeList.value = res.data
    }
  } catch (err) {
    console.error('获取节点列表失败：', err)
    showNotify({ type: 'danger', message: '获取节点列表失败' })
  }
}

// 获取配置
const fetchConfig = async () => {
  try {
    const detailRes = await safeRequest({
      url: '/manage/config/get',
      method: 'GET',
      params: { moduleKey: CONFIG_MODULE_KEY },
    })
    if (detailRes.code === 200 && detailRes.data) {
      const config = detailRes.data.configData || {}
      applyConfig(config)
    }
  } catch (err) {
    console.error('获取配置失败：', err)
  }
}

// 应用配置
const applyConfig = (configData) => {
  // configData可能是对象或JSON字符串
  let config
  if (typeof configData === 'string') {
    try {
      config = parseLongIdSafeJson(configData)
    } catch {
      config = configData
    }
  } else {
    config = configData
  }

  if (config) {
    enabled.value = !!config.enabled
    selectedNodeIds.value = config.testNodeIds || []
    selectedUserIds.value = normalizeIdList(config.testUserIds)
    const cachedUsers = loadCachedTestUsers()
    selectedUsers.value = selectedUserIds.value.map((uid) => {
      const cachedUser = cachedUsers.find((user) => user.id === uid)
      return normalizeUser(cachedUser || { id: uid, userId: uid, nickName: uid })
    })
    // 加载用户状态
    if (selectedUserIds.value.length > 0) {
      refreshUserStatus()
    }
  }
}

// ================= 开关切换 =================
const onSwitchChange = async (val) => {
  savingSwitch.value = true
  try {
    const res = await request({
      url: '/manage/test/node-config',
      method: 'POST',
      data: {
        enabled: val,
        testNodeIds: selectedNodeIds.value,
        testUserIds: [...selectedUserIds.value],
      },
    })
    if (typeof res === 'string' && res.startsWith('✅')) {
      showNotify({ type: 'success', message: '开关状态已更新' })
    } else {
      showNotify({ type: 'danger', message: '开关更新失败：' + (res || '未知错误') })
      enabled.value = !val // 回滚
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '开关更新失败：' + err.message })
    enabled.value = !val // 回滚
  } finally {
    savingSwitch.value = false
  }
}

// ================= 节点选择 =================
const toggleNode = (nodeId) => {
  const idx = selectedNodeIds.value.indexOf(nodeId)
  if (idx > -1) {
    selectedNodeIds.value.splice(idx, 1)
  } else {
    selectedNodeIds.value.push(nodeId)
  }
}

// ================= 用户搜索 =================
let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const fetchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await safeRequest({
      url: '/manage/user/search',
      method: 'GET',
      params: { type: 1, nickName: searchKeyword.value.trim() },
    })
    if (res.code === 200) {
      searchResults.value = normalizeUserList(res.data || [])
    }
  } catch (err) {
    console.error('搜索用户失败：', err)
    showNotify({ type: 'danger', message: '搜索用户失败' })
  } finally {
    searching.value = false
  }
}

// ================= 用户选择管理 =================
const toggleUser = (user) => {
  const normalizedUser = normalizeUser(user)
  const uid = normalizedUser.id
  if (!uid) return
  const idx = selectedUserIds.value.indexOf(uid)
  if (idx > -1) {
    selectedUserIds.value.splice(idx, 1)
    // 从已选列表中移除
    const userIdx = selectedUsers.value.findIndex((u) => getUserId(u) === uid)
    if (userIdx > -1) selectedUsers.value.splice(userIdx, 1)
  } else {
    selectedUserIds.value.push(uid)
    // 添加到已选列表
    const existing = selectedUsers.value.find((u) => getUserId(u) === uid)
    if (!existing) {
      selectedUsers.value.push({
        ...normalizedUser,
        userStatusText: '',
        nodeId: '',
        status: -1,
      })
    }
    // 立即查询该用户状态
    fetchSingleUserStatus(uid)
  }
}

const removeUser = (uid) => {
  uid = normalizeId(uid)
  const idx = selectedUserIds.value.indexOf(uid)
  if (idx > -1) selectedUserIds.value.splice(idx, 1)
  const userIdx = selectedUsers.value.findIndex((u) => getUserId(u) === uid)
  if (userIdx > -1) selectedUsers.value.splice(userIdx, 1)
}

// ================= 用户状态查询 =================
const fetchSingleUserStatus = async (uid) => {
  try {
    uid = normalizeId(uid)
    const res = await safeRequest({
      url: '/manage/test/users/status',
      method: 'GET',
      params: { userIds: uid },
    })
    if (res.code === 200 && res.data) {
      const statusData = res.data
      if (Array.isArray(statusData)) {
        statusData.forEach((s) => {
          updateUserStatus(s)
        })
      } else {
        updateUserStatus(statusData)
      }
    }
  } catch (err) {
    console.error(`获取用户${uid}状态失败：`, err)
  }
}

const refreshUserStatus = async () => {
  if (selectedUserIds.value.length === 0) return
  try {
    const res = await safeRequest({
      url: '/manage/test/users/status',
      method: 'GET',
      params: { userIds: selectedUserIds.value.join(',') },
    })
    if (res.code === 200 && res.data) {
      const statusList = Array.isArray(res.data) ? res.data : [res.data]
      statusList.forEach((s) => {
        updateUserStatus(s)
      })
    }
  } catch (err) {
    console.error('刷新用户状态失败：', err)
    showNotify({ type: 'danger', message: '刷新用户状态失败' })
  }
}

const updateUserStatus = (statusData) => {
  if (!statusData || !statusData.userId) return
  const uid = normalizeId(statusData.userId)
  const userInList = selectedUsers.value.find((u) => getUserId(u) === uid)
  if (userInList) {
    userInList.userStatus = statusData.status
    userInList.userStatusText = statusData.statusText
    userInList.nodeId = statusData.nodeId
    if (statusData.nickName || statusData.userName) {
      userInList.nickName = statusData.nickName || statusData.userName
    }
  }
  userStatusMap.value[uid] = {
    status: statusData.status,
    statusText: statusData.statusText,
    nodeId: statusData.nodeId,
  }
}

// ================= 状态展示样式 =================
const getStatusClass = (user) => {
  const status = user.userStatus ?? userStatusMap.value[getUserId(user)]?.status
  if (status === 1) return 'dot-green' // 运行中
  if (status === 2) return 'dot-orange' // 等待中
  return 'dot-gray' // 未运行或未知
}

const getStatusTextClass = (user) => {
  const status = user.userStatus ?? userStatusMap.value[getUserId(user)]?.status
  if (status === 1) return 'text-green'
  if (status === 2) return 'text-orange'
  return 'text-gray'
}

// ================= 保存配置 =================
const saveConfig = async () => {
  saving.value = true
  try {
    const payload = {
      enabled: enabled.value,
      testNodeIds: selectedNodeIds.value,
      testUserIds: [...selectedUserIds.value],
    }
    const res = await request({
      url: '/manage/test/node-config',
      method: 'POST',
      data: payload,
    })
    if (typeof res === 'string') {
      if (res.startsWith('✅')) {
        resultDialogTitle.value = '保存成功'
        resultDialogMessage.value = res
        showResultDialog.value = true
        cacheCurrentTestUsers()
        emit('config-saved', payload)
      } else {
        resultDialogTitle.value = '保存失败'
        resultDialogMessage.value = res
        showResultDialog.value = true
      }
    } else {
      resultDialogTitle.value = '保存成功'
      resultDialogMessage.value = '配置已保存'
      showResultDialog.value = true
      cacheCurrentTestUsers()
      emit('config-saved', payload)
    }
  } catch (err) {
    resultDialogTitle.value = '保存失败'
    resultDialogMessage.value = err.message
    showResultDialog.value = true
  } finally {
    saving.value = false
  }
}

// ================= 一键转移 =================
const confirmTransfer = async () => {
  if (!transferTargetNodeId.value) {
    showNotify({ type: 'warning', message: '请选择一个目标节点' })
    return
  }
  if (selectedUserIds.value.length === 0) {
    showNotify({ type: 'warning', message: '当前没有测试用户可转移' })
    return
  }

  try {
    const res = await request({
      url: '/manage/test/transfer',
      method: 'POST',
      data: {
        targetNodeId: transferTargetNodeId.value,
        userIds: [...selectedUserIds.value],
      },
    })
    if (typeof res === 'string') {
      resultDialogTitle.value = res.startsWith('✅') ? '转移成功' : '转移失败'
      resultDialogMessage.value = res
    } else {
      resultDialogTitle.value = '转移成功'
      resultDialogMessage.value = JSON.stringify(res)
    }
    showResultDialog.value = true
    // 刷新用户状态
    await refreshUserStatus()
  } catch (err) {
    resultDialogTitle.value = '转移失败'
    resultDialogMessage.value = err.message
    showResultDialog.value = true
  }
}

// ================= 监听已选用户变化，自动刷新状态 =================
watch(
  selectedUserIds,
  (newIds, oldIds) => {
    if (newIds.length > 0 && newIds.length !== oldIds?.length) {
      // 过滤出新增的ID
      const added = newIds.filter((id) => !oldIds?.includes(id))
      if (added.length > 0) {
        // 只查询新增用户的详情
        added.forEach((uid) => {
          uid = normalizeId(uid)
          const exists = selectedUsers.value.find((u) => getUserId(u) === uid)
          if (!exists) {
            selectedUsers.value.push({
              id: uid,
              userId: uid,
              nickName: uid.toString(),
              userStatusText: '',
              nodeId: '',
              status: -1,
            })
          }
        })
      }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.test-node-config {
  padding: 0;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-subtitle {
  font-size: 13px;
  color: #999;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

.empty-state-small {
  text-align: center;
  color: #999;
  padding: 20px 0;
  font-size: 13px;
}

/* ========== 节点选择 ========== */
.node-checkbox-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.node-checkbox-item:hover {
  border-color: #1989fa;
  background: #f0f7ff;
}

.node-checkbox-item.checked {
  border-color: #1989fa;
  background: #e8f4ff;
}

.node-label {
  font-size: 14px;
  color: #333;
}

/* ========== 用户面板 ========== */
.user-panel {
  display: flex;
  gap: 16px;
  min-height: 200px;
}

.user-column {
  flex: 1;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}

.column-label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 0 12px;
  border: 1px solid #e5e6eb;
}

.search-input {
  border: none !important;
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
}

/* 搜索结果 */
.search-results {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f5f9ff;
}

.search-result-item.selected {
  background-color: #e8f0ff;
}

.user-display {
  font-size: 14px;
  color: #333;
}

/* 已选用户 */
.selected-users {
  max-height: 300px;
  overflow-y: auto;
}

.selected-user-item {
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
}

.selected-user-item:last-child {
  margin-bottom: 0;
}

.user-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green {
  background: #07c160;
  box-shadow: 0 0 4px rgba(7, 193, 96, 0.5);
}

.dot-gray {
  background: #c0c4cc;
}

.dot-orange {
  background: #ff976a;
  box-shadow: 0 0 4px rgba(255, 151, 106, 0.5);
}

.remove-btn {
  cursor: pointer;
  margin-left: auto;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: #ff4d4f !important;
}

.user-status-row {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  padding-left: 18px;
  font-size: 12px;
}

.status-node {
  color: #999;
}

.status-text {
  font-weight: 500;
}

.text-green {
  color: #07c160;
}

.text-gray {
  color: #c0c4cc;
}

.text-orange {
  color: #ff976a;
}

/* 刷新状态按钮 */
.status-actions {
  margin-top: 12px;
  text-align: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1989fa;
  color: #1989fa;
}

/* ========== 操作按钮栏 ========== */
.action-bar {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 20px;
}

.primary-btn,
.danger-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn {
  background: #1989fa;
  color: #fff;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: #1677ff;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: #b0d4ff;
  box-shadow: none;
  cursor: not-allowed;
}

.transfer-btn {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.transfer-btn:hover:not(:disabled) {
  background: #fff5f5;
}

.transfer-btn:disabled {
  border-color: #e5e6eb;
  color: #ccc;
  cursor: not-allowed;
}

/* ========== 转移弹窗 ========== */
.transfer-node-list {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.transfer-radio {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.transfer-radio:last-child {
  border-bottom: none;
}

/* ========== 结果弹窗 ========== */
.result-content {
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}
</style>
