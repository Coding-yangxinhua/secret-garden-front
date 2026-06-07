<template>
  <div class="code-container">
    <!-- ========== 批量生成兑换码 ========== -->
    <div class="card">
      <div class="card-header"><span class="card-title">批量生成兑换码</span></div>
      <div class="code-form">
        <div class="form-row">
          <label class="form-label">套餐类型</label>
          <input
            v-model.number="codeForm.subscribeId"
            type="number"
            class="input"
            placeholder="请输入订阅ID"
          />
        </div>
        <div class="form-row">
          <label class="form-label">有效天数</label>
          <input
            v-model.number="codeForm.validUses"
            type="number"
            class="input"
            placeholder="每个兑换码可被使用的次数"
          />
        </div>
        <div class="form-row">
          <label class="form-label">生成数量</label>
          <input
            v-model.number="codeForm.count"
            type="number"
            class="input"
            placeholder="需要生成的兑换码数量"
          />
        </div>
        <div class="form-row">
          <label class="form-label">代理销售（可选）</label>
          <div class="agent-search-box">
            <div class="agent-search-inner">
              <van-icon name="search" size="16" color="#999" />
              <input
                v-model="agentKeyword"
                type="text"
                class="input agent-search-input"
                placeholder="搜索代理用户..."
                @input="debounceAgentSearch"
              />
              <van-loading v-if="agentSearching" size="16" color="#1989fa" />
            </div>
            <div class="agent-dropdown" v-if="agentOptions.length > 0">
              <div
                class="agent-option"
                v-for="user in agentOptions"
                :key="user.id"
                @click="selectAgent(user)"
              >
                <span class="agent-name">{{ user.nickName || user.userName }}</span>
                <span class="agent-id-text">ID: {{ user.id }}</span>
              </div>
            </div>
            <div class="selected-agent" v-if="selectedAgent">
              <span class="agent-tag">
                {{ selectedAgent.nickName || selectedAgent.userName }}
                <van-icon name="close" size="12" color="#999" @click.stop="clearAgent" />
              </span>
            </div>
          </div>
        </div>
        <button class="generate-btn" @click="generateCodes" :disabled="generating">
          {{ generating ? '生成中...' : '开始生成' }}
        </button>
      </div>
      <div v-if="codeResults.length > 0" class="code-result">
        <div class="result-header">
          <span>生成结果 ({{ codeResults.length }}个)</span>
          <button class="copy-all-btn" @click="copyAllCodes">一键复制</button>
        </div>
        <div class="code-list">
          <div class="code-item" v-for="(code, index) in codeResults" :key="index">
            <span class="code-text">{{ code }}</span>
            <button class="copy-single-btn" @click="copyCode(code)">复制</button>
          </div>
        </div>
      </div>
      <div v-else-if="generatedOnce && !generating" class="empty-state">暂无生成结果</div>
    </div>

    <!-- ========== 代理销售卡密统计 ========== -->
    <div class="card" v-if="stats.length > 0">
      <div class="card-header"><span class="card-title">📊 代理销售卡密统计</span></div>
      <div class="stats-table">
        <div class="stats-header">
          <div class="sth">代理昵称</div>
          <div class="sth">用户ID</div>
          <div class="sth">时长（天）</div>
          <div class="sth">已使用</div>
        </div>
        <div class="stats-row" v-for="(item, index) in stats" :key="index">
          <div class="std">{{ item.nickName }}</div>
          <div class="std">{{ item.referId }}</div>
          <div class="std">
            <span class="day-tag">{{ item.addDay }}天</span>
          </div>
          <div class="std">
            <span class="used-count">{{ item.used }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import { showNotify, Icon as VanIcon, Loading as VanLoading } from 'vant'

// ================= 兑换码生成 =================
const codeForm = reactive({ subscribeId: 2, validUses: 3, count: 1 })
const codeResults = ref([])
const generating = ref(false)
const generatedOnce = ref(false)

// ================= 代理销售搜索 =================
const agentKeyword = ref('')
const agentOptions = ref([])
const agentSearching = ref(false)
const selectedAgent = ref(null)

let agentSearchTimer = null
const debounceAgentSearch = () => {
  clearTimeout(agentSearchTimer)
  agentSearchTimer = setTimeout(() => {
    fetchAgentUsers()
  }, 500)
}

const fetchAgentUsers = async () => {
  if (!agentKeyword.value.trim()) {
    agentOptions.value = []
    return
  }
  agentSearching.value = true
  try {
    const res = await request({
      url: 'manage/user/search',
      method: 'GET',
      params: {
        type: 0,
        nickName: agentKeyword.value.trim(),
      },
    })
    if (res.code === 200) {
      agentOptions.value = res.data || []
    }
  } catch (err) {
    console.error('代理用户搜索失败：', err)
  } finally {
    agentSearching.value = false
  }
}

const selectAgent = (user) => {
  selectedAgent.value = user
  agentKeyword.value = ''
  agentOptions.value = []
}

const clearAgent = () => {
  selectedAgent.value = null
}

const generateCodes = async () => {
  if (!codeForm.subscribeId || !codeForm.validUses || !codeForm.count) {
    showNotify({ type: 'warning', message: '请填写完整的参数' })
    return
  }
  generating.value = true
  try {
    const params = {
      subscribeId: codeForm.subscribeId,
      validUses: codeForm.validUses,
      count: codeForm.count,
    }
    if (selectedAgent.value) {
      params.referId = selectedAgent.value.id
    }
    const res = await request({
      url: 'manage/cardCodeGenerator',
      method: 'GET',
      params,
    })
    if (res.code === 200 && res.data) {
      codeResults.value = res.data
      generatedOnce.value = true
    } else {
      showNotify({ type: 'danger', message: '生成失败：' + (res.remark || '未知错误') })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '请求失败：' + err.message })
  } finally {
    generating.value = false
  }
}

// ================= 复制功能 =================
const copyCode = (code) => {
  const textarea = document.createElement('textarea')
  textarea.value = code
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, code.length)
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (success) {
    showNotify({ type: 'success', message: '已复制：' + code, duration: 2000 })
  } else {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        showNotify({ type: 'success', message: '已复制：' + code, duration: 2000 })
      })
      .catch(() => {
        showNotify({ type: 'danger', message: '复制失败，请手动复制', duration: 3000 })
      })
  }
}

const copyAllCodes = () => {
  const allCodes = codeResults.value.join('\n')
  const textarea = document.createElement('textarea')
  textarea.value = allCodes
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '-9999px'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, allCodes.length)
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (success) {
    showNotify({ type: 'success', message: '已复制全部兑换码', duration: 2000 })
  } else {
    navigator.clipboard
      .writeText(allCodes)
      .then(() => {
        showNotify({ type: 'success', message: '已复制全部兑换码', duration: 2000 })
      })
      .catch(() => {
        showNotify({ type: 'danger', message: '复制失败，请手动复制', duration: 3000 })
      })
  }
}

// ================= 代理销售卡密统计 =================
const stats = ref([])

const fetchStats = async () => {
  try {
    const res = await request({
      url: '/manage/cardCodeStats',
      method: 'GET',
    })
    if (res.code === 200 && res.data) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('卡密统计获取失败：', err)
  }
}

onMounted(() => {
  fetchStats()
})

// 暴露刷新方法供父组件调用
defineExpose({ fetchStats })
</script>

<style scoped>
.code-container {
  margin-top: 8px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.card-header {
  margin-bottom: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.code-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 20px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 150px;
}
.form-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}
.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.input:focus {
  border-color: #1989fa;
  outline: none;
}
.generate-btn {
  padding: 8px 20px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s;
  height: 38px;
  align-self: flex-end;
}
.generate-btn:hover:not(:disabled) {
  background: #06b152;
}
.generate-btn:disabled {
  background: #a0cfa0;
  cursor: not-allowed;
}

/* ========== 代理销售搜索 ========== */
.agent-search-box {
  position: relative;
}
.agent-search-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 0 12px;
}
.agent-search-input {
  border: none !important;
  flex: 1;
  padding: 8px 0;
}
.agent-search-input:focus {
  outline: none;
}
.agent-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.agent-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}
.agent-option:last-child {
  border-bottom: none;
}
.agent-option:hover {
  background-color: #f5f9ff;
}
.agent-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.agent-id-text {
  font-size: 12px;
  color: #999;
}
.selected-agent {
  margin-top: 6px;
}
.agent-tag {
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
.agent-tag .van-icon {
  cursor: pointer;
}

/* ========== 生成结果 ========== */
.code-result {
  margin-top: 20px;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.copy-all-btn {
  padding: 4px 12px;
  background: #1989fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.code-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.code-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f7f8fa;
  border-radius: 6px;
}
.code-text {
  font-family: monospace;
  font-size: 14px;
  color: #333;
  letter-spacing: 1px;
}
.copy-single-btn {
  padding: 2px 10px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

/* ========== 代理销售卡密统计 ========== */
.stats-table {
  width: 100%;
}
.stats-header {
  display: flex;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  font-weight: 500;
  color: #666;
  font-size: 14px;
}
.stats-row {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f2f3f5;
  align-items: center;
  font-size: 14px;
}
.stats-row:last-child {
  border-bottom: none;
}
.sth,
.std {
  flex: 1;
  text-align: left;
}
.std:last-child,
.sth:last-child {
  text-align: center;
}
.day-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #fff7e6;
  color: #fa8c16;
  border-radius: 4px;
  font-size: 13px;
}
.used-count {
  display: inline-block;
  padding: 2px 10px;
  background: #f0f5ff;
  color: #2f54eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}
</style>
