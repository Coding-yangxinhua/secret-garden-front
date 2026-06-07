<template>
  <div v-if="showUpdateDialog" class="modal-overlay" @click="handleOverlayClick">
    <div class="update-modal" @click.stop>
      <div class="header-section">
        <h2 class="title">
          {{ updateInfo.title || '发现新版本' }}
          <span class="version-in-title">v{{ updateInfo.version }}</span>
        </h2>
      </div>
      
      <!-- 滚动内容区域 -->
      <div class="content-section">
        <p v-if="updateInfo.desc" class="normal-paragraph">{{ updateInfo.desc }}</p>
        
        <ul class="features-list" v-if="updateInfo.futures && updateInfo.futures.length > 0">
          <li v-for="(feature, index) in updateInfo.futures" :key="index" class="feature-item">
            <span class="feature-bullet"></span>
            <span class="feature-text">{{ feature }}</span>
          </li>
        </ul>
      </div>
      
      <div class="action-section">
        <button class="cancel-btn" @click="handleCancel">
          好的
        </button>
        <button class="confirm-btn" @click="handleConfirm">
          立即更新
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import request from '@/utils/request'

const showUpdateDialog = ref(false)
const updateInfo = ref({
  version: '',
  title: '',
  desc: '',
  futures: []
})

// 解析版本号为数字数组用于比较
const parseVersion = (version) => {
  if (!version) return [0, 0, 0]
  return version.split('.').map(Number).filter(num => !isNaN(num))
}

// 比较版本号
const isVersionNewer = (serverVersion, currentVersion) => {
  const serverParts = parseVersion(serverVersion)
  const currentParts = parseVersion(currentVersion)
  
  for (let i = 0; i < Math.max(serverParts.length, currentParts.length); i++) {
    const serverNum = i < serverParts.length ? serverParts[i] : 0
    const currentNum = i < currentParts.length ? currentParts[i] : 0
    if (serverNum > currentNum) return true
    if (serverNum < currentNum) return false
  }
  return false
}

// 本地版本存储
const getCurrentVersion = () => localStorage.getItem('system_version') || '0.0.0'
const setStoredVersion = (version) => localStorage.setItem('system_version', version)

// 检查更新
const checkVersionUpdate = async () => {
  try {
    const response = await request({ method: 'get', url: 'api/system/version' })
    if(response.code === 200 && response.data) {
      const serverVersion = response.data.version
      if(isVersionNewer(serverVersion, getCurrentVersion())) {
        updateInfo.value = {
          version: response.data.version,
          title: response.data.title || '发现新版本',
          desc: response.data.desc || '本次更新内容如下',
          futures: response.data.futures || []
        }
        showUpdateDialog.value = true
        return true
      }
    }
  } catch (error) {
    console.error('检查版本更新失败:', error)
  }
  return false
}

// 操作
const handleConfirm = () => { setStoredVersion(updateInfo.value.version); location.reload() }
const handleCancel = () => { setStoredVersion(updateInfo.value.version); showUpdateDialog.value = false }
const handleOverlayClick = () => {}

defineExpose({ checkVersionUpdate })
onMounted(() => { checkVersionUpdate() })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(100, 100, 100, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

/* 核心：缩小弹窗最大高度 + 紧凑尺寸 */
.update-modal {
  width: 85%;
  max-width: 380px;
  max-height: 60vh; /* 桌面端最大高度 */
  background: #ffffff;
  border-radius: 16px; /* 缩小圆角 */
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  animation: modalAppear 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modalAppear {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* 缩小头部内边距 */
.header-section {
  text-align: center;
  padding: 12px 16px 8px;
  background: #f8fafc;
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  margin: 0;
  font-size: 18px; /* 缩小标题字体 */
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.version-in-title {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 核心：内容区域滚动 + 超小内边距 */
.content-section {
  padding: 8px 16px;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* 精简滚动条 */
.content-section::-webkit-scrollbar { width: 4px; }
.content-section::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 2px; }
.content-section::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

.normal-paragraph {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 14px; /* 缩小描述字体 */
  line-height: 1.4;
}

.features-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 缩小功能项间距和字体 */
.feature-item {
  color: #334155;
  font-size: 13px;
  line-height: 1.4;
  margin: 6px 0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.feature-bullet {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.feature-text { flex: 1; }

/* 缩小按钮区域内边距 */
.action-section {
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* 缩小按钮尺寸 */
.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 6px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn { background: #f1f5f9; color: #475569; }
.confirm-btn { background: #3b82f6; color: white; }

/* 移动端极致紧凑 */
@media (max-width: 480px) {
  .update-modal {
    width: 80%;
    max-height: 65vh; /* 移动端高度更小 */
  }
  .title { font-size: 16px; flex-direction: column; gap: 4px; }
  .header-section { padding: 10px 12px 6px; }
  .content-section { padding: 6px 12px; }
  .normal-paragraph { font-size: 13px; }
  .feature-item { font-size: 12px; margin: 4px 0; }
  .action-section { padding: 6px 12px; }
  .cancel-btn, .confirm-btn { padding: 5px 0; font-size: 13px; }
}
</style>