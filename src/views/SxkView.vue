<template>
  <div class="info-encrypt-container">
    <!-- 上部分：信息填入区（自定义卡片样式） -->
    <div class="card input-card">
      <div class="card-title">史小坑的黑暗料理</div>
      <div class="card-content">
        <!-- 卡密填入行（自定义输入框） -->
        <div class="form-item">
          <label class="form-label">卡密</label>
          <div class="form-input-wrapper">
            <input
              v-model="formData.cdKey"
              type="text"
              class="form-input"
              placeholder="请输入卡密内容"
              @input="handleInputClear($event, 'cardKey')"
            />
            <span 
              class="clear-icon" 
              v-if="formData.cdKey"
              @click="formData.cdKey = ''"
            >×</span>
          </div>
        </div>

        <!-- 登录信息填入行（自定义多行文本域） -->
        <div class="form-item form-item-textarea">
          <label class="form-label">登录信息</label>
          <div class="form-input-wrapper textarea-wrapper">
            <textarea
              v-model="formData.loginJson"
              class="form-textarea"
              placeholder="请粘贴完整的登录信息JSON字符串"
              rows="8"
              @input="extractLoginFields"
            ></textarea>
            <span 
              class="clear-icon textarea-clear" 
              v-if="formData.loginJson"
              @click="formData.loginJson = ''"
            >×</span>
          </div>
        </div>

        <!-- 加密按钮（自定义按钮，带加载状态） -->
        <div class="encrypt-btn-wrapper">
          <button
            class="encrypt-btn"
            @click="handleEncrypt"
            :class="{ 'btn-loading': btnLoading }"
            :disabled="btnLoading"
          >
            <span v-if="!btnLoading">提交加密</span>
            <span class="loading-spinner" v-if="btnLoading"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 下部分：信息展示区（自定义卡片样式） -->
    <div class="card show-card">
      <div class="card-title">信息展示区</div>
      <div class="card-content">
        <!-- 提取的核心字段展示（自定义单元格） -->
        <div class="extracted-fields">
          <h4 class="field-title">提取的核心字段</h4>
          <div class="cell-group">
            <div class="cell">
              <div class="cell-label">UID</div>
              <div class="cell-value">{{ extractedFields.uid || '——' }}</div>
            </div>
            <div class="cell">
              <div class="cell-label">Token</div>
              <div class="cell-value">{{ extractedFields.token || '——' }}</div>
            </div>
            <div class="cell">
              <div class="cell-label">Group ID</div>
              <div class="cell-value">{{ extractedFields.groupid || '——' }}</div>
            </div>
            <div class="cell">
              <div class="cell-label">Channel</div>
              <div class="cell-value">{{ extractedFields.channel || '——' }}</div>
            </div>
            <div class="cell">
              <div class="cell-label">App ID</div>
              <div class="cell-value">{{ extractedFields.appid || '——' }}</div>
            </div>
            <div class="cell">
              <div class="cell-label">User ID</div>
              <div class="cell-value">{{ extractedFields.roleId || '——' }}</div>
            </div>
          </div>
        </div>

        <!-- 自定义分割线 -->
        <div class="divider">
          <span class="divider-text">加密结果</span>
        </div>

        <!-- 接口响应结果展示（自定义滚动容器） -->
        <div class="response-scroll">
          <pre class="response-content">
{{ responseResult || '暂无响应数据，点击「提交加密」获取结果' }}
          </pre>
        </div>
      </div>
    </div>

    <!-- 自定义提示弹窗（替代Vant Toast） -->
    <div class="toast" v-if="toastVisible">
      <div class="toast-icon" :class="toastType">{{ getToastIcon() }}</div>
      <div class="toast-text">{{ toastMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import  request  from '@/utils/request';

// 表单数据
const formData = reactive({
  cdKey: '', // 卡密
  loginJson: '' // 登录信息JSON字符串
});

// 提取的核心字段
const extractedFields = reactive({
  uid: '',
  token: '',
  groupid: '',
  channel: '',
  appid: '',
  roleId: ''
});

// 接口响应结果
const responseResult = ref();

// 按钮加载状态
const btnLoading = ref(false);

// 自定义提示弹窗相关
const toastVisible = ref(false);
const toastMessage = ref('');
const toastType = ref('success'); // success / warning / error
const toastTimer = ref(null);

/**
 * 提取登录信息JSON中的指定字段
 */
const extractLoginFields = () => {
  // 清空之前提取的字段
  Object.keys(extractedFields).forEach(key => {
    extractedFields[key] = '';
  });

  if (!formData.loginJson.trim()) return;

  try {
    // 解析外层JSON
    const outerJson = JSON.parse(formData.loginJson);
    
    // 提取外层uid
    if (outerJson.uid) {
      extractedFields.uid = outerJson.uid.toString();
    }

    // 解析内层data（二次解析，处理字符串格式JSON）
    if (outerJson.data) {
      const innerData = JSON.parse(outerJson.data);
      const innerInfo = innerData.data || {};
      extractedFields.token = innerInfo.token || '';
      extractedFields.groupid = innerInfo.groupid || '';
      extractedFields.channel = innerInfo.channel || '';
      extractedFields.appid = innerInfo.appid || '';
      extractedFields.roleId = innerInfo.userId || '';
    }
  } catch (error) {
    console.error('JSON解析失败：', error);
    showToast('登录信息JSON格式有误，请检查', 'warning');
  }
};

/**
 * 自定义提示弹窗（替代Vant Toast）
 * @param {string} message 提示内容
 * @param {string} type 提示类型：success / warning / error
 */
const showToast = (message, type = 'success') => {
  // 清除之前的定时器
  if (toastTimer.value) {
    clearTimeout(toastTimer.value);
  }

  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;

  // 2秒后隐藏弹窗
  toastTimer.value = setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
};

/**
 * 获取提示弹窗图标
 */
const getToastIcon = () => {
  switch (toastType.value) {
    case 'success':
      return '✓';
    case 'warning':
      return '!';
    case 'error':
      return '×';
    default:
      return '✓';
  }
};

/**
 * 处理输入框清空图标交互
 */
const handleInputClear = (e, field) => {
  // 仅用于辅助交互，核心清空逻辑在图标点击事件
};

/**
 * 处理加密提交
 */
const handleEncrypt = async () => {
  // 表单校验
  if (!formData.cdKey.trim()) {
    return showToast('请输入卡密', 'warning');
  }
  if (!formData.loginJson.trim()) {
    return showToast('请输入登录信息JSON', 'warning');
  }

  try {
    // 开启按钮加载
    btnLoading.value = true;

    // 构造请求参数
    const requestData = {
      cdKey: formData.cdKey,
      ...extractedFields 
    };

    // 调用后端加密接口
    const res = await request('/game/sxk', {params: requestData});

    // 保存响应结果
    responseResult.value = res.data || res.remark;

    // 成功提示
    showToast('加密提交成功', 'success');
  } catch (error) {
    showToast('加密提交失败，请重试', 'error');
    responseResult.value = { error: error.message, msg: '接口请求异常' };
  } finally {
    // 关闭按钮加载
    btnLoading.value = false;
  }
};

// 监听登录信息变化（兜底，确保字段提取完整）
watch(() => formData.loginJson, () => {
  extractLoginFields();
}, { deep: true });

// 组件销毁时清除定时器
onMounted(() => {
  return () => {
    if (toastTimer.value) {
      clearTimeout(toastTimer.value);
    }
  };
});
</script>

<style scoped>
/* 全局容器样式 */
.info-encrypt-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/* 自定义卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
}

.input-card {
  margin-bottom: 24px;
}

.card-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  border-bottom: 1px solid #f0f0f0;
}

.card-content {
  padding: 16px;
}

/* 自定义表单项目样式 */
.form-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-item-textarea {
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  color: #333333;
  margin-bottom: 8px;
  line-height: 1.5;
}

.form-input-wrapper {
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input::placeholder {
  color: #999999;
}

.form-input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

/* 多行文本域样式 */
.textarea-wrapper {
  height: auto;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  box-sizing: border-box;
  outline: none;
  resize: none;
  transition: border-color 0.3s ease;
  min-height: 120px;
  line-height: 1.5;
}

.form-textarea::placeholder {
  color: #999999;
}

.form-textarea:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

/* 清空图标样式 */
.clear-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #999999;
  cursor: pointer;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  transition: color 0.3s ease;
}

.clear-icon:hover {
  color: #333333;
}

.textarea-clear {
  top: auto;
  bottom: 12px;
  transform: none;
}

/* 自定义按钮样式 */
.encrypt-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.encrypt-btn {
  width: 100%;
  height: 48px;
  background-color: #4285f4;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.encrypt-btn:hover {
  background-color: #3367d6;
}

.encrypt-btn:disabled {
  background-color: #a8c0f5;
  cursor: not-allowed;
}

/* 按钮加载状态 */
.btn-loading {
  background-color: #a8c0f5 !important;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 提取字段展示样式 */
.extracted-fields {
  margin-bottom: 20px;
}

.field-title {
  font-size: 14px;
  color: #333333;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.cell-group {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.cell {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.cell:last-child {
  border-bottom: none;
}

.cell-label {
  font-size: 14px;
  color: #333333;
  width: 80px;
  flex-shrink: 0;
}

.cell-value {
  font-size: 14px;
  color: #666666;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 自定义分割线样式 */
.divider {
  width: 100%;
  height: 1px;
  background-color: #f0f0f0;
  position: relative;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.divider-text {
  position: relative;
  left: 0;
  background-color: #ffffff;
  padding-right: 16px;
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

/* 响应结果滚动容器 */
.response-scroll {
  height: 300px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
}

.response-content {
  /* 字体调至14px（兼顾大小和柔和度，也可改为15px更醒目） */
  font-size: 14px;
  /* 核心修改：将深灰蓝改为更柔和的中灰色，避免过深刺眼 */
  color: #586069;
  /* 保留JSON格式化换行和长文本换行功能 */
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  /* 进一步增大行高，让文字间距更宽松，视觉更舒缓 */
  line-height: 2.0;
  /* 文字抗锯齿，边缘更平滑，提升柔和感 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 降低字重，避免文字过粗，更显柔和（400为常规，300更细更柔和） */
  font-weight: 300;
  /* 选用系统默认无衬线字体，更圆润柔和，替代等宽字体的硬朗感（也可保留等宽字体，二选一） */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  /* 可选：轻微增加文字间距，让字符不拥挤，进一步提升柔和度 */
  letter-spacing: 0.2px;
}

/* 自定义提示弹窗样式 */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  z-index: 9999;
}

.toast-icon {
  font-size: 24px;
  margin-bottom: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.toast-icon.success {
  background-color: rgba(76, 175, 80, 0.8);
}

.toast-icon.warning {
  background-color: rgba(255, 193, 7, 0.8);
}

.toast-icon.error {
  background-color: rgba(244, 67, 54, 0.8);
}

.toast-text {
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}
</style>