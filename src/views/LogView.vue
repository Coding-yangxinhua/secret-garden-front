<template>
  <div class="log-page-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-back" @click="goBack">
        <van-icon name="arrow-left" size="20" />
        <span>返回</span>
      </div>
      <h2 class="page-title">日志记录</h2>
      <div class="nav-placeholder"></div>
    </div>

    <section class="controls-panel">
      <!-- 搜索栏 -->
      <div class="search-section">
        <van-search
          v-model="keyword"
          placeholder="搜索日志内容"
          show-action
          @search="onSearch"
          @clear="onClear"
          @cancel="onSearchCancel"
          class="search-input"
          :loading="isSearching"
        >
          <template #action>
            <span @click="onSearch" class="search-action" :class="{ disabled: isSearching }">
              搜索
            </span>
          </template>
        </van-search>
      </div>

      <!-- Tab 切换区域 -->
      <div class="tab-area">
        <div class="tab-switch">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'run' }"
            @click="switchTab('run')"
          >
            <van-icon name="records-o" size="15" />
            <span>运行日志</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'time' }"
            @click="switchTab('time')"
          >
            <van-icon name="clock-o" size="15" />
            <span>时长日志</span>
          </button>
        </div>
      </div>

      <!-- 日期选择区域（仅运行日志可见） -->
      <div v-if="activeTab === 'run'" class="date-selection-area">
        <div class="date-info">
          <van-icon name="calendar-o" size="16" />
          <span class="date-label">日期</span>
        </div>
        <div class="date-popover-wrap">
          <button class="date-trigger" type="button" @click.stop="toggleDatePopover">
            <span>{{ selectedDateLabel }}</span>
            <van-icon name="arrow-down" size="13" class="date-trigger-icon" />
          </button>
          <transition name="date-popover">
            <div v-if="showDatePopover" class="date-popover">
              <button
                v-for="option in dateOptions"
                :key="option.value"
                class="date-option"
                :class="{ active: option.value === selectedDate }"
                type="button"
                @click.stop="selectDate(option.value)"
              >
                <span>{{ option.text }}</span>
                <van-icon v-if="option.value === selectedDate" name="success" size="14" />
              </button>
            </div>
          </transition>
        </div>
      </div>
    </section>

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
          <div v-for="(log, index) in logs" :key="index" class="log-item run-log-item">
            <div class="log-date">
              <van-icon name="clock-o" size="14" />
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
            class="log-item time-log-item"
            :style="{ '--log-accent': getTypeColor(item.changeType) }"
          >
            <div class="log-date">
              <van-icon name="clock-o" size="14" />
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
const showDatePopover = ref(false)

const userId = ref(route.query.userId || '')

const totalPages = computed(() => Math.ceil(totalItems.value / currentPageSize.value))
const selectedDateLabel = computed(
  () => dateOptions.value.find((option) => option.value === selectedDate.value)?.text || '选择日期',
)

// ---------- Tab 切换（重置页码并重新计算页大小） ----------
const switchTab = (tab) => {
  activeTab.value = tab
  showDatePopover.value = false
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
const toggleDatePopover = () => {
  showDatePopover.value = !showDatePopover.value
}
const selectDate = async (value) => {
  if (selectedDate.value === value) {
    showDatePopover.value = false
    return
  }
  selectedDate.value = value
  showDatePopover.value = false
  await onDateChange()
}
const onDateChange = async () => {
  currentPage.value = 1
  await fetchLogs()
}
const closeDatePopoverIfClickedOutside = (event) => {
  if (!event.target.closest('.date-popover-wrap')) {
    showDatePopover.value = false
  }
}

// ---------- 时长日志辅助函数 ----------
const typeMap = {
  SYSTEM_ADD: { name: '系统增加', color: '#ec4899' },
  COMPENSATE: { name: '维护补偿', color: '#faad14' },
  GIFT: { name: '活动赠送', color: '#f472b6' },
  EXCHANGE: { name: '兑换码', color: '#ff6767' },
  ALLOT: { name: '时长分配', color: '#d48806' },
  RECLAIM: { name: '时长回收', color: '#34c759' }
}
const getTypeName = (type) => typeMap[type]?.name || type
const getTypeColor = (type) => typeMap[type]?.color || '#dcdcdc'
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
  document.addEventListener('click', closeDatePopoverIfClickedOutside)
  selectedDate.value = formatDateForApi(new Date())
  await fetchLogs()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', closeDatePopoverIfClickedOutside)
})
</script>

