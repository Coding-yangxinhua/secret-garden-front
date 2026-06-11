<template>
  <div class="feedback-page">
    <!-- 顶部导航 — iOS 17 大标题风格 -->
    <div class="feedback-header">
      <div class="header-left">
        <van-icon name="arrow-left" size="20" @click="$router.back()" class="back-icon" />
        <h3 class="page-title">意见反馈</h3>
      </div>
      <button
        class="header-switch-btn"
        :class="{ active: showHistory }"
        @click="showHistory = !showHistory"
      >
        {{ showHistory ? '提交' : '记录' }}
      </button>
    </div>

    <!-- ========== 提交反馈 ========== -->
    <div v-if="!showHistory" class="feedback-submit-section">
      <div class="apple-card feedback-card-item">
        <div class="apple-card-content" style="padding-bottom: 8px">
          <div class="segment-title apple-text-caption-2">反馈类型</div>
          <div class="apple-segment" style="margin-top: 8px">
            <button
              class="apple-segment-btn"
              :class="{ active: submitForm.type === 1 }"
              @click="submitForm.type = 1"
            >
              优化建议
            </button>
            <button
              class="apple-segment-btn"
              :class="{ active: submitForm.type === 2 }"
              @click="submitForm.type = 2"
            >
              Bug反馈
            </button>
          </div>
        </div>
      </div>

      <div class="apple-card feedback-card-item">
        <div class="apple-card-content">
          <div class="segment-title apple-text-caption-2">反馈内容</div>
          <div class="textarea-wrapper">
            <textarea
              v-model="submitForm.content"
              :maxlength="500"
              placeholder="请详细描述您的建议或遇到的问题..."
              rows="5"
              class="feedback-textarea"
            ></textarea>
            <div class="textarea-count">{{ submitForm.content.length }}/500</div>
          </div>
        </div>
      </div>

      <!-- Bug反馈：功能单选 + 搜索筛选 -->
      <div v-if="submitForm.type === 2" class="apple-card feedback-card-item">
        <div class="apple-card-content">
          <div class="segment-title apple-text-caption-2">
            关联功能
            <span class="card-subtitle">禁用后全局生效，选择一个</span>
          </div>

          <!-- ⚠️ 提示文案 -->
          <div class="feature-warning">
            <van-icon name="info-o" size="14" color="#ff9500" />
            <span
              >Bug反馈会关掉所有人对应的功能，请确保有问题再关闭哦，同时解决问题后，将奖励时长~</span
            >
          </div>

          <div v-if="featureKeysLoading" class="loading-state">
            <van-loading size="16" color="#86868b" /> 加载中...
          </div>
          <template v-else>
            <!-- 搜索筛选框 — iOS 搜索栏风格 -->
            <div class="feature-search-box">
              <van-icon name="search" size="15" color="#86868b" />
              <input
                v-model="featureSearchKeyword"
                type="text"
                class="feature-search-input"
                placeholder="搜索功能名称..."
              />
              <van-icon
                v-if="featureSearchKeyword"
                name="close"
                size="13"
                color="#86868b"
                class="search-clear"
                @click="featureSearchKeyword = ''"
              />
            </div>

            <div class="feature-group-list">
              <div
                class="feature-group"
                v-for="(features, groupName) in filteredFeatureKeysMap"
                :key="groupName"
              >
                <div class="feature-group-title">{{ groupName }}</div>
                <div class="feature-radio-group">
                  <div
                    v-for="feat in features"
                    :key="feat.key"
                    class="feature-chip"
                    :class="{
                      'feature-chip--selected': submitForm.disabledFeature === feat.key,
                      'feature-chip--disabled': feat.disabled,
                    }"
                    :data-disabled="feat.disabled"
                    @click="feat.disabled || (submitForm.disabledFeature = feat.key)"
                  >
                    <span class="feature-chip-name">{{ feat.displayName }}</span>
                    <span v-if="feat.disabled" class="feature-chip-badge">已禁用</span>
                  </div>
                </div>
              </div>
              <div v-if="Object.keys(filteredFeatureKeysMap).length === 0" class="no-match-state">
                无匹配功能
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="submit-bar">
        <button class="apple-submit-btn" :disabled="!canSubmit || submitting" @click="handleSubmit">
          <van-loading v-if="submitting" size="18" color="#fff" style="margin-right: 6px" />
          {{ submitting ? '提交中...' : '提交反馈' }}
        </button>
      </div>
    </div>

    <!-- ========== 反馈记录列表 ========== -->
    <div v-else class="feedback-history-section">
      <div v-if="loading" class="loading-state">
        <van-loading size="18" color="#86868b" /> 加载中...
      </div>
      <template v-else>
        <div v-if="feedbackList.length === 0" class="empty-state">
          <div class="empty-icon">
            <van-icon name="records" size="36" color="#c7c7cc" />
          </div>
          <p class="empty-title">暂无反馈记录</p>
          <p class="empty-desc">提交反馈后，可在此查看处理进度</p>
        </div>
        <div v-else class="feedback-list">
          <div
            class="apple-card feedback-card-item feedback-card-clickable"
            v-for="item in feedbackList"
            :key="item.id"
            @click="toggleDetail(item)"
          >
            <div class="apple-card-content">
              <div class="feedback-card-header">
                <div class="header-left">
                  <span class="type-badge" :class="item.type === 1 ? 'badge-suggest' : 'badge-bug'">
                    {{ item.type === 1 ? '优化' : 'Bug' }}
                  </span>
                  <span
                    class="status-badge"
                    :class="{
                      'badge-pending': item.status === 0,
                      'badge-done': item.status === 1,
                      'badge-ignored': item.status === 2,
                    }"
                  >
                    {{ item.status === 0 ? '待处理' : item.status === 1 ? '已处理' : '已忽略' }}
                  </span>
                </div>
                <span class="header-time">{{ formatTime(item.gmtCreate) }}</span>
              </div>
              <div class="feedback-content">{{ truncate(item.content, 60) }}</div>

              <!-- 展开详情 (iOS 原生折叠动画) -->
              <div
                class="feedback-detail-wrapper"
                :class="{ 'detail-expanded': expandedId === item.id }"
              >
                <div class="feedback-detail-inner">
                  <div class="detail-section">
                    <div class="detail-label">完整内容</div>
                    <div class="detail-text">{{ item.content }}</div>
                  </div>
                  <div v-if="item.disabledFeatures" class="detail-section">
                    <div class="detail-label">关联功能</div>
                    <div class="detail-tags">
                      <span
                        class="detail-tag"
                        v-for="feat in parseFeatures(item.disabledFeatures)"
                        :key="feat"
                      >
                        {{ resolveFeatureName(feat) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="item.closedReason" class="detail-section">
                    <div class="detail-label">处理说明</div>
                    <div class="detail-text reason-text">{{ item.closedReason }}</div>
                  </div>
                  <div v-if="item.closedTime" class="detail-section">
                    <div class="detail-label">处理时间</div>
                    <div class="detail-text">{{ formatTime(item.closedTime) }}</div>
                  </div>
                  <div v-if="item.compensateHours > 0" class="detail-section compensate-section">
                    <div class="detail-label">🎉 补偿</div>
                    <div class="detail-text">
                      获赠 <strong>{{ item.compensateHours }}</strong> 小时
                      <span v-if="item.compensateReason">（{{ item.compensateReason }}）</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="expand-indicator">
                <van-icon
                  :name="expandedId === item.id ? 'arrow-up' : 'arrow-down'"
                  size="12"
                  color="#c7c7cc"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 — iOS 简约风格 -->
        <div class="pagination-bar" v-if="totalPages > 1">
          <button
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            <van-icon name="arrow-left" size="14" color="#86868b" />
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
          >
            <van-icon name="arrow" size="14" color="#86868b" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showNotify } from 'vant'
import request from '@/utils/request'

// ================= 状态控制 =================
const showHistory = ref(false)

// ================= 提交表单 =================
const submitForm = reactive({
  type: 1,
  content: '',
  disabledFeature: '', // 单选：存功能key
})
const submitting = ref(false)

const canSubmit = computed(() => {
  if (!submitForm.content.trim()) return false
  if (submitForm.type === 2 && !submitForm.disabledFeature) return false
  return true
})

// ================= 功能标识列表 =================
const featureKeysMap = ref({})
const featureKeysLoading = ref(false)

const fetchFeatureKeys = async () => {
  featureKeysLoading.value = true
  try {
    const res = await request({ url: '/manage/feedback/featureKeys', method: 'GET' })
    if (res.code === 200 && res.data) {
      featureKeysMap.value = res.data
    }
  } catch (err) {
    console.error('获取功能标识列表失败:', err)
  } finally {
    featureKeysLoading.value = false
  }
}

// ================= 功能搜索筛选 =================
const featureSearchKeyword = ref('')

const filteredFeatureKeysMap = computed(() => {
  const keyword = featureSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return featureKeysMap.value

  const result = {}
  for (const [groupName, features] of Object.entries(featureKeysMap.value)) {
    const filtered = features.filter((feat) => feat.displayName.toLowerCase().includes(keyword))
    if (filtered.length > 0) {
      result[groupName] = filtered
    }
  }
  return result
})

// 监听类型切换：切到Bug反馈时加载功能列表
watch(
  () => submitForm.type,
  (newVal) => {
    if (newVal === 2) {
      if (Object.keys(featureKeysMap.value).length === 0) {
        fetchFeatureKeys()
      }
    } else {
      submitForm.disabledFeature = ''
      featureSearchKeyword.value = ''
    }
  },
)

// ================= 提交反馈 =================
const handleSubmit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const payload = {
      type: submitForm.type,
      content: submitForm.content.trim(),
    }
    if (submitForm.type === 2) {
      payload.disabledFeatures = [submitForm.disabledFeature]
    }
    const res = await request({
      url: '/feedback/submit',
      method: 'POST',
      data: payload,
    })
    if (res.code === 200) {
      showNotify({ type: 'success', message: '反馈提交成功！' })
      // 重置表单
      submitForm.content = ''
      submitForm.disabledFeature = ''
      submitForm.type = 1
      featureSearchKeyword.value = ''
      // 切换到记录页并刷新
      showHistory.value = true
      fetchFeedbackList()
    } else {
      showNotify({ type: 'danger', message: res.remark || '提交失败' })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '提交失败: ' + err.message })
  } finally {
    submitting.value = false
  }
}

