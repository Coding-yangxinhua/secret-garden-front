<template>
  <div class="log-page-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-back" @click="goBack">
        <van-icon name="arrow-left" size="20" />
        <span>返回</span>
      </div>
      <h2 class="page-title">🌸 日志记录</h2>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="keyword"
        placeholder="请输入关键词搜索"
        show-action
        @search="onSearch"
        @clear="onClear"
        @cancel="onSearchCancel"
        class="search-input"
        :loading="isSearching"
      >
        <template #action>
          <span
            @click="onSearch"
            :class="{ 'search-btn-disabled': isSearching }"
            :style="{ color: isSearching ? '#cccccc' : '#ff6767' }"
          >
            搜索
          </span>
        </template>
      </van-search>
    </div>

    <!-- Tab 切换区域 -->
    <div class="tab-area">
      <div class="tab-switch">
        <button class="tab-btn" :class="{ active: activeTab === 'run' }" @click="switchTab('run')">
          📋 运行日志
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'time' }"
          @click="switchTab('time')"
        >
          ⏱️ 时长日志
        </button>
      </div>
    </div>

    <!-- 日期选择区域（仅运行日志可见） -->
    <div v-if="activeTab === 'run'" class="date-selection-area">
      <div class="date-info">
        <van-icon name="calendar-o" size="18" color="#ff6767" />
        <span class="date-label">选择日期</span>
      </div>
      <van-dropdown-menu class="date-dropdown">
        <van-dropdown-item
          v-model="selectedDate"
          :options="dateOptions"
          @change="onDateChange"
          class="date-dropdown-item"
        />
      </van-dropdown-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 运行日志列表 -->
      <div v-if="activeTab === 'run'" class="log-list-container">
        <div v-if="logs.length === 0 && !loading" class="empty-state">
          <van-empty
            :image="keyword ? 'search' : 'search'"
            :description="keyword ? '未找到相关日志' : '暂无日志记录'"
            class="empty-content"
          />
        </div>
        <div v-else class="log-list">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <div class="log-date">
              <van-icon name="clock-o" size="14" color="#8c8c8c" />
              <span class="log-time">{{ log.toDate }}</span>
            </div>
            <div class="log-content" v-html="formatContent(log.content)"></div>
          </div>
        </div>
        <div class="bottom-padding"></div>
      </div>

      <!-- 时长日志列表（共用 logs 数据） -->
      <div v-if="activeTab === 'time'" class="time-log-list-container">
        <div v-if="logs.length === 0 && !timeLoading" class="empty-state">
          <van-empty image="records" description="暂无时长变动记录" class="empty-content" />
        </div>
        <div v-else class="log-list">
          <div
            v-for="item in logs"
            :key="item.id"
            class="log-item"
            :style="{ borderLeftColor: getTypeColor(item.changeType) }"
          >
            <div class="log-date">
              <van-icon name="clock-o" size="14" color="#8c8c8c" />
              <span class="log-time">{{ formatTime(item.gmtCreate) }}</span>
              <span
                class="type-tag"
                :style="{
                  background: getTypeColor(item.changeType) + '20',
                  color: getTypeColor(item.changeType),
                }"
              >
                {{ getTypeName(item.changeType) }}
              </span>
            </div>
            <div class="time-change-row">
              <span class="source-desc">{{ item.sourceDesc }}</span>
              <span class="hours" :class="item.hours > 0 ? 'positive' : 'negative'">
                {{ item.hours > 0 ? '+' : '' }}{{ item.hours % 24 === 0 ? `${Math.floor(item.hours / 24)}天` : `${item.hours}小时` }}
              </span>
            </div>
          </div>
        </div>
        <div class="bottom-padding"></div>
      </div>

      <!-- 加载提示 -->
      <van-loading
        v-if="loading || timeLoading"
        class="loading-indicator"
        color="#ff6767"
        size="24"
      />
    </div>

    <!-- 分页组件（两个 Tab 共用） -->
    <div v-if="totalPages > 1" class="pagination-container">
      <div class="custom-pagination-wrapper">
        <button
          class="pagination-btn prev-btn"
          :disabled="currentPage <= 1"
          @click="handlePageChange(currentPage - 1)"
        >
          上一页
        </button>
        <div class="page-input-container">
          <span class="current-page-info">第</span>
          <input
            type="number"
            class="page-input"
            :value="currentPage"
            :min="1"
            :max="totalPages"
            @change="handlePageInput"
            @blur="handlePageInput"
            @keydown.enter="handlePageInput"
          />
          <span class="current-page-info">页，共{{ totalPages }}页</span>
        </div>
        <button
          class="pagination-btn next-btn"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showNotify } from 'vant'
import request from '@/utils/request'
import TagToColorUtil from '@/utils/ColorUtil'

const router = useRouter()
const route = useRoute()

// ---------- 共享分页与列表 ----------
const selectedDate = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const logs = ref([])
const loading = ref(false)
const keyword = ref('')
const currentPageSize = ref(10)
const initialPageSize = ref(10)