<style scoped>
/* 整体容器 */
.log-page-container {
  --log-brand: #ec4899;
  --log-coral: #ff6767;
  --log-text: #1d1d1f;
  --log-secondary: #6b6b70;
  --log-muted: #8c8c8c;
  --log-border: rgba(255, 255, 255, 0.48);
  --log-separator: rgba(60, 60, 67, 0.08);
  --log-glass:
    linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.48)),
    rgba(255, 255, 255, 0.58);
  --log-card:
    linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(255, 250, 252, 0.76)),
    rgba(255, 255, 255, 0.72);
  --log-shadow: 0 8px 28px rgba(180, 120, 140, 0.11);
  min-height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(170deg, #fef6f9 0%, #fdf1f5 42%, #f8f4f7 100%);
  color: var(--log-text);
  font-family:
    -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Roboto,
    sans-serif;
  position: relative;
  overflow: hidden;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(22px) saturate(1.35);
  -webkit-backdrop-filter: blur(22px) saturate(1.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow:
    0 4px 20px rgba(180, 120, 140, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
  flex-shrink: 0;
}
.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 64px;
  min-height: 38px;
  color: var(--log-brand);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.58);
  -webkit-tap-highlight-color: transparent;
}
.nav-back:active {
  background: rgba(255, 255, 255, 0.72);
}
.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--log-text);
  letter-spacing: 0;
}
.nav-placeholder {
  width: 64px;
}

.controls-panel {
  margin: 12px 14px 8px;
  padding: 10px;
  border-radius: 18px;
  background: var(--log-glass);
  border: 1px solid var(--log-border);
  box-shadow: var(--log-shadow);
  backdrop-filter: blur(24px) saturate(1.36);
  -webkit-backdrop-filter: blur(24px) saturate(1.36);
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  z-index: 300;
}

/* 搜索栏 */
.search-section {
  padding: 0;
}
.search-input {
  padding: 0;
  background: transparent;
}
.search-input :deep(.van-search__field) {
  min-height: 38px;
}
.search-input :deep(.van-search__content) {
  min-height: 40px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 250, 252, 0.74)),
    rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(236, 72, 153, 0.1);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.search-input :deep(.van-search__action) {
  padding-right: 2px;
  color: var(--log-brand);
  font-weight: 600;
}
.search-action {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: var(--log-brand);
  font-size: 14px;
  font-weight: 600;
}
.search-action.disabled {
  color: #cccccc;
  pointer-events: none;
}
.search-btn-disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* Tab 切换（紧凑） */
.tab-area {
  padding: 10px 0 0;
}
.tab-switch {
  display: flex;
  min-height: 42px;
  background: rgba(242, 242, 247, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  min-height: 34px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--log-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
}
.tab-btn.active {
  background: rgba(255, 255, 255, 0.92);
  color: var(--log-brand);
  box-shadow:
    0 4px 12px rgba(236, 72, 153, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

/* 日期选择区域 */
.date-selection-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 6px 6px 6px 12px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.54);
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 14px;
}
.date-info {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--log-brand);
}
.date-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--log-secondary);
}
.date-popover-wrap {
  position: relative;
  z-index: 320;
}
.date-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 112px;
  min-height: 34px;
  padding: 0 12px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 252, 0.72)),
    rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(236, 72, 153, 0.12);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 3px 10px rgba(180, 120, 140, 0.08);
  color: var(--log-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.date-trigger:active {
  background: rgba(255, 255, 255, 0.86);
}
.date-trigger-icon {
  color: var(--log-brand);
}
.date-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 321;
  width: min(220px, calc(100vw - 44px));
  max-height: 48vh;
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(255, 250, 252, 0.86)),
    rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 18px 40px rgba(98, 70, 82, 0.18),
    0 6px 18px rgba(236, 72, 153, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(22px) saturate(1.28);
  -webkit-backdrop-filter: blur(22px) saturate(1.28);
}
.date-option {
  width: 100%;
  min-height: 46px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  border-bottom: 1px solid rgba(60, 60, 67, 0.07);
  background: transparent;
  color: var(--log-text);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.date-option:last-child {
  border-bottom: none;
}
.date-option.active {
  background: rgba(236, 72, 153, 0.08);
  color: var(--log-brand);
  font-weight: 600;
}
.date-option:active {
  background: rgba(236, 72, 153, 0.11);
}
.date-popover-enter-active,
.date-popover-leave-active {
  transition:
    opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}
.date-popover-enter-from,
.date-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* 主内容区 */
.main-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 8px;
}

