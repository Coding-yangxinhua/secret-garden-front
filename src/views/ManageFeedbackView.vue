<template>
  <div class="manage-feedback-page">
    <div class="page-header">
      <h2 class="page-title">反馈管理</h2>
      <div class="tab-group">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          反馈列表
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'disabled' }"
          @click="activeTab = 'disabled'"
        >
          禁用功能
        </button>
      </div>
      <button class="refresh-btn" @click="refreshData">刷新数据</button>
    </div>

    <!-- ========== Tab 1: 反馈列表 ========== -->
    <div v-if="activeTab === 'list'" class="feedback-list-section">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label>类型</label>
          <select v-model="filter.type" class="filter-select" @change="onFilterChange">
            <option :value="0">全部</option>
            <option :value="1">优化建议</option>
            <option :value="2">Bug反馈</option>
          </select>
        </div>
        <div class="filter-item">
          <label>状态</label>
          <select v-model="filter.status" class="filter-select" @change="onFilterChange">
            <option :value="-1">全部</option>
            <option :value="0">待处理</option>
            <option :value="1">已处理</option>
            <option :value="2">已忽略</option>
          </select>
        </div>
        <div class="filter-item">
          <label>用户ID</label>
          <input
            v-model.number="filter.userId"
            type="number"
            class="filter-input"
            placeholder="按用户ID筛选"
            @change="onFilterChange"
          />
        </div>
      </div>

      <!-- 表格 -->
      <div class="card">
        <div class="table-wrapper">
          <table class="feedback-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>类型</th>
                <th>提交用户</th>
                <th>内容摘要</th>
                <th>关联功能</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in listData" :key="item.id">
                <td>{{ item.id }}</td>
                <td>
                  <span
                    class="type-tag"
                    :class="item.type === 1 ? 'tag-suggest' : 'tag-bug'"
                  >
                    {{ item.type === 1 ? '优化建议' : 'Bug反馈' }}
                  </span>
                </td>
                <td>
                  <span class="user-id-link" @click="filter.userId = item.systemUserId; onFilterChange()">
                    {{ item.systemUserId }}
                  </span>
                </td>
                <td class="td-content" :title="item.content">{{ truncate(item.content, 40) }}</td>
                <td>
                  <span
                    v-if="item.disabledFeatures"
                    class="feature-badge"
                    v-for="feat in parseFeatures(item.disabledFeatures)"
                    :key="feat"
                  >
                    {{ feat }}
                  </span>
                  <span v-else class="no-feature">—</span>
                </td>
                <td>
                  <span
                    class="status-tag"
                    :class="{
                      'tag-pending': item.status === 0,
                      'tag-done': item.status === 1,
                      'tag-ignored': item.status === 2,
                    }"
                  >
                    {{ item.status === 0 ? '待处理' : item.status === 1 ? '已处理' : '已忽略' }}
                  </span>
                </td>
                <td class="td-time">{{ formatTime(item.gmtCreate) }}</td>
                <td>
                  <button
                    v-if="item.status === 0"
                    class="action-btn process-btn"
                    @click="openProcessModal(item)"
                  >
                    处理
                  </button>
                  <span v-else class="processed-label">已处理</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="listData.length === 0" class="empty-state">暂无数据</div>
        </div>

        <!-- 分页 -->
        <div class="pagination-bar">
          <button class="page-btn" :disabled="pageInfo.current <= 1" @click="changePage(pageInfo.current - 1)">
            上一页
          </button>
          <span class="page-info">{{ pageInfo.current }} / {{ pageInfo.pages }}</span>
          <button class="page-btn" :disabled="pageInfo.current >= pageInfo.pages" @click="changePage(pageInfo.current + 1)">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- ========== Tab 2: 当前禁用功能 ========== -->
    <div v-if="activeTab === 'disabled'" class="disabled-section">
      <div class="card">
        <div class="card-header">
          <span class="card-title">当前全局禁用功能</span>
          <button class="refresh-btn small" @click="fetchDisabledFeatures">刷新</button>
        </div>
        <div v-if="disabledLoading" class="loading-state"><van-loading size="20" /> 加载中...</div>
        <div v-else-if="Object.keys(disabledFeaturesMap).length === 0" class="empty-state">
          当前没有禁用功能
        </div>
        <div v-else class="disabled-table">
          <div class="disabled-header">
            <div class="dh">功能标识</div>
            <div class="dh">禁用时间</div>
            <div class="dh">禁用原因</div>
            <div class="dh">提交用户</div>
            <div class="dh">关联反馈ID</div>
          </div>
          <div
            class="disabled-row"
            v-for="(info, key) in disabledFeaturesMap"
            :key="key"
          >
            <div class="dc">
              <span class="feature-key-tag">{{ key }}</span>
            </div>
            <div class="dc">{{ info.disabledTime }}</div>
            <div class="dc" :title="info.reason">{{ info.reason }}</div>
            <div class="dc">{{ info.disabledBy }}</div>
            <div class="dc">
              <a v-if="info.feedbackId" class="feedback-link" @click="jumpToFeedback(info.feedbackId)">
                #{{ info.feedbackId }}
              </a>
              <span v-else>—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 处理反馈弹窗 ========== -->
    <div class="modal-mask" v-show="showProcessModal" @click="closeProcessModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>处理反馈 #{{ processForm.feedbackId }}</h3>
          <button class="close-btn" @click="closeProcessModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 反馈内容（只读） -->
          <div class="form-section">
            <div class="section-label">反馈内容</div>
            <div class="readonly-content">{{ currentFeedback?.content }}</div>
          </div>
          <div v-if="currentFeedback?.disabledFeatures" class="form-section">
            <div class="section-label">关联功能</div>
            <div class="feature-tags">
              <span
                class="feature-tag"
                v-for="feat in parseFeatures(currentFeedback.disabledFeatures)"
                :key="feat"
              >
                {{ feat }}
              </span>
            </div>
          </div>

          <!-- 处理状态 -->
          <div class="form-section">
            <div class="section-label">处理状态</div>
            <van-radio-group v-model="processForm.status" direction="horizontal">
              <van-radio :name="1" shape="square">已处理</van-radio>
              <van-radio :name="2" shape="square">已忽略</van-radio>
            </van-radio-group>
          </div>

          <!-- 处理说明 -->
          <div class="form-section">
            <div class="section-label">处理说明</div>
            <textarea
              v-model="processForm.reason"
              rows="3"
              class="process-textarea"
              placeholder="请填写处理说明..."
            ></textarea>
          </div>

          <!-- 赠时区域（仅已处理+Bug反馈） -->
          <div
            v-if="processForm.status === 1 && currentFeedback?.type === 2"
            class="form-section compensate-section"
          >
            <div class="section-label compensate-label">🎁 时长补偿（可选）</div>
            <div class="compensate-row">
              <div class="compensate-field">
                <label>赠送时长（小时）</label>
                <input
                  v-model.number="processForm.compensateHours"
                  type="number"
                  class="input"
                  min="0"
                  placeholder="输入小时数"
                />
              </div>
              <div class="compensate-field flex-1">
                <label>赠送原因</label>
                <input
                  v-model="processForm.compensateReason"
                  type="text"
                  class="input"
                  placeholder="可选"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeProcessModal">取消</button>
          <button
            class="submit-btn"
            :disabled="!processForm.reason.trim() || processing"
            @click="handleProcess"
          >
            <van-loading v-if="processing" size="16" color="#fff" style="margin-right: 4px" />
            确认处理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'

