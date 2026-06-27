<template>
  <div class="manage-page">
    <!-- 页面头部 + 模块切换 -->
    <div class="page-header">
      <h2 class="page-title">服务管理中心</h2>
      <div class="tab-group">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'node' }"
          @click="switchTab('node')"
        >
          节点管理
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'config' }"
          @click="switchTab('config')"
        >
          配置管理
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'code' }"
          @click="switchTab('code')"
        >
          兑换码生成
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'grant' }"
          @click="switchTab('grant')"
        >
          时长发放
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'testNode' }"
          @click="switchTab('testNode')"
        >
          测试节点配置
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'proxy' }"
          @click="switchTab('proxy')"
        >
          代理IP管理
        </button>
      </div>
      <div class="header-actions">
        <button class="manage-link-btn" @click="goToFeedbackManage">反馈管理</button>
        <button class="refresh-btn" @click="refreshData">刷新数据</button>
      </div>
    </div>

    <!-- ========== 模块一：节点管理 ========== -->
    <div v-if="activeTab === 'node'">
      <div class="card summary-card">
        <div class="card-header"><span class="card-title">集群汇总数据</span></div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="item-label">总节点数</div>
            <div class="item-value">{{ stats.totalNodes }}</div>
          </div>
          <div class="summary-item status-online">
            <div class="item-label">在线节点</div>
            <div class="item-value">{{ stats.onlineNodes }}</div>
          </div>
          <div class="summary-item status-offline">
            <div class="item-label">离线节点</div>
            <div class="item-value">{{ stats.offlineNodes }}</div>
          </div>
          <div class="summary-item status-primary">
            <div class="item-label">总在线用户</div>
            <div class="item-value">{{ stats.totalUsers }}</div>
          </div>
          <div class="summary-item status-warning">
            <div class="item-label">CPU总核心</div>
            <div class="item-value">{{ stats.totalCpuCores }}</div>
          </div>
          <div class="summary-item status-purple">
            <div class="item-label">集群平均负载</div>
            <div class="item-value">{{ stats.avgLoad }}%</div>
          </div>
        </div>
        <div class="summary-extra">
          <div class="extra-line">🔥 最高负载：{{ stats.maxLoadNode }}</div>
          <div class="extra-line">🎮 游戏分布：{{ stats.gameDistribute }}</div>
        </div>
      </div>

      <div class="node-list">
        <div class="card node-card" v-for="node in nodeList" :key="node.nodeId">
          <div class="node-header" @click="toggleExpand(node.nodeId)">
            <div class="node-info-left">
              <span
                class="status-tag"
                :class="node.nodeStatus === 'RUN' ? 'tag-online' : 'tag-offline'"
              >
                {{ node.nodeStatus === 'RUN' ? '在线' : '离线' }}
              </span>
              <span class="node-name">{{ node.nodeId }}</span>
              <!-- 版本显示 -->
              <span
                class="version-badge"
                :class="
                  node.latestJarVersion === true
                    ? 'ver-latest'
                    : node.latestJarVersion === false
                      ? 'ver-old'
                      : 'ver-unknown'
                "
              >
                {{ node.jarVersion == null ? '未知' : 'v' + node.jarVersion }}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px">
              <button
                v-if="node.latestJarVersion === false"
                class="update-btn"
                @click.stop="updateNode(node)"
              >
                更新
              </button>
              <span class="arrow">{{ expandedNodes.includes(node.nodeId) ? '▲' : '▼' }}</span>
            </div>
          </div>
          <div class="node-base-info">
            <span>用户数：{{ node.userCount }}</span>
            <span>CPU：{{ node.cpuCores }} 核</span>
            <span>负载：{{ (node.loadRatio * 100).toFixed(1) }}%</span>
          </div>
          <div class="node-desc">
            <span>最后心跳：{{ node.lastHeartBeatTimeText }}</span>
            <span>服务地址：{{ node.hostAddress }}</span>
          </div>
          <div class="user-collapse" v-if="expandedNodes.includes(node.nodeId)">
            <div class="collapse-title">用户ID列表</div>
            <div class="user-id-list">
              <span class="user-id" v-for="uid in node.userIds" :key="uid">{{ uid }}</span>
            </div>
          </div>

          <!-- 节点版本信息与操作 -->
          <div class="node-version-info">
            <div class="version-badge">
              V{{ node.jarVersion }}
              <span v-if="node.latestJarVersion" class="latest-tag">最新</span>
            </div>
            <button class="update-btn" @click="updateNode(node)">更新节点</button>
          </div>
        </div>
        <div class="empty-state" v-if="nodeList.length === 0">暂无节点数据</div>
      </div>
    </div>

    <!-- ========== 模块二：配置管理 ========== -->
    <div v-if="activeTab === 'config'" class="config-container">
      <div class="card">
        <div class="card-header flex-between">
          <span class="card-title">全局配置列表</span>
          <button class="add-btn" @click="openAddModal">+ 新增配置</button>
        </div>
        <div class="config-table">
          <div class="config-header">
            <div class="th">模块标识</div>
            <div class="th">当前版本</div>
            <div class="th">更新时间</div>
            <div class="th">操作</div>
          </div>
          <div class="config-row" v-for="config in configList" :key="config.moduleKey">
            <div class="td">{{ config.moduleKey }}</div>
            <div class="td version-tag">V{{ config.version }}</div>
            <div class="td">{{ config.updateTime }}</div>
            <div class="td">
              <button class="edit-btn" @click="openEditModal(config)">编辑</button>
            </div>
          </div>
          <div class="empty-state" v-if="configList.length === 0">暂无配置数据，点击右上角新增</div>
        </div>
      </div>
    </div>

    <!-- ========== 模块三：兑换码生成（子组件） ========== -->
    <div v-if="activeTab === 'code'">
      <CardCodeGenerator ref="cardCodeRef" />
    </div>

    <!-- ========== 模块四：时长发放（优化版） ========== -->
    <div v-if="activeTab === 'grant'" class="grant-container">
      <div class="card grant-card">
        <div class="card-header"><span class="card-title">✨ 时长发放配置</span></div>

        <div class="grant-form">
          <div class="form-row">
            <label class="form-label">发放对象</label>
            <select v-model="grantForm.type" class="select" @change="onTypeChange">
              <option :value="0">系统用户</option>
              <option :value="1">游戏用户</option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label">变动类型</label>
            <select v-model="grantForm.changeType" class="select">
              <option value="COMPENSATE">维护补偿</option>
              <option value="GIFT">活动赠送</option>
              <option value="SYSTEM_ADD">系统增加</option>
            </select>
          </div>

          <div class="form-row">
            <label class="form-label">发放小时数</label>
            <input
              v-model.number="grantForm.hours"
              type="number"
              class="input"
              min="1"
              placeholder="小时"
            />
          </div>

          <div class="form-row" style="grid-column: span 2">
            <label class="form-label">来源描述</label>
            <input
              v-model="grantForm.sourceDesc"
              type="text"
              class="input"
              placeholder="例如：五一活动奖励"
            />
          </div>
        </div>

        <div class="user-selection-area">
          <div class="area-header">
            <span class="area-title">选择接收用户</span>
            <van-checkbox
              v-model="isAllUsers"
              @change="onAllUsersChange"
              shape="square"
              class="all-checkbox"
            >
              所有人 (全服)
            </van-checkbox>
          </div>

          <template v-if="!isAllUsers">
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
            <div class="user-list" v-if="userOptions.length > 0">
              <div
                class="user-item"
                :class="{ selected: grantForm.ids.includes(user.id) }"
                v-for="user in userOptions"
                :key="user.id"
                @click="toggleUser(user)"
              >
                <van-checkbox
                  :model-value="grantForm.ids.includes(user.id)"
                  shape="square"
                  @click.stop
                />
                <div class="user-info">
                  <span class="user-id-text">ID:{{ user.id }}</span>
                  <span class="user-name-text">{{ user.nickName || user.userName }}</span>
                </div>
              </div>
            </div>
            <div v-else-if="searchKeyword && !searching" class="empty-state">暂无匹配用户</div>
          </template>

          <!-- 已选用户标签 -->
          <div class="selected-tags" v-if="!isAllUsers && grantForm.ids.length > 0">
            <div class="tags-header">
              <span
                >已选择 <strong>{{ grantForm.ids.length }}</strong> 名用户</span
              >
              <button class="clear-btn" @click="grantForm.ids = []">清空</button>
            </div>
            <div class="tags-list">
              <span class="user-tag" v-for="id in grantForm.ids" :key="id">
                {{ getUserNickName(id) }}
                <van-icon name="close" size="12" color="#999" @click.stop="removeUser(id)" />
              </span>
            </div>
          </div>
        </div>

        <div class="grant-action">
          <button class="grant-btn" @click="submitGrant" :disabled="grantLoading">
            <van-loading v-if="grantLoading" size="18" color="#fff" style="margin-right: 8px" />
            {{ grantLoading ? '发放中...' : '确认发放' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========== 模块五：测试节点配置 ========== -->
    <div v-if="activeTab === 'testNode'">
      <TestNodeConfig />
    </div>

    <!-- ========== 模块六：代理IP管理 ========== -->
    <div v-if="activeTab === 'proxy'" class="proxy-container">
      <!-- 1. 代理池概况卡片 -->
      <div class="card proxy-summary-card">
        <div class="card-header"><span class="card-title">🌐 代理池概况</span></div>
        <div class="summary-grid">
          <div class="summary-item status-primary">
            <div class="item-label">可用IP数量</div>
            <div class="item-value">{{ proxyCount }}</div>
          </div>
          <div class="summary-item">
            <div class="item-label">最后更新时间</div>
            <div class="item-value" style="font-size: 14px">{{ proxyLastUpdate || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- 2. Token管理卡片 -->
      <div class="card token-card">
        <div class="card-header"><span class="card-title">🔑 Token 管理</span></div>
        <div class="token-body">
          <div class="token-display">
            <span class="token-label">当前Token：</span>
            <span class="token-value">{{ currentToken || '未设置' }}</span>
          </div>
          <div class="token-update-row">
            <input
              v-model="newToken"
              type="text"
              class="input token-input"
              placeholder="请输入新的Token"
            />
            <button
              class="update-btn"
              :disabled="tokenUpdating || !newToken.trim()"
              @click="handleUpdateToken"
            >
              <van-loading v-if="tokenUpdating" size="14" color="#fff" style="margin-right: 4px" />
              {{ tokenUpdating ? '更新中...' : '更新Token' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. 代理IP列表卡片 -->
      <div class="card proxy-list-card">
        <div class="card-header flex-between">
          <span class="card-title">📋 代理IP列表</span>
          <div class="search-box" style="width: 240px; margin-bottom: 0">
            <van-icon name="search" size="16" color="#999" />
            <input
              v-model="proxySearchKeyword"
              type="text"
              class="input search-input"
              placeholder="搜索IP/端口/用户名..."
            />
          </div>
        </div>
        <div class="proxy-table">
          <div class="proxy-header">
            <div class="th th-node">节点名称</div>
            <div class="th th-key">代理地址</div>
            <div class="th th-user">用户名</div>
            <div class="th th-expire">到期时间</div>
            <div class="th th-flow">今日流量</div>
            <div class="th th-flow">总流量</div>
          </div>
          <div class="proxy-row" v-for="(proxy, index) in filteredProxyList" :key="index">
            <div class="td td-node">{{ proxy.nodeName || '-' }}</div>
            <div class="td td-key">{{ proxy.ip }}:{{ proxy.port }}</div>
            <div class="td td-user">{{ proxy.username }}</div>
            <div class="td td-expire">{{ formatEndTime(proxy.endTime) }}</div>
            <div class="td td-flow">{{ formatBytes(proxy.flowUsedToday) }}</div>
            <div class="td td-flow">{{ formatBytes(proxy.flowLimit) }}</div>
          </div>
          <div class="empty-state" v-if="filteredProxyList.length === 0">暂无代理IP数据</div>
        </div>
        <div class="proxy-count-footer" v-if="proxyList.length > 0">
          共 {{ proxyList.length }} 条记录
          <span v-if="proxySearchKeyword">，筛选后 {{ filteredProxyList.length }} 条</span>
        </div>
      </div>

      <!-- 4. 操作栏 -->
      <div class="card action-bar-card">
        <div class="action-bar">
          <button class="proxy-refresh-btn" :disabled="refreshing" @click="handleRefresh">
            <van-loading v-if="refreshing" size="16" color="#fff" style="margin-right: 6px" />
            {{ refreshing ? '刷新中...' : '🔄 手动刷新代理池' }}
          </button>
          <button class="manage-link-btn" @click="loadProxyData">刷新数据</button>
        </div>
      </div>
    </div>

    <!-- ========== 新增/编辑配置弹窗 ========== -->
    <div class="modal-mask" v-show="showEditModal" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalType === 'add' ? '新增全局配置' : '编辑全局配置' }}</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label>模块标识</label>
            <input
              v-model="editForm.moduleKey"
              type="text"
              class="input"
              :readonly="modalType === 'edit'"
              placeholder="请输入模块标识，例如：ds.item"
            />
          </div>
          <div class="form-item">
            <label>配置内容（JSON）</label>
            <textarea
              v-model="editForm.configData"
              rows="15"
              class="config-textarea"
              placeholder="请输入完整JSON配置内容"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeEditModal">取消</button>
          <button class="submit-btn" @click="submitUpdateConfig">
            {{ modalType === 'add' ? '确认新增' : '保存更新' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { Checkbox as VanCheckbox, Loading as VanLoading, Icon as VanIcon, showNotify } from 'vant'
import TestNodeConfig from '@/components/TestNodeConfig.vue'
import CardCodeGenerator from '@/components/CardCodeGenerator.vue'

// ================= 全局切换 =================
const router = useRouter()
const activeTab = ref('node')
const cardCodeRef = ref(null)

const goToFeedbackManage = () => {
  router.push({ name: 'manageFeedback' })
}
const switchTab = (tab) => {
  activeTab.value = tab
  refreshData()
}

// ================= 节点管理 =================
const nodeList = ref([])
const expandedNodes = ref([])
const stats = reactive({
  totalNodes: 0,
  onlineNodes: 0,
  offlineNodes: 0,
  totalUsers: 0,
  totalCpuCores: 0,
  avgLoad: 0,
  maxLoadNode: '无',
  gameDistribute: '无',
})

const processNodeData = (data) => {
  if (!Array.isArray(data)) return []
  return data
    .map((node) => {
      let userIds = node.userIds
      if (typeof userIds === 'string') {
        userIds = userIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id)
      } else if (!Array.isArray(userIds)) {
        userIds = []
      }
      // 规范化版本字段（后端可能缺失）
      const jarVersion = typeof node.jarVersion !== 'undefined' ? node.jarVersion : null
      const latestJarVersion =
        typeof node.latestJarVersion === 'boolean' ? node.latestJarVersion : null
      return { ...node, userIds, jarVersion, latestJarVersion }
    })
    .sort((a, b) => Number(a.nodeId) - Number(b.nodeId))
}

const computeStats = () => {
  const list = nodeList.value || []
  stats.totalNodes = list.length
  stats.onlineNodes = list.filter((i) => i.nodeStatus === 'RUN').length
  stats.offlineNodes = stats.totalNodes - stats.onlineNodes
  stats.totalUsers = list.reduce((s, i) => s + (i.userCount || 0), 0)
  stats.totalCpuCores = list.reduce((s, i) => s + (i.cpuCores || 0), 0)
  const totalLoad = list.reduce((s, i) => s + (i.loadRatio || 0), 0)
  stats.avgLoad = list.length ? ((totalLoad / list.length) * 100).toFixed(1) : 0
  const sorted = [...list].sort((a, b) => b.loadRatio - a.loadRatio)
  stats.maxLoadNode = sorted[0]
    ? `${sorted[0].nodeId} (${(sorted[0].loadRatio * 100).toFixed(1)}%)`
    : '无'
  const gameMap = {}
  list.forEach((item) => {
    item.supportGameIds.forEach((gid) => {
      gameMap[gid] = (gameMap[gid] || 0) + item.userCount
    })
  })
  stats.gameDistribute =
    Object.entries(gameMap)
      .map(([k, v]) => `游戏${k}:${v}人`)
      .join(' | ') || '无'
}

const getNodeData = async () => {
  try {
    const res = await request({ url: '/manage/status', method: 'GET' })
    if (res.code === 200 && res.data) {
      nodeList.value = processNodeData(res.data)
    }
  } catch (err) {
    console.error('节点数据请求失败：', err)
  }
}

// 新增：触发节点更新（向后端发送 update 命令）
const updateNode = async (node) => {
  if (!node || !node.nodeId) return
  try {
    const res = await request({
      url: '/manage/node/update?nodeId=' + encodeURIComponent(node.nodeId),
      method: 'POST',
    })
    // 后端可能直接返回字符串或结构体，优先显示 data 或 remark
    const message =
      (res && (res.data || res.remark)) ||
      (res && res.code === 200 ? `✅ 更新命令已发送至节点 ${node.nodeId}` : '❌ 操作失败')
    showNotify({ type: res && res.code === 200 ? 'success' : 'danger', message })
  } catch (err) {
    showNotify({
      type: 'danger',
      message: '❌ 请求失败: ' + (err && err.message ? err.message : err),
    })
  }
}

const toggleExpand = (id) => {
  const idx = expandedNodes.value.indexOf(id)
  idx > -1 ? expandedNodes.value.splice(idx, 1) : expandedNodes.value.push(id)
}

// ================= 配置管理 =================
const configList = ref([])
const showEditModal = ref(false)
const modalType = ref('add')
const editForm = ref({ moduleKey: '', configData: '' })

const getConfigData = async () => {
  try {
    const res = await request({ url: '/manage/config/list', method: 'GET' })
    if (res.code === 200 && res.data) configList.value = res.data
  } catch (err) {
    console.error('配置列表请求失败：', err)
  }
}

const openAddModal = () => {
  modalType.value = 'add'
  editForm.value = { moduleKey: '', configData: '' }
  showEditModal.value = true
}

const openEditModal = (config) => {
  modalType.value = 'edit'
  editForm.value = { ...config }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = { moduleKey: '', configData: '' }
}

const submitUpdateConfig = async () => {
  try {
    const { id, moduleKey, configData, version } = editForm.value
    if (!moduleKey || !configData) {
      alert('模块标识和配置内容不能为空！')
      return
    }
    const res = await request({
      url: '/manage/config/update',
      method: 'POST',
      data: { id, moduleKey, configData, version },
    })
    alert(res)
    closeEditModal()
    getConfigData()
  } catch (err) {
    alert('操作失败：' + err.message)
  }
}

// ================= 时长发放（优化版） =================
const grantForm = reactive({
  type: 0,
  ids: [],
  hours: 1,
  changeType: 'COMPENSATE',
  sourceDesc: '',
})
const isAllUsers = ref(false)
const searchKeyword = ref('')
const userOptions = ref([])
const searching = ref(false)
const grantLoading = ref(false)

let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const fetchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    userOptions.value = []
    return
  }
  searching.value = true
  try {
    const res = await request({
      url: '/manage/user/search',
      method: 'GET',
      params: {
        type: grantForm.type,
        nickName: searchKeyword.value.trim(),
      },
    })
    if (res.code === 200) {
      userOptions.value = res.data || []
    } else {
      alert('搜索失败：' + (res.remark || '未知错误'))
    }
  } catch (err) {
    alert('搜索请求失败：' + err.message)
  } finally {
    searching.value = false
  }
}

const onTypeChange = () => {
  grantForm.ids = []
  userOptions.value = []
  searchKeyword.value = ''
  isAllUsers.value = false
}

const onAllUsersChange = (checked) => {
  if (checked) {
    grantForm.ids = []
    searchKeyword.value = ''
    userOptions.value = []
  }
}

const toggleUser = (user) => {
  const index = grantForm.ids.findIndex((id) => id === user.id)
  if (index > -1) {
    grantForm.ids.splice(index, 1)
  } else {
    grantForm.ids.push(user.id)
    // 缓存用户信息以便标签显示
    if (!userOptions.value.find((u) => u.id === user.id)) {
      userOptions.value.push(user)
    }
  }
}

const removeUser = (id) => {
  const index = grantForm.ids.indexOf(id)
  if (index > -1) grantForm.ids.splice(index, 1)
}

const getUserNickName = (id) => {
  const user = userOptions.value.find((u) => u.id === id)
  return user ? user.nickName || user.userName : id
}

const submitGrant = async () => {
  if (grantForm.hours <= 0) {
    alert('请输入有效的小时数')
    return
  }
  if (!grantForm.sourceDesc.trim()) {
    alert('请填写来源描述')
    return
  }
  if (!isAllUsers.value && grantForm.ids.length === 0) {
    alert('请至少选择一个用户，或勾选“所有人”')
    return
  }

  grantLoading.value = true
  try {
    const payload = {
      type: grantForm.type,
      hours: grantForm.hours,
      changeType: grantForm.changeType,
      sourceDesc: grantForm.sourceDesc.trim(),
      ids: isAllUsers.value ? [] : grantForm.ids,
    }
    const res = await request({
      url: '/manage/time/grant',
      method: 'POST',
      data: payload,
    })
    if (res.code === 200) {
      alert('发放成功')
      grantForm.ids = []
      isAllUsers.value = false
      searchKeyword.value = ''
      userOptions.value = []
      grantForm.hours = 1
      grantForm.sourceDesc = ''
    } else {
      alert('发放失败：' + (res.remark || '未知错误'))
    }
  } catch (err) {
    alert('发放请求失败：' + err.message)
  } finally {
    grantLoading.value = false
  }
}

// ================= 代理IP管理 =================
const proxyList = ref([])
const proxyCount = ref(0)
const proxyLastUpdate = ref('')
const currentToken = ref('')
const newToken = ref('')
const proxySearchKeyword = ref('')
const tokenUpdating = ref(false)
const refreshing = ref(false)

const filteredProxyList = computed(() => {
  if (!proxySearchKeyword.value.trim()) return proxyList.value
  const keyword = proxySearchKeyword.value.trim().toLowerCase()
  return proxyList.value.filter(
    (p) =>
      (p.ip && p.ip.toLowerCase().includes(keyword)) ||
      (p.port && String(p.port).includes(keyword)) ||
      (p.username && p.username.toLowerCase().includes(keyword)) ||
      (p.nodeName && p.nodeName.toLowerCase().includes(keyword)) ||
      `${p.ip}:${p.port}`.includes(keyword),
  )
})

const formatEndTime = (endTime) => {
  if (!endTime) return '—'
  const d = new Date(endTime * 1000)
  const now = Date.now()
  const diff = d.getTime() - now
  if (diff < 0) return '已过期'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return `${days}天${hours}小时后`
}

const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i]
}

const getProxyList = async () => {
  try {
    const res = await request({ url: 'api/proxy/list', method: 'GET' })
    if (res.code === 200 && Array.isArray(res.data)) {
      proxyList.value = res.data
      proxyLastUpdate.value = new Date().toLocaleString()
    }
  } catch (err) {
    console.error('代理列表请求失败：', err)
  }
}

const getProxyCount = async () => {
  try {
    const res = await request({ url: '/proxy/count', method: 'GET' })
    if (res.code === 200 && typeof res.data === 'number') {
      proxyCount.value = res.data
    }
  } catch (err) {
    console.error('代理数量请求失败：', err)
  }
}

const getTokenStatus = async () => {
  try {
    const res = await request({ url: '/proxy/token-status', method: 'GET' })
    if (res.code === 200 && res.data) {
      currentToken.value = res.data.currentToken || ''
      if (res.data.proxyCount !== undefined) {
        proxyCount.value = res.data.proxyCount
      }
    }
  } catch (err) {
    console.error('Token状态请求失败：', err)
  }
}

const handleUpdateToken = async () => {
  if (!newToken.value.trim()) {
    showNotify({ type: 'warning', message: '请输入新的Token' })
    return
  }
  tokenUpdating.value = true
  try {
    const res = await request({
      url: '/proxy/update-token',
      method: 'POST',
      data: { token: newToken.value.trim() },
    })
    if (res.code === 200) {
      if (res.data) {
        currentToken.value = res.data.currentToken || ''
        if (res.data.proxyCount !== undefined) {
          proxyCount.value = res.data.proxyCount
        }
      }
      newToken.value = ''
      showNotify({ type: 'success', message: res.data?.message || 'Token更新成功' })
    } else {
      showNotify({ type: 'danger', message: res.remark || 'Token更新失败' })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '请求失败: ' + (err.message || err) })
  } finally {
    tokenUpdating.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    const res = await request({ url: '/proxy/refresh', method: 'POST' })
    const message = res.data || res.remark || '手动刷新请求已发送'
    showNotify({ type: 'success', message })
    // 刷新后重新加载数据
    await Promise.all([getProxyList(), getProxyCount(), getTokenStatus()])
  } catch (err) {
    showNotify({ type: 'danger', message: '刷新请求失败: ' + (err.message || err) })
  } finally {
    refreshing.value = false
  }
}