/* 日志列表容器 */
.log-list-container,
.time-log-list-container {
  padding: 6px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
}

/* 日志卡片（通用） */
.log-item {
  position: relative;
  background: var(--log-card);
  border-radius: 15px;
  padding: 10px 13px 11px;
  box-shadow:
    0 3px 14px rgba(180, 120, 140, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.58);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  overflow: hidden;
}
.run-log-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 13px;
  bottom: 13px;
  width: 2px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(180deg, rgba(236, 72, 153, 0.55), rgba(255, 103, 103, 0.28));
}
.time-log-item::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 16px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--log-accent, var(--log-brand));
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--log-accent, var(--log-brand)) 14%, transparent);
}
.log-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--log-muted);
}
.log-time {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.log-content {
  padding: 1px 2px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 13px;
  color: #2f2a2d;
  line-height: 1.52;
  word-break: break-word;
}

/* 时长日志特有行 */
.time-change-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 18px;
}
.source-desc {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--log-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hours {
  min-height: 26px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.68);
  font-variant-numeric: tabular-nums;
}
.hours.positive {
  color: #248a3d;
}
.hours.negative {
  color: var(--log-coral);
}

/* 类型标签 */
.type-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.58);
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0;
  border-radius: 18px;
  background: var(--log-card);
  border: 1px solid rgba(255, 255, 255, 0.58);
}
.empty-content :deep(.van-empty__image) {
  width: 100px;
  height: 100px;
}
.empty-content :deep(.van-empty__description) {
  font-size: 14px;
  color: var(--log-muted);
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
  margin: 8px 14px calc(12px + env(safe-area-inset-bottom));
  background: var(--log-glass);
  backdrop-filter: blur(20px) saturate(1.28);
  -webkit-backdrop-filter: blur(20px) saturate(1.28);
  border: 1px solid var(--log-border);
  border-radius: 18px;
  padding: 8px;
  box-shadow: var(--log-shadow);
  flex-shrink: 0;
}
.custom-pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  min-height: 36px;
  padding: 6px 13px;
  border: 1px solid rgba(236, 72, 153, 0.14);
  background-color: rgba(255, 255, 255, 0.72);
  color: var(--log-brand);
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  min-width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.pagination-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(236, 72, 153, 0.28);
}
.pagination-btn:disabled {
  color: #c9c9ce;
  background-color: rgba(255, 255, 255, 0.42);
  border-color: rgba(255, 255, 255, 0.42);
}
.page-input-container {
  display: flex;
  align-items: center;
  gap: 6px;
}
.current-page-info {
  font-size: 13px;
  color: var(--log-secondary);
}
.page-input {
  width: 48px;
  min-height: 32px;
  padding: 4px 5px;
  border: 1px solid rgba(236, 72, 153, 0.12);
  border-radius: 10px;
  text-align: center;
  font-size: 13px;
  color: var(--log-text);
  background: rgba(255, 255, 255, 0.74);
}
.page-input:focus {
  outline: none;
  border-color: var(--log-brand);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.12);
}

/* 移动端适配 */
@media (max-width: 375px) {
  .top-nav { padding: 8px 12px; }
  .page-title { font-size: 16px; }
  .controls-panel { margin: 10px 12px 7px; padding: 9px; }
  .tab-btn { font-size: 12px; padding: 0 6px; }
  .date-selection-area { padding: 6px 6px 6px 10px; }
  .log-list-container,
  .time-log-list-container { padding: 5px 12px; }
  .log-item { padding: 11px 12px 12px; }
  .log-content { font-size: 13px; }
  .pagination-btn { padding: 5px 9px; font-size: 12px; min-width: 54px; }
  .page-input { width: 42px; }
  .current-page-info { font-size: 12px; }
}
</style>