// ================= 反馈列表 =================
const feedbackList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageSize = 20
const expandedId = ref(null)

const toggleDetail = (item) => {
  expandedId.value = expandedId.value === item.id ? null : item.id
}

const fetchFeedbackList = async (page = 1) => {
  loading.value = true
  try {
    const res = await request({
      url: '/feedback/list',
      method: 'GET',
      params: { page, size: pageSize },
    })
    if (res.code === 200 && res.data) {
      feedbackList.value = res.data.records || []
      totalRecords.value = res.data.total || 0
      totalPages.value = res.data.pages || 1
      currentPage.value = res.data.current || 1
    } else {
      feedbackList.value = []
    }
  } catch (err) {
    console.error('获取反馈列表失败:', err)
    feedbackList.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  fetchFeedbackList(page)
}

// ================= 工具函数 =================
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN', {
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
  // 尝试 JSON 解析（数组）
  try {
    const parsed = JSON.parse(featuresStr)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // 不是 JSON 数组，当作纯字符串处理
  }
  return [featuresStr]
}

// key → displayName 映射（用已有 featureKeysMap 构建）
const featureNameMap = computed(() => {
  const map = {}
  for (const features of Object.values(featureKeysMap.value)) {
    for (const feat of features) {
      map[feat.key] = feat.displayName
    }
  }
  return map
})