const loadProxyData = async () => {
  await Promise.all([getProxyList(), getTokenStatus()])
}

// ================= 统一刷新 =================
const refreshData = () => {
  if (activeTab.value === 'node') getNodeData()
  if (activeTab.value === 'config') getConfigData()
  if (activeTab.value === 'code' && cardCodeRef.value) {
    cardCodeRef.value.fetchStats()
  }
  if (activeTab.value === 'proxy') loadProxyData()
  // grant/testNode 不需要统一刷新动作
}

// ================= 生命周期 =================
watch(nodeList, () => computeStats(), { deep: true })
onMounted(() => refreshData())
</script>

<style scoped>
/* ========== 全局样式 ========== */
.manage-page {
  padding: 12px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.page-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}
.refresh-btn {
  background: #1989fa;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.refresh-btn:active {
  background: #1677ff;
}
.manage-link-btn {
  background: #07c160;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.manage-link-btn:hover {
  background: #06ad56;
}

.tab-group {
  display: flex;
  gap: 8px;
}
.tab-btn {
  padding: 6px 16px;
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #1989fa;
  color: #fff;
  border-color: #1989fa;
}
.tab-btn:hover {
  border-color: #1989fa;
}

/* ========== 节点管理样式 ========== */
.summary-card {
  overflow: hidden;
}
.card-header {
  margin-bottom: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.summary-item {
  flex: 1;
  min-width: 30%;
  text-align: center;
  padding: 10px 8px;
  background: #f7f8fa;
  border-radius: 8px;
}
.item-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.item-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.status-online .item-value {
  color: #07c160;
}
.status-offline .item-value {
  color: #ff4d4f;
}
.status-primary .item-value {
  color: #1989fa;
}
.status-warning .item-value {
  color: #ff976a;
}
.status-purple .item-value {
  color: #a766ff;
}
.summary-extra {
  padding-top: 12px;
  border-top: 1px solid #f2f2f2;
}
.extra-line {
  font-size: 13px;
  color: #666;
  line-height: 24px;
}
.node-card {
  cursor: default;
}
.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}
.node-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}
.tag-online {
  background: #07c160;
}
.tag-offline {
  background: #ff4d4f;
}
.node-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.arrow {
  color: #999;
  font-size: 12px;
}
.node-base-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
.node-desc {
  font-size: 12px;
  color: #999;
  line-height: 20px;
}
.user-collapse {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}
.collapse-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.user-id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.user-id {
  padding: 4px 8px;
  background: #f2f3f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

/* ========== 配置管理样式 ========== */
.config-container {
  margin-top: 8px;
}
.config-table {
  width: 100%;
}
.config-header {
  display: flex;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  font-weight: 500;
  color: #666;
  font-size: 14px;
}
.config-row {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f2f3f5;
  align-items: center;
  font-size: 14px;
}
.config-row:last-child {
  border-bottom: none;
}
.th,
.td {
  flex: 1;
  text-align: left;
}
.td:last-child,
.th:last-child {
  text-align: center;
}
.version-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e8f3ff;
  color: #1989fa;
  border-radius: 4px;
}
.add-btn {
  padding: 6px 12px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.edit-btn {
  padding: 4px 12px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* ========== 弹窗样式 ========== */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  width: 700px;
  background: #fff;
  border-radius: 12px;
  max-height: 80vh;
  overflow: hidden;
}
.modal-header {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}
.modal-body {
  padding: 16px;
}
.form-item {
  margin-bottom: 16px;
}
.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.input[readonly] {
  background: #f7f8fa;
}
.config-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  resize: none;
  font-family: monospace;
}
.modal-footer {
  padding: 16px;
  border-top: 1px solid #f2f3f5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.cancel-btn {
  padding: 6px 16px;
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.submit-btn {
  padding: 6px 16px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* ========== 时长发放样式（精致优化） ========== */
.grant-container {
  margin-top: 8px;
}
.grant-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.grant-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23999' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
.select:focus {
  border-color: #1989fa;
  outline: none;
}

.user-selection-area {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fb;
  border-radius: 12px;
}
.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.area-title {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}
.all-checkbox :deep(.van-checkbox__label) {
  color: #333;
  font-size: 14px;
}

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
}
.search-input:focus {
  outline: none;
}

.user-list {
  max-height: 220px;
  overflow-y: auto;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}
.user-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.user-item:last-child {
  border-bottom: none;
}
.user-item:hover {
  background-color: #f5f9ff;
}
.user-item.selected {
  background-color: #e8f0ff;
}
.user-item :deep(.van-checkbox) {
  margin-right: 4px;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.user-id-text {
  font-size: 12px;
  color: #888;
}
.user-name-text {
  font-size: 14px;
  color: #333;
  margin-top: 2px;
}

/* 已选标签区域 */
.selected-tags {
  margin-top: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}
.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}
.tags-header strong {
  color: #1989fa;
}
.clear-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.user-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #ecf5ff;
  border: 1px solid #c6e2ff;
  border-radius: 20px;
  font-size: 13px;
  color: #333;
}
.user-tag .van-icon {
  cursor: pointer;
}

.grant-action {
  text-align: right;
  margin-top: 12px;
}
.grant-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}
.grant-btn:hover:not(:disabled) {
  background: #1677ff;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  transform: translateY(-1px);
}
.grant-btn:disabled {
  background: #b0d4ff;
  box-shadow: none;
  cursor: not-allowed;
}

/* ========== 节点版本信息样式 ========== */
.node-version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.version-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #e8f3ff;
  color: #1989fa;
  border-radius: 12px;
  font-size: 12px;
}
.latest-tag {
  margin-left: 4px;
  padding: 2px 6px;
  background: #07c160;
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
}
.update-btn {
  padding: 6px 12px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 12px;
}
.update-btn:hover {
  background: #1677ff;
}

/* ========== 代理IP管理样式 ========== */
.proxy-container {
  margin-top: 8px;
}
.proxy-summary-card .summary-grid {
  display: flex;
  gap: 16px;
}
.proxy-summary-card .summary-item {
  min-width: 200px;
}
.token-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.token-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 14px;
}
.token-label {
  color: #666;
  white-space: nowrap;
}
.token-value {
  color: #333;
  font-family: monospace;
  font-size: 15px;
  letter-spacing: 1px;
}
.token-update-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.token-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: monospace;
}
.token-input:focus {
  border-color: #1989fa;
}
.token-card .update-btn {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 14px;
  margin-left: 0;
}
.proxy-table {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.proxy-header {
  display: flex;
  padding: 12px;
  background: #f7f8fa;
  font-weight: 500;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}
.proxy-row {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #333;
  transition: background 0.15s;
}
.proxy-row:last-child {
  border-bottom: none;
}
.proxy-row:hover {
  background: #fafafa;
}
.proxy-table .th,
.proxy-table .td {
  text-align: left;
}
.proxy-table .th-node,
.proxy-table .td-node {
  flex: 0 0 120px;
}
.proxy-table .th-key,
.proxy-table .td-key {
  flex: 1 1 140px;
  font-family: monospace;
  font-size: 12px;
}
.proxy-table .th-user,
.proxy-table .td-user {
  flex: 0 0 80px;
}
.proxy-table .th-expire,
.proxy-table .td-expire {
  flex: 0 0 100px;
  font-size: 12px;
}
.proxy-table .th-flow,
.proxy-table .td-flow {
  flex: 0 0 72px;
  font-size: 12px;
}
.proxy-count-footer {
  margin-top: 10px;
  padding: 8px 4px;
  font-size: 13px;
  color: #999;
  text-align: right;
}
.action-bar-card .action-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.proxy-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background: #ff976a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.proxy-refresh-btn:hover:not(:disabled) {
  background: #ff7d4a;
}
.proxy-refresh-btn:disabled {
  background: #ffd4be;
  cursor: not-allowed;
}
.proxy-list-card .card-header {
  margin-bottom: 12px;
}
.proxy-list-card .search-box {
  margin-bottom: 0;
  height: 36px;
}
</style>
