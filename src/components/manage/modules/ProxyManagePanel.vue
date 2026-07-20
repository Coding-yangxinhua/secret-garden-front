<template>
  <section class="manage-module">
    <ManageModuleHeader title="代理 IP 管理" description="查看代理池状态、Token 与代理 IP 列表。">
      <template #actions>
        <button type="button" class="manage-btn manage-btn-primary" :disabled="refreshing" @click="handleRefresh">
          {{ refreshing ? '刷新中...' : '手动刷新代理池' }}
        </button>
      </template>
    </ManageModuleHeader>

    <div class="manage-kpi-grid proxy-kpis">
      <div class="manage-kpi">
        <div class="manage-kpi-label">可用 IP 数量</div>
        <div class="manage-kpi-value">{{ proxyCount }}</div>
      </div>
      <div class="manage-kpi wide">
        <div class="manage-kpi-label">最后更新时间</div>
        <div class="manage-kpi-value small">{{ proxyLastUpdate || '-' }}</div>
      </div>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="Token 管理" description="更新代理服务使用的当前 Token。" />
      <div class="token-row">
        <div class="token-current">
          <span class="manage-label">当前 Token</span>
          <strong>{{ currentToken || '未设置' }}</strong>
        </div>
        <input v-model.trim="newToken" type="text" class="manage-input" placeholder="请输入新的 Token" />
        <button
          type="button"
          class="manage-btn manage-btn-primary"
          :disabled="tokenUpdating || !newToken"
          @click="handleUpdateToken"
        >
          {{ tokenUpdating ? '更新中...' : '更新 Token' }}
        </button>
      </div>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="代理 IP 列表" :description="proxyListDescription">
        <template #actions>
          <input
            v-model.trim="proxySearchKeyword"
            type="search"
            class="manage-input proxy-search"
            placeholder="搜索 IP / 端口 / 用户名"
          />
        </template>
      </ManageModuleHeader>

      <div v-if="filteredProxyList.length > 0" class="manage-table-wrap">
        <table class="manage-table desktop-only">
          <thead>
            <tr>
              <th>节点名称</th>
              <th>代理地址</th>
              <th>用户名</th>
              <th>到期时间</th>
              <th>今日流量</th>
              <th>总流量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(proxy, index) in filteredProxyList" :key="index">
              <td>{{ proxy.nodeName || '-' }}</td>
              <td>{{ proxy.ip }}:{{ proxy.port }}</td>
              <td>{{ proxy.username || '-' }}</td>
              <td>{{ formatEndTime(proxy.endTime) }}</td>
              <td>{{ formatBytes(proxy.flowUsedToday) }}</td>
              <td>{{ formatBytes(proxy.flowLimit) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="manage-card-list mobile-only">
          <article v-for="(proxy, index) in filteredProxyList" :key="index" class="manage-record-card">
            <div class="manage-record-title">{{ proxy.ip }}:{{ proxy.port }}</div>
            <div class="manage-record-meta">节点：{{ proxy.nodeName || '-' }}</div>
            <div class="manage-record-meta">用户名：{{ proxy.username || '-' }}</div>
            <div class="manage-record-meta">到期：{{ formatEndTime(proxy.endTime) }}</div>
            <div class="manage-record-meta">
              流量：{{ formatBytes(proxy.flowUsedToday) }} / {{ formatBytes(proxy.flowLimit) }}
            </div>
          </article>
        </div>
      </div>

      <ManageEmptyState v-else title="暂无代理 IP 数据" description="刷新代理池后会显示可用代理列表。" />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

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

const proxyListDescription = computed(() => {
  if (!proxyList.value.length) return ''
  if (!proxySearchKeyword.value) return `共 ${proxyList.value.length} 条记录`
  return `共 ${proxyList.value.length} 条，筛选后 ${filteredProxyList.value.length} 条`
})

const formatEndTime = (endTime) => {
  if (!endTime) return '-'
  const d = new Date(endTime * 1000)
  const diff = d.getTime() - Date.now()
  if (diff < 0) return '已过期'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return `${days}天 ${hours}小时后`
}

const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined) return '-'
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
    showNotify({ type: 'danger', message: '代理列表请求失败: ' + (err.message || err) })
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
    showNotify({ type: 'danger', message: 'Token 状态请求失败: ' + (err.message || err) })
  }
}

const handleUpdateToken = async () => {
  if (!newToken.value.trim()) {
    showNotify({ type: 'warning', message: '请输入新的 Token' })
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
      showNotify({ type: 'success', message: res.data?.message || 'Token 更新成功' })
    } else {
      showNotify({ type: 'danger', message: res.remark || 'Token 更新失败' })
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
    showNotify({ type: 'success', message: res.data || res.remark || '手动刷新请求已发送' })
    await refresh()
  } catch (err) {
    showNotify({ type: 'danger', message: '刷新请求失败: ' + (err.message || err) })
  } finally {
    refreshing.value = false
  }
}

const refresh = async () => {
  await Promise.all([getProxyList(), getTokenStatus()])
}

onMounted(refresh)
defineExpose({ refresh })
</script>

<style scoped>
.proxy-kpis {
  grid-template-columns: minmax(160px, 220px) minmax(280px, 420px);
}

.manage-kpi-value.small {
  font-size: 15px;
}

.token-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) auto;
  gap: 10px;
  align-items: end;
  min-width: 0;
}

.token-current {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.token-current strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--manage-text);
  font-size: 14px;
}

.proxy-search {
  width: 260px;
}

@media (max-width: 768px) {
  .proxy-kpis,
  .token-row {
    grid-template-columns: 1fr;
  }

  .proxy-search {
    width: 100%;
  }
}
</style>