// 反查功能名称
const resolveFeatureName = (key) => {
  return featureNameMap.value[key] || key
}

// ================= 生命周期 =================
onMounted(() => {
  fetchFeedbackList()
  fetchFeatureKeys()
})
</script>

<style scoped>
/* ============================================================
   🍎 FeedbackView — iOS 17 Settings 风格
   ============================================================ */

.feedback-page {
  min-height: 100vh;
  background: var(--apple-bg-secondary, #f2f2f7);
  padding-bottom: 100px;
}

/* ========== 顶部导航 ========== */
.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(30px) saturate(1.4);
  -webkit-backdrop-filter: blur(30px) saturate(1.4);
  border-bottom: 1px solid var(--apple-separator, rgba(60, 60, 67, 0.08));
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 590;
  color: var(--apple-text-primary, #1d1d1f);
  letter-spacing: -0.2px;
}
.back-icon {
  cursor: pointer;
  padding: 6px;
  color: var(--apple-text-link, #007aff);
  border-radius: 50%;
  transition: background 0.15s;
}
.back-icon:active {
  background: rgba(0, 122, 255, 0.08);
}
.header-switch-btn {
  font-size: 15px;
  font-weight: 500;
  color: var(--apple-text-link, #007aff);
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.header-switch-btn:active {
  background: rgba(0, 122, 255, 0.08);
}
.header-switch-btn.active {
  background: var(--apple-text-link, #007aff);
  color: #fff;
}

/* ========== 卡片通用 ========== */
.feedback-card-item {
  margin: 12px 16px;
  animation: appleCardFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.feedback-card-clickable {
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.feedback-card-clickable:active {
  transform: scale(0.985);
}

/* ========== 分段标题 ========== */
.segment-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.card-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: var(--apple-text-tertiary, #aeaeb2);
  letter-spacing: 0;
  text-transform: none;
}

/* ========== 文本输入 ========== */
.textarea-wrapper {
  position: relative;
  margin-top: 8px;
}
.feedback-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--apple-separator, rgba(60, 60, 67, 0.08));
  border-radius: 12px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  resize: none;
  box-sizing: border-box;
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  color: var(--apple-text-primary, #1d1d1f);
  transition: all 0.2s;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  letter-spacing: -0.1px;
}
.feedback-textarea:focus {
  outline: none;
  border-color: var(--apple-text-link, #007aff);
  background: rgba(255, 255, 255, 0.9);
}
.feedback-textarea::placeholder {
  color: var(--apple-text-quaternary, #c7c7cc);
}
.textarea-count {
  text-align: right;
  font-size: 12px;
  color: var(--apple-text-tertiary, #aeaeb2);
  margin-top: 6px;
  letter-spacing: 0px;
}

/* ========== Bug 反馈提示文案 ========== */
.feature-warning {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: rgba(255, 149, 0, 0.06);
  border: 1px solid rgba(255, 149, 0, 0.12);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #b87a00;
  letter-spacing: 0.1px;
}
.feature-warning van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

/* ========== 功能搜索 + 单选 ========== */
.feature-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 10px 0 14px;
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.feature-search-box:focus-within {
  border-color: var(--apple-text-link, #007aff);
  background: rgba(255, 255, 255, 0.9);
}
.feature-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 400;
  padding: 0;
  outline: none;
  color: var(--apple-text-primary, #1d1d1f);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}
.feature-search-input::placeholder {
  color: var(--apple-text-quaternary, #c7c7cc);
}
.search-clear {
  cursor: pointer;
  flex-shrink: 0;
  padding: 2px;
}
.search-clear:active {
  opacity: 0.5;
}

.feature-group-list {
  max-height: 230px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.feature-group {
  margin-bottom: 14px;
}
.feature-group:last-child {
  margin-bottom: 0;
}
.feature-group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--apple-text-secondary, #86868b);
  margin-bottom: 8px;
  padding-left: 2px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.feature-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.feature-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border: 1px solid var(--apple-separator, rgba(60, 60, 67, 0.08));
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--apple-text-primary, #1d1d1f);
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.feature-chip:active {
  transform: scale(0.96);
}
.feature-chip--selected {
  background: var(--apple-text-link, #007aff);
  border-color: var(--apple-text-link, #007aff);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}
.feature-chip--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: rgba(242, 242, 247, 0.8);
}
.feature-chip--disabled:active {
  transform: none;
}
.feature-chip-name {
  display: inline-block;
}
.feature-chip-badge {
  font-size: 10px;
  font-weight: 500;
  padding: 1px 5px;
  background: rgba(142, 142, 147, 0.15);
  border-radius: 4px;
  color: var(--apple-text-tertiary, #aeaeb2);
  line-height: 1.3;
}
.no-match-state {
  text-align: center;
  color: var(--apple-text-tertiary, #aeaeb2);
  padding: 24px 0;
  font-size: 14px;
}

/* ========== 提交按钮 ========== */
.submit-bar {
  padding: 16px 20px;
}
.apple-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  background: var(--apple-text-link, #007aff);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 590;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(0, 122, 255, 0.25);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  letter-spacing: -0.2px;
  -webkit-tap-highlight-color: transparent;
}
.apple-submit-btn:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}
.apple-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ========== 加载/空状态 ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--apple-text-tertiary, #aeaeb2);
  font-size: 14px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
}
.empty-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 242, 247, 0.6);
  border-radius: 30px;
  margin-bottom: 12px;
}
.empty-title {
  font-size: 17px;
  font-weight: 590;
  color: var(--apple-text-primary, #1d1d1f);
  margin: 0 0 6px;
}
.empty-desc {
  font-size: 13px;
  font-weight: 400;
  color: var(--apple-text-secondary, #86868b);
  margin: 0;
}

/* ========== 反馈列表 ========== */
.feedback-history-section {
  padding-bottom: 20px;
}
.feedback-list {
  padding: 8px 16px;
}

/* 卡片头部标签 */
.feedback-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.header-left {
  display: flex;
  gap: 6px;
}
.header-time {
  font-size: 12px;
  color: var(--apple-text-tertiary, #aeaeb2);
  flex-shrink: 0;
}

/* 类型/状态徽章 */
.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.2px;
}
.badge-suggest {
  background: rgba(0, 122, 255, 0.08);
  color: var(--apple-text-link, #007aff);
}
.badge-bug {
  background: rgba(255, 59, 48, 0.08);
  color: var(--apple-text-destructive, #ff3b30);
}
.badge-pending {
  background: rgba(255, 149, 0, 0.08);
  color: #ff9500;
}
.badge-done {
  background: rgba(52, 199, 89, 0.08);
  color: var(--apple-text-success, #34c759);
}
.badge-ignored {
  background: rgba(142, 142, 147, 0.08);
  color: var(--apple-text-tertiary, #aeaeb2);
}

.feedback-content {
  font-size: 15px;
  font-weight: 400;
  color: var(--apple-text-primary, #1d1d1f);
  line-height: 1.45;
  letter-spacing: -0.1px;
}

/* ========== 展开详情（iOS 原生折叠动画） ========== */
.feedback-detail-wrapper {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.feedback-detail-wrapper.detail-expanded {
  max-height: 600px;
}
.feedback-detail-inner {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--apple-separator, rgba(60, 60, 67, 0.08));
}
.detail-section {
  margin-bottom: 10px;
}
.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--apple-text-tertiary, #aeaeb2);
  margin-bottom: 4px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.detail-text {
  font-size: 14px;
  font-weight: 400;
  color: var(--apple-text-primary, #1d1d1f);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  letter-spacing: -0.1px;
}
.reason-text {
  color: var(--apple-text-secondary, #86868b);
}
.compensate-section .detail-text {
  color: #ff9500;
}
.compensate-section strong {
  font-size: 15px;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.detail-tag {
  padding: 3px 10px;
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--apple-text-secondary, #86868b);
}

/* 展开箭头 */
.expand-indicator {
  display: flex;
  justify-content: center;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--apple-separator-light, rgba(60, 60, 67, 0.04));
}

/* ========== 分页 ========== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 16px;
}
.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--apple-separator, rgba(60, 60, 67, 0.08));
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.page-btn:active:not(:disabled) {
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  transform: scale(0.93);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--apple-text-secondary, #86868b);
  min-width: 48px;
  text-align: center;
}
</style>