// ================= Tab 切换 =================
const activeTab = ref('list')

// ================= 筛选 =================
const filter = reactive({
  type: 0,
  status: -1,
  userId: null,
})

const pageInfo = reactive({
  current: 1,
  pages: 1,
  total: 0,
  size: 20,
})

const listData = ref([])

const resetPage = () => {
  pageInfo.current = 1
}

const onFilterChange = () => {
  resetPage()
  fetchList()
}

// ================= 获取管理端反馈列表 =================
const fetchList = async () => {
  try {
    const params = { page: pageInfo.current, size: pageInfo.size }
    if (filter.type > 0) params.type = filter.type
    if (filter.status >= 0) params.status = filter.status
    if (filter.userId) params.userId = filter.userId

    const res = await request({
      url: '/manage/feedback/list',
      method: 'GET',
      params,
    })
    if (res.code === 200 && res.data) {
      listData.value = res.data.records || []
      pageInfo.current = res.data.current || 1
      pageInfo.pages = res.data.pages || 1
      pageInfo.total = res.data.total || 0
    } else {
      listData.value = []
    }
  } catch (err) {
    console.error('获取反馈列表失败:', err)
    listData.value = []
  }
}

const changePage = (page) => {
  if (page < 1 || (pageInfo.pages > 0 && page > pageInfo.pages)) return
  pageInfo.current = page
  fetchList()
}

// ================= 处理反馈弹窗 =================
const showProcessModal = ref(false)
const processing = ref(false)
const currentFeedback = ref(null)

const processForm = reactive({
  feedbackId: 0,
  status: 1,
  reason: '',
  compensateHours: 0,
  compensateReason: '',
})

const openProcessModal = (item) => {
  currentFeedback.value = item
  processForm.feedbackId = item.id
  processForm.status = 1
  processForm.reason = ''
  processForm.compensateHours = 0
  processForm.compensateReason = ''
  showProcessModal.value = true
}

const closeProcessModal = () => {
  showProcessModal.value = false
  currentFeedback.value = null
}

const handleProcess = async () => {
  if (!processForm.reason.trim()) {
    showNotify({ type: 'warning', message: '请填写处理说明' })
    return
  }
  processing.value = true
  try {
    const payload = {
      feedbackId: processForm.feedbackId,
      status: processForm.status,
      reason: processForm.reason.trim(),
    }
    if (
      processForm.status === 1 &&
      currentFeedback.value?.type === 2 &&
      processForm.compensateHours > 0
    ) {
      payload.compensateHours = processForm.compensateHours
      payload.compensateReason = processForm.compensateReason.trim()
    }
    const res = await request({
      url: '/manage/feedback/process',
      method: 'POST',
      data: payload,
    })
    if (res.code === 200) {
      showNotify({ type: 'success', message: '处理成功' })
      closeProcessModal()
      fetchList()
    } else {
      showNotify({ type: 'danger', message: res.remark || '处理失败' })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '处理失败: ' + err.message })
  } finally {
    processing.value = false
  }
}

// ================= 禁用功能列表 =================
const disabledFeaturesMap = ref({})
const disabledLoading = ref(false)

const fetchDisabledFeatures = async () => {
  disabledLoading.value = true
  try {
    const res = await request({
      url: '/manage/feedback/disabledFeatures',
      method: 'GET',
    })
    if (res.code === 200) {
      disabledFeaturesMap.value = res.data || {}
    }
  } catch (err) {
    console.error('获取禁用功能列表失败:', err)
  } finally {
    disabledLoading.value = false
  }
}

// ================= 工具函数 =================
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const truncate = (text, len) => {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

const parseFeatures = (featuresStr) => {
  if (!featuresStr) return []
  try {
    return JSON.parse(featuresStr)
  } catch {
    return []
  }
}

// ================= 跳转逻辑 =================
const jumpToFeedback = (feedbackId) => {
  // 切换到列表tab，尝试搜索该反馈
  filter.userId = null
  filter.type = 0
  filter.status = -1
  activeTab.value = 'list'
  // 无法精确搜索单个feedbackId，但可以提示用户
  showNotify({ type: 'info', message: `关联反馈ID: ${feedbackId}，请在列表中查找` })
}

// ================= 统一刷新 =================
const refreshData = () => {
  if (activeTab.value === 'list') {
    fetchList()
  } else {
    fetchDisabledFeatures()
  }
}

defineExpose({ refresh: refreshData })

// ================= 生命周期 =================
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.manage-feedback-page {
  padding: 12px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
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
.refresh-btn {
  background: #1989fa;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.refresh-btn.small {
  padding: 4px 10px;
  font-size: 12px;
}
.refresh-btn:active {
  background: #1677ff;
}

/* ========== 卡片 ========== */
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

/* ========== 筛选栏 ========== */
.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-item label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}
.filter-select {
  padding: 6px 10px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  min-width: 100px;
}
.filter-input {
  padding: 6px 10px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 13px;
  width: 120px;
}
.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #1989fa;
}

/* ========== 表格 ========== */
.table-wrapper {
  overflow-x: auto;
}
.feedback-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.feedback-table th {
  padding: 10px 8px;
  background: #f7f8fa;
  font-weight: 500;
  color: #666;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid #eee;
}
.feedback-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f2f3f5;
  color: #333;
  vertical-align: middle;
}
.td-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.td-time {
  white-space: nowrap;
}
.type-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.tag-suggest {
  background: #e8f3ff;
  color: #1989fa;
}
.tag-bug {
  background: #fff0f0;
  color: #ee0a24;
}
.status-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.tag-pending {
  background: #fff7e6;
  color: #fa8c16;
}
.tag-done {
  background: #f0fff0;
  color: #07c160;
}
.tag-ignored {
  background: #f5f5f5;
  color: #999;
}
.user-id-link {
  color: #1989fa;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
}
.user-id-link:hover {
  color: #1677ff;
}
.feature-badge {
  display: inline-block;
  padding: 1px 6px;
  background: #f0f5ff;
  color: #2f54eb;
  border-radius: 4px;
  font-size: 11px;
  margin-right: 4px;
  margin-bottom: 2px;
}
.no-feature {
  color: #ccc;
}
.action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.process-btn {
  background: #1989fa;
  color: #fff;
}
.process-btn:hover {
  background: #1677ff;
}
.processed-label {
  color: #999;
  font-size: 12px;
}

/* ========== 分页 ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 0;
}
.page-btn {
  padding: 4px 12px;
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.page-info {
  font-size: 13px;
  color: #666;
}

/* ========== 禁用功能列表 ========== */
.disabled-table {
  width: 100%;
  font-size: 13px;
}
.disabled-header {
  display: flex;
  padding: 10px 12px;
  background: #f7f8fa;
  border-radius: 8px;
  font-weight: 500;
  color: #666;
  font-size: 13px;
}
.disabled-row {
  display: flex;
  padding: 10px 12px;
  border-bottom: 1px solid #f2f3f5;
  align-items: center;
  font-size: 13px;
}
.disabled-row:last-child {
  border-bottom: none;
}
.dh,
.dc {
  flex: 1;
  text-align: left;
  padding: 0 4px;
}
.dh:first-child,
.dc:first-child {
  flex: 0 0 150px;
}
.dh:nth-child(2),
.dc:nth-child(2) {
  flex: 0 0 160px;
}
.dh:nth-child(4),
.dc:nth-child(4) {
  flex: 0 0 120px;
}
.dh:nth-child(5),
.dc:nth-child(5) {
  flex: 0 0 100px;
}
.feature-key-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f5ff;
  color: #2f54eb;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}
.feedback-link {
  color: #1989fa;
  cursor: pointer;
  text-decoration: underline;
}

/* ========== 弹窗 ========== */
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
  width: 540px;
  max-width: 90vw;
  background: #fff;
  border-radius: 12px;
  max-height: 85vh;
  overflow-y: auto;
}
.modal-header {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
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
.form-section {
  margin-bottom: 16px;
}
.section-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  margin-bottom: 6px;
}
.readonly-content {
  font-size: 14px;
  color: #333;
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.feature-tag {
  padding: 2px 8px;
  background: #f0f5ff;
  color: #2f54eb;
  border-radius: 4px;
  font-size: 12px;
}
.process-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  line-height: 1.5;
  box-sizing: border-box;
  min-height: 70px;
}
.process-textarea:focus {
  outline: none;
  border-color: #1989fa;
}
.compensate-section {
  padding: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}
.compensate-label {
  color: #d48806;
}
.compensate-row {
  display: flex;
  gap: 12px;
}
.compensate-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.compensate-field label {
  font-size: 12px;
  color: #999;
}
.compensate-field .input {
  padding: 8px 10px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 14px;
}
.compensate-field .input:focus {
  outline: none;
  border-color: #1989fa;
}
.flex-1 {
  flex: 1;
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
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.submit-btn:disabled {
  background: #b0d4ff;
  cursor: not-allowed;
}

/* ========== 加载/空状态 ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}
</style>
