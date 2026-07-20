<template>
  <section class="manage-module">
    <ManageModuleHeader title="节点管理" description="查看节点运行状态、负载、在线用户与版本信息。" />

    <div class="node-summary-grid">
      <div class="node-stat-tile">
        <span>总节点</span>
        <strong>{{ stats.totalNodes }}</strong>
      </div>
      <div class="node-stat-tile">
        <span>在线</span>
        <strong>{{ stats.onlineNodes }}</strong>
      </div>
      <div class="node-stat-tile">
        <span>离线</span>
        <strong>{{ stats.offlineNodes }}</strong>
      </div>
      <div class="node-stat-tile">
        <span>用户</span>
        <strong>{{ stats.totalUsers }}</strong>
      </div>
      <div class="node-stat-tile">
        <span>CPU</span>
        <strong>{{ stats.totalCpuCores }}</strong>
      </div>
      <div class="node-stat-tile">
        <span>负载</span>
        <strong>{{ stats.avgLoad }}%</strong>
      </div>
    </div>

    <div class="manage-panel">
      <div class="manage-toolbar">
        <span class="manage-badge warning">最高负载：{{ stats.maxLoadNode }}</span>
        <span class="manage-badge">游戏分布：{{ stats.gameDistribute }}</span>
      </div>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="节点列表" :description="`共 ${nodeList.length} 个节点`" />

      <div v-if="nodeList.length > 0" class="node-card-grid">
        <article v-for="node in nodeList" :key="node.nodeId" class="node-card">
          <div class="node-card-head">
            <div class="node-title-wrap">
              <div class="node-title">节点 {{ node.nodeId }}</div>
              <div class="node-host" :title="node.hostAddress || '-'">{{ node.hostAddress || '-' }}</div>
            </div>
            <span
              class="manage-badge"
              :class="node.nodeStatus === 'RUN' ? 'success' : 'danger'"
            >
              {{ node.nodeStatus === 'RUN' ? '在线' : '离线' }}
            </span>
          </div>

          <div class="node-metric-grid">
            <div class="node-metric">
              <span>用户</span>
              <strong>{{ node.userCount || 0 }}</strong>
            </div>
            <div class="node-metric">
              <span>CPU</span>
              <strong>{{ node.cpuCores || 0 }}</strong>
            </div>
            <div class="node-metric">
              <span>负载</span>
              <strong>{{ ((node.loadRatio || 0) * 100).toFixed(1) }}%</strong>
            </div>
          </div>

          <div class="node-card-meta">
            <span>心跳：{{ node.lastHeartBeatTimeText || '-' }}</span>
            <span>
              版本
              <span
                class="manage-badge"
                :class="node.latestJarVersion === false ? 'warning' : 'success'"
              >
                {{ node.jarVersion == null ? '未知' : 'v' + node.jarVersion }}
              </span>
            </span>
          </div>

          <div v-if="expandedNodes.includes(node.nodeId)" class="node-users">
            <span v-for="uid in node.userIds" :key="uid" class="manage-badge">{{ uid }}</span>
            <span v-if="!node.userIds.length" class="manage-record-meta">暂无在线用户 ID</span>
          </div>

          <div class="node-card-actions">
            <button type="button" class="manage-btn manage-btn-ghost" @click="toggleExpand(node.nodeId)">
              {{ expandedNodes.includes(node.nodeId) ? '收起用户' : '查看用户' }}
            </button>
            <button type="button" class="manage-btn manage-btn-primary" @click="updateNode(node)">
              更新节点
            </button>
          </div>
        </article>
      </div>

      <ManageEmptyState v-else title="暂无节点数据" description="点击刷新后会重新拉取节点状态。" />
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

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
          .filter(Boolean)
      } else if (!Array.isArray(userIds)) {
        userIds = []
      }
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
  const sorted = [...list].sort((a, b) => (b.loadRatio || 0) - (a.loadRatio || 0))
  stats.maxLoadNode = sorted[0]
    ? `${sorted[0].nodeId} (${((sorted[0].loadRatio || 0) * 100).toFixed(1)}%)`
    : '无'
  const gameMap = {}
  list.forEach((item) => {
    ;(item.supportGameIds || []).forEach((gid) => {
      gameMap[gid] = (gameMap[gid] || 0) + (item.userCount || 0)
    })
  })
  stats.gameDistribute =
    Object.entries(gameMap)
      .map(([k, v]) => `游戏${k}:${v}人`)
      .join(' | ') || '无'
}

