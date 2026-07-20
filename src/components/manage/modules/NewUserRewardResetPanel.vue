<template>
  <section class="manage-module">
    <ManageModuleHeader
      title="新人奖励生成"
      description="根据账号精确查询账号，并补发一条可领取的新人奖励记录。"
    />

    <div class="manage-panel">
      <div class="manage-search-row">
        <div class="manage-form-row">
          <label class="manage-label" for="reward-reset-username">账号</label>
          <input
            id="reward-reset-username"
            v-model.trim="userName"
            type="search"
            class="manage-input"
            placeholder="输入完整用户账号"
            @keyup.enter="searchSystemUser"
          />
        </div>
        <button
          type="button"
          class="manage-btn manage-btn-primary"
          :disabled="searchLoading || !userName"
          @click="searchSystemUser"
        >
          {{ searchLoading ? '查询中...' : '查询账号' }}
        </button>
      </div>
    </div>

    <div v-if="rewardRecord" class="manage-panel manage-result-bar">
      <div>
        <div class="manage-record-title">新人奖励已重置</div>
        <div class="manage-record-meta">
          已为系统账号 ID {{ formatValue(selectedUser?.id) }} 新增一条可领取奖励记录。
        </div>
      </div>
      <span class="manage-badge success">奖励天数：{{ formatValue(rewardRecord.rewardDays) }}</span>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="账号信息" :description="resultDescription" />

      <div v-if="selectedUser" class="reward-user-card">
        <div class="reward-user-head">
          <div>
            <div class="manage-record-title">{{ formatValue(selectedUser.nickName) }}</div>
            <div class="manage-record-meta">{{ formatValue(selectedUser.userName) }}</div>
          </div>
          <span class="manage-badge success">已查询</span>
        </div>

        <div class="manage-record-actions">
          <button
            type="button"
            class="manage-btn manage-btn-primary"
            :disabled="resetLoading"
            @click="resetReward"
          >
            {{ resetLoading ? '重置中...' : '重置新人奖励' }}
          </button>
        </div>
      </div>

      <ManageEmptyState
        v-else-if="searched && !searchLoading"
        title="未查询到系统账号"
        description="请确认 userName 完整且准确。"
      />
      <ManageEmptyState
        v-else
        title="等待查询"
        description="输入完整 userName 后，会展示对应系统账号信息。"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

const userName = ref('')
const selectedUser = ref(null)
const rewardRecord = ref(null)
const searchLoading = ref(false)
const resetLoading = ref(false)
const searched = ref(false)

const resultDescription = computed(() => {
  if (!selectedUser.value) return ''
  return `系统账号 ID：${formatValue(selectedUser.value.id)}`
})

const isSuccessCode = (code) => code === 0 || code === 200 || code === '0' || code === '200'
const getResponseMessage = (res, fallback) => res?.remark || res?.msg || res?.message || fallback

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

const searchSystemUser = async () => {
  const keyword = userName.value.trim()
  if (!keyword) {
    showNotify({ type: 'warning', message: '请输入完整 userName' })
    return
  }

  searchLoading.value = true
  searched.value = true
  selectedUser.value = null
  rewardRecord.value = null
  try {
    const res = await request({
      url: '/manage/system-user/by-username',
      method: 'GET',
      params: { userName: keyword },
    })

    if (isSuccessCode(res.code) && res.data) {
      selectedUser.value = res.data
    } else {
      showNotify({ type: 'danger', message: getResponseMessage(res, '系统账号不存在') })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '查询请求失败: ' + (err.message || err) })
  } finally {
    searchLoading.value = false
  }
}

const resetReward = async () => {
  if (!selectedUser.value?.id) {
    showNotify({ type: 'warning', message: '请先查询有效的系统账号' })
    return
  }

  const displayName = selectedUser.value.nickName || selectedUser.value.userName || `ID ${selectedUser.value.id}`
  const confirmed = window.confirm(`确认为系统账号「${displayName}」新增一条可领取新人奖励记录吗？`)
  if (!confirmed) return

  resetLoading.value = true
  rewardRecord.value = null
  try {
    const res = await request({
      url: '/manage/system-user/add-extra-reward',
      method: 'POST',
      params: { systemUserId: selectedUser.value.id },
    })

    if (isSuccessCode(res.code) && res.data) {
      rewardRecord.value = res.data
      showNotify({ type: 'success', message: '新人奖励重置成功' })
    } else {
      showNotify({ type: 'danger', message: getResponseMessage(res, '新人奖励重置失败') })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '重置请求失败: ' + (err.message || err) })
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.reward-user-card {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.reward-user-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

</style>
