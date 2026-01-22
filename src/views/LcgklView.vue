<template>
  <div class="game-task-container" style="padding: 16px">
    <!-- 第一部分：任务启动模块 -->
    <div class="task-start-module" style="margin-bottom: 24px">
      <h3 style="font-size: 18px; margin-bottom: 16px">零充干氪佬</h3>
      <!-- 卡密输入 -->
      <van-field
        v-model="formData.cdKey"
        label="卡密"
        placeholder="请输入cdKey"
        style="margin-bottom: 8px"
      />
      <!-- 游戏ID输入 -->
      <van-field
        v-model="formData.uuid"
        label="游戏ID"
        placeholder="请输入uuid"
        style="margin-bottom: 8px"
      />
      <!-- 游戏凭证输入 -->
      <van-field
        v-model="formData.token"
        label="游戏凭证"
        placeholder="请输入token"
        style="margin-bottom: 8px"
      />
      <!-- 游戏金额输入 -->
      <van-field
        v-model.number="formData.amount"
        label="游戏金额"
        type="number"
        placeholder="请输入金额，必须是60的整数倍"
        style="margin-bottom: 16px"
      />
      <!-- 刷取按钮 -->
      <van-button type="primary" block @click="handleFetch(0)" :loading="isLoading">
        刷取
      </van-button>
    </div>

    <!-- 第二部分：进度查询模块 -->
    <div class="progress-query-module">
      <h3 style="font-size: 18px; margin-bottom: 16px">进度查询</h3>
      <!-- 信息获取输入框（自动填充/手动修改） -->
      <van-field
        v-model="queryData.uuid"
        label="查询ID"
        placeholder="请输入要查询的uuid"
        style="margin-bottom: 16px"
      />
      <!-- 已刷数量显示 -->
      <van-cell title="已刷数量" :value="brushedCount" />
    </div>

    <!-- 二次确认弹窗（Vant Dialog组件） -->
    <van-dialog
      v-model:show="confirmDialogVisible"
      title="确认提示"
      :message="confirmRemark"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { showToast } from 'vant'
import request from '@/utils/request'
// ---------------------- 状态定义 ----------------------
// 加载状态
const isLoading = ref(false)
// 二次确认弹窗显隐
const confirmDialogVisible = ref(false)
// 二次确认弹窗内容
const confirmRemark = ref('')
// 已刷数量
const brushedCount = ref('0')
// 任务启动表单数据
const formData = reactive({
  cdKey: '',
  uuid: '',
  token: '',
  amount: '',
})
// 进度查询数据
const queryData = reactive({
  uuid: '',
})
// 进度查询定时器（用于清除定时任务）
let queryTimer = null

// ---------------------- 任务启动核心方法 ----------------------
/**
 * 处理「刷取」按钮点击事件
 * @param {number} force - 强制标识（0：默认请求，1：二次确认后请求）
 */
const handleFetch = async (force = 0) => {
  // 表单校验
  if (!formData.cdKey || !formData.uuid || !formData.token || !formData.amount) {
    showToast('请填写完整表单信息')
    return
  }

  isLoading.value = true
  // 构建请求参数
  const params = {
    cdKey: formData.cdKey,
    uuid: formData.uuid,
    token: formData.token,
    amount: formData.amount,
    force: force,
  }
  const url = '/game/start'
  // 发送请求（接口地址根据实际项目调整，此处为示例）
  const resData = await request({
    url,
    params,
  })
  // 接口返回200的处理逻辑
  if (resData.code === 200) {
    // 有remark内容：弹出二次确认框
    if (resData.data && resData.data.trim()) {
      confirmRemark.value = resData.data
      confirmDialogVisible.value = true
    }
    // 无remark内容：启动进度查询
    else {
      showToast('任务启动成功，开始查询进度')
      // 自动填充进度查询的uuid
      queryData.uuid = formData.uuid
      // 启动定时进度查询
      startProgressQuery()
    }
  } else {
    showToast(resData.remark)
  }
  isLoading.value = false
}

// ---------------------- 二次确认弹窗事件 ----------------------
/**
 * 二次确认弹窗 - 点击「是」
 */
const handleConfirm = () => {
  confirmDialogVisible.value = false
  // 重新请求，force改为1
  handleFetch(1)
}

/**
 * 二次确认弹窗 - 点击「否」
 */
const handleCancel = () => {
  confirmDialogVisible.value = false
}

// ---------------------- 进度查询核心方法 ----------------------
/**
 * 启动定时进度查询（每10秒一次）
 */
const startProgressQuery = () => {
  // 先清除已有定时器，避免重复创建
  clearInterval(queryTimer)
  // 立即执行一次查询，再开启定时
  fetchProgressInfo()
  // 每10秒执行一次
  queryTimer = setInterval(fetchProgressInfo, 10000)
}

/**
 * 发送进度查询请求
 */
const fetchProgressInfo = async () => {
  if (!queryData.uuid) return

  try {
    // 发送进度查询请求（接口地址根据实际项目调整，此处为示例）
    const resData = await request('/game/info', {
      params: { uuid: queryData.uuid },
    })

    if (resData.code === 200) {
      // 更新已刷数量（取返回的data字段）
      brushedCount.value = resData.data
      if (brushedCount.value == -3) {
        brushedCount.value = '未查询到玩家刷取信息'
      }
      if (brushedCount.value == -2) {
        brushedCount.value = '刷取失败，请联系管理员'
      }
      if (brushedCount.value == -1) {
        brushedCount.value = '正在准备中！'
      }
      if(brushedCount.value < -3) {
        brushedCount.value = '已下单：' + -brushedCount.value
      } else {
        brushedCount.value = '已完成：' + brushedCount.value
      }
    }
  } catch (error) {
    console.error('进度查询失败：', error.message)
    showToast('进度查询失败')
  }
}

// ---------------------- 组件销毁时清理资源 ----------------------
onUnmounted(() => {
  // 清除定时器，避免内存泄漏
  clearInterval(queryTimer)
})
</script>

<style scoped>
.game-task-container {
  max-width: 750px;
  margin: 0 auto;
}

.task-start-module,
.progress-query-module {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