const activeTab = ref('run')
const isSearching = ref(false)
const timeLoading = ref(false)

const userId = ref(route.query.userId || '')

const totalPages = computed(() => Math.ceil(totalItems.value / currentPageSize.value))

// ---------- Tab 切换（重置页码并重新计算页大小） ----------
const switchTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  currentPageSize.value = calculateDynamicPageSize()
  if (tab === 'run') {
    fetchLogs()
  } else {
    fetchTimeLogs()
  }
}

// ---------- 动态计算页面容量 ----------
const calculateDynamicPageSize = () => {
  const screenHeight = window.innerHeight
  const availableHeight = Math.max(100, screenHeight - 65 - 52 - 72 - 52 - 72 - 40)
  return Math.max(3, Math.min(Math.floor(availableHeight / 100), 30))
}

// ---------- 运行日志接口（使用共享分页） ----------
const fetchLogs = async () => {
  if (!userId.value) {
    showNotify({ type: 'warning', message: '缺少用户ID' })
    return
  }
  loading.value = true
  try {
    const response = await request({
      method: 'GET',
      url: '/log/list',
      params: {
        userId: userId.value,
        toDate: selectedDate.value,
        keyword: keyword.value.trim(),
        page: currentPage.value - 1,
        size: currentPageSize.value,
      },
    })
    if (response.code === 200) {
      logs.value = response.data.records || []
      totalItems.value = response.data.total || 0
      if (keyword.value && logs.value.length === 0) {
        showNotify({ type: 'primary', message: '未找到匹配的日志' })
      }
    } else {
      showNotify({ type: 'danger', message: response.remark || '获取日志失败' })
    }
  } catch (error) {
    showNotify({ type: 'danger', message: '网络错误，请重试' })
  } finally {
    loading.value = false
  }
}

// ---------- 时长日志接口（后端分页，复用共享参数） ----------
const fetchTimeLogs = async () => {
  timeLoading.value = true
  try {
    const res = await request({
      url: '/system/timeLog/page',
      method: 'GET',
      params: {
        page: currentPage.value - 1,
        size: currentPageSize.value,
      },
    })
    if (res.code === 200) {
      logs.value = res.data.records || []
      totalItems.value = res.data.total || 0
    } else {
      showNotify({ type: 'danger', message: res.remark || '获取时长日志失败' })
    }
  } catch (error) {
    showNotify({ type: 'danger', message: '网络错误，请重试' })
  } finally {
    timeLoading.value = false
  }
}

// ---------- 分页操作 ----------
const handlePageChange = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  if (activeTab.value === 'run') {
    await fetchLogs()
  } else {
    await fetchTimeLogs()
  }
}

const handlePageInput = (event) => {
  let inputPage = event.target.value
  if (event.type === 'blur' || event.type === 'change' || event.key === 'Enter') {
    const pageNum = parseInt(inputPage, 10)
    if (isNaN(pageNum) || pageNum < 1) currentPage.value = 1
    else if (pageNum > totalPages.value) currentPage.value = totalPages.value
    else currentPage.value = pageNum
    if (activeTab.value === 'run') {
      fetchLogs()
    } else {
      fetchTimeLogs()
    }
  }
}

// ---------- 窗口大小变化处理 ----------
const handleResize = async () => {
  setTimeout(async () => {
    const newPageSize = calculateDynamicPageSize()
    if (newPageSize !== currentPageSize.value) {
      currentPageSize.value = newPageSize
      const maxPage = Math.ceil(totalItems.value / currentPageSize.value)
      if (currentPage.value > maxPage && maxPage > 0) currentPage.value = maxPage
      if (activeTab.value === 'run') {
        await fetchLogs()
      } else {
        await fetchTimeLogs()
      }
      window.scrollTo(0, 0)
    }
  }, 100)
}

// ---------- 运行日志辅助函数（不变） ----------
const dateOptions = computed(() => {
  const options = []
  const today = new Date()
  options.push({ text: '今天', value: formatDateForApi(today) })
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  options.push({ text: '昨天', value: formatDateForApi(yesterday) })
  for (let i = 2; i <= 6; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    options.push({ text: formatDateForDisplay(date), value: formatDateForApi(date) })
  }
  return options
})

const formatDateForApi = (date) => {
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return `${beijingTime.getUTCFullYear()}-${String(beijingTime.getUTCMonth() + 1).padStart(2, '0')}-${String(beijingTime.getUTCDate()).padStart(2, '0')}`
}
const formatDateForDisplay = (date) => {
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return `${beijingTime.getUTCFullYear()}-${String(beijingTime.getUTCMonth() + 1).padStart(2, '0')}-${String(beijingTime.getUTCDate()).padStart(2, '0')}`
}
const formatContent = (content) => TagToColorUtil.convert(content)
const goBack = () => router.back()