const refresh = async () => {
  try {
    const res = await request({ url: '/manage/status', method: 'GET' })
    if (res.code === 200 && res.data) {
      nodeList.value = processNodeData(res.data)
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '节点数据请求失败: ' + (err.message || err) })
  }
}

const updateNode = async (node) => {
  if (!node?.nodeId) return
  try {
    const res = await request({
      url: '/manage/node/update?nodeId=' + encodeURIComponent(node.nodeId),
      method: 'POST',
    })
    const message =
      res?.data ||
      res?.remark ||
      (res?.code === 200 ? `更新命令已发送至节点 ${node.nodeId}` : '操作失败')
    showNotify({ type: res?.code === 200 ? 'success' : 'danger', message })
  } catch (err) {
    showNotify({ type: 'danger', message: '请求失败: ' + (err.message || err) })
  }
}

const toggleExpand = (id) => {
  const idx = expandedNodes.value.indexOf(id)
  idx > -1 ? expandedNodes.value.splice(idx, 1) : expandedNodes.value.push(id)
}

watch(nodeList, () => computeStats(), { deep: true })
onMounted(refresh)
defineExpose({ refresh })
</script>

<style scoped>
.node-summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}

.node-stat-tile {
  min-width: 0;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border: 1px solid var(--manage-border);
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}

.node-stat-tile span,
.node-metric span {
  color: var(--manage-muted);
  font-size: 12px;
}

.node-stat-tile strong {
  color: var(--manage-text);
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.node-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  min-width: 0;
}

.node-card {
  min-width: 0;
  max-width: 100%;
  border: 1px solid var(--manage-border);
  border-radius: 8px;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
}

.node-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.node-title-wrap {
  min-width: 0;
}

.node-title {
  color: var(--manage-text);
  font-size: 14px;
  font-weight: 800;
}

.node-host {
  max-width: 180px;
  margin-top: 2px;
  overflow: hidden;
  color: var(--manage-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.node-metric {
  min-width: 0;
  padding: 7px 8px;
  border-radius: 7px;
  background: #f7faff;
}

.node-metric strong {
  display: block;
  margin-top: 3px;
  color: var(--manage-text);
  font-size: 15px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.node-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 9px;
  color: #435369;
  font-size: 11px;
}

.node-card-meta > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-users {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px solid var(--manage-border);
}

.node-card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
  min-width: 0;
}

@media (max-width: 768px) {
  .node-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .node-stat-tile {
    min-height: 42px;
    padding: 6px 7px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  .node-stat-tile span,
  .node-metric span {
    font-size: 10px;
  }

  .node-stat-tile strong {
    font-size: 15px;
  }

  .node-card-grid {
    grid-template-columns: repeat(2, minmax(0, calc((100vw - 28px) / 2)));
    gap: 6px;
  }

  .node-card {
    padding: 7px;
    border-radius: 7px;
  }

  .node-card-head {
    gap: 5px;
  }

  .node-title {
    font-size: 12px;
  }

  .node-host,
  .node-card-meta {
    font-size: 10px;
  }

  .node-host {
    max-width: 96px;
  }

  .node-metric-grid {
    grid-template-columns: 1fr;
    gap: 3px;
    margin-top: 7px;
  }

  .node-metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 5px;
    border-radius: 5px;
  }

  .node-metric strong {
    margin-top: 0;
    font-size: 12px;
  }

  .node-card-meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    margin-top: 6px;
  }

  .node-users {
    gap: 4px;
    margin-top: 6px;
    padding-top: 6px;
  }

  .node-card-actions {
    grid-template-columns: 1fr;
    gap: 4px;
    margin-top: 7px;
  }

  .node-card-actions .manage-btn {
    min-height: 28px;
    padding: 0 6px;
    font-size: 11px;
  }
}

@media (max-width: 340px) {
  .node-card-grid {
    grid-template-columns: 1fr;
  }

  .node-card-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