const onSearch = async () => {
  if (isSearching.value) return
  currentPage.value = 1
  isSearching.value = true
  try { await fetchLogs() } finally { isSearching.value = false }
}
const onClear = async () => {
  keyword.value = ''
  currentPage.value = 1
  await fetchLogs()
}
const onSearchCancel = () => {
  keyword.value = ''
  currentPage.value = 1
  fetchLogs()
}
const onDateChange = async () => {
  currentPage.value = 1
  await fetchLogs()
}

// ---------- 时长日志辅助函数 ----------
const typeMap = {
  SYSTEM_ADD: { name: '系统增加', color: '#ff9a9e', emoji: '🎁' },
  COMPENSATE: { name: '维护补偿', color: '#a18cd1', emoji: '💖' },
  GIFT: { name: '活动赠送', color: '#fbc2eb', emoji: '🎀' },
  EXCHANGE: { name: '兑换码', color: '#ff9e88', emoji: '🎫' },
  ALLOT: { name: '时长分配', color: '#d4a5a5', emoji: '📤' },
  RECLAIM: { name: '时长回收', color: '#a8e6cf', emoji: '📥' }
}
const getTypeName = (type) => typeMap[type]?.name || type
const getTypeColor = (type) => typeMap[type]?.color || '#dcdcdc'
const getTypeEmoji = (type) => typeMap[type]?.emoji || '⏱️'
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// ---------- 生命周期 ----------
onMounted(async () => {
  initialPageSize.value = calculateDynamicPageSize()
  currentPageSize.value = initialPageSize.value
  window.addEventListener('resize', handleResize)
  selectedDate.value = formatDateForApi(new Date())
  await fetchLogs()
})
onBeforeUnmount(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
/* 整体容器 */
.log-page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #fff0f5 0%, #f8f9fa 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff6767;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
}
.nav-back:hover {
  background-color: #fff0f5;
}
.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ff6767;
  letter-spacing: 1px;
}
.nav-placeholder {
  width: 60px;
}

/* 搜索栏 */
.search-section {
  padding: 0 16px;
  background-color: #fff;
  flex-shrink: 0;
}
.search-input :deep(.van-search__content) {
  background-color: #f5f5f5;
  border-radius: 20px;
}
.search-btn-disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* Tab 切换（紧凑） */
.tab-area {
  padding: 0px 18px 8px 18px;
  background-color: #fff;
  flex-shrink: 0;
}
.tab-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 3px;
}
.tab-btn {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8c8c8c;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #fff;
  color: #ff6767;
  box-shadow: 0 2px 6px rgba(255, 103, 103, 0.15);
}

/* 日期选择区域 */
.date-selection-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  margin: 12px 16px 8px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}
.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-label {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}
.date-dropdown {
  width: 110px;
  --van-dropdown-menu-background: transparent !important;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 8px;
}

/* 日志列表容器 */
.log-list-container,
.time-log-list-container {
  padding: 6px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

/* 日志卡片（通用） */
.log-item {
  background-color: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #ff6767;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
.log-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}
.log-time {
  font-weight: 500;
}
.log-content {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
  word-break: break-word;
}

/* 时长日志特有行 */
.time-change-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.source-desc {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hours {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.hours.positive {
  color: #44c067;
}
.hours.negative {
  color: #ec3232;
}

/* 类型标签 */
.type-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  white-space: nowrap;
  margin-left: auto;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-content :deep(.van-empty__image) {
  width: 100px;
  height: 100px;
}
.empty-content :deep(.van-empty__description) {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 12px;
}
:deep(.van-dropdown-menu__bar) {
  box-shadow: none;
}
.bottom-padding {
  height: 20px;
  flex-shrink: 0;
}

/* 加载指示器 */
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

/* 分页 */
.pagination-container {
  margin: 8px 12px 12px;
  background-color: #fff;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}
.custom-pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  color: #ff6767;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-btn:hover:not(:disabled) {
  background-color: #fff0f5;
  border-color: #ff6767;
}
.pagination-btn:disabled {
  color: #d1d5db;
  background-color: #f9fafb;
  border-color: #e5e7eb;
}
.page-input-container {
  display: flex;
  align-items: center;
  gap: 6px;
}
.current-page-info {
  font-size: 13px;
  color: #6b7280;
}
.page-input {
  width: 50px;
  padding: 4px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  color: #1f2937;
}
.page-input:focus {
  outline: none;
  border-color: #ff6767;
  box-shadow: 0 0 0 2px rgba(255, 103, 103, 0.1);
}

/* 移动端适配 */
@media (max-width: 375px) {
  .top-nav { padding: 10px 12px; }
  .page-title { font-size: 16px; }
  .tab-btn { font-size: 12px; padding: 5px 0; }
  .date-selection-area { padding: 6px 12px; margin: 10px 12px 6px; }
  .log-item { padding: 12px; }
  .log-content { font-size: 13px; }
  .pagination-btn { padding: 5px 10px; font-size: 12px; min-width: 50px; }
  .page-input { width: 45px; }
}
</style>