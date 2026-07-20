<template>
  <section class="manage-module">
    <ManageModuleHeader
      title="用户管理"
      description="根据游戏账号昵称或用户名查询绑定的系统账号，并执行密码重置。"
    />

    <div class="manage-panel">
      <div class="manage-search-row">
        <div class="manage-form-row">
          <label class="manage-label" for="bound-user-keyword">游戏账号关键词</label>
          <input
            id="bound-user-keyword"
            v-model.trim="userKeyword"
            type="search"
            class="manage-input"
            placeholder="输入用户昵称或账号"
            @keyup.enter="searchBoundSystemUsers"
          />
        </div>
        <button
          type="button"
          class="manage-btn manage-btn-primary"
          :disabled="userSearchLoading || !userKeyword"
          @click="searchBoundSystemUsers"
        >
          {{ userSearchLoading ? '查询中...' : '查询用户' }}
        </button>
      </div>
    </div>

    <div v-if="resetResult" class="manage-panel manage-result-bar">
      <div>
        <div class="manage-record-title">密码已重置</div>
        <div class="manage-record-meta">
          系统账号 ID：{{ resetResult.systemUserId }}，请及时交给用户保存。
        </div>
      </div>
      <div class="manage-password">
        <span>{{ resetResult.newPassword }}</span>
        <button type="button" class="manage-btn manage-btn-primary" @click="copyNewPassword">
          复制
        </button>
      </div>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="查询结果" :description="resultDescription" />

      <div v-if="systemUserList.length > 0" class="manage-table-wrap">
        <table class="manage-table desktop-only">
          <thead>
            <tr>
              <th style="width: 70px">选择</th>
              <th style="width: 180px">系统 ID</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>密码字段</th>
              <th style="width: 128px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in systemUserList"
              :key="user.id"
              :class="{ selected: isSystemUserSelected(user) }"
              @click="selectSystemUser(user)"
            >
              <td>
                <span class="manage-badge" :class="{ success: isSystemUserSelected(user) }">
                  {{ isSystemUserSelected(user) ? '已选' : '选择' }}
                </span>
              </td>
              <td>{{ formatUserValue(user.id) }}</td>
              <td>{{ formatUserValue(user.userName) }}</td>
              <td>{{ formatUserValue(user.nickName) }}</td>
              <td>{{ formatUserValue(user.password) }}</td>
              <td>
                <button
                  type="button"
                  class="manage-btn manage-btn-danger"
                  :disabled="resetPasswordLoading && isSystemUserSelected(user)"
                  @click.stop="resetSystemPassword(user)"
                >
                  {{ resetPasswordLoading && isSystemUserSelected(user) ? '重置中...' : '重置' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="manage-card-list mobile-only">
          <article
            v-for="user in systemUserList"
            :key="user.id"
            class="manage-record-card"
            :class="{ selected: isSystemUserSelected(user) }"
            @click="selectSystemUser(user)"
          >
            <div class="manage-record-head">
              <div>
                <div class="manage-record-title">{{ formatUserValue(user.nickName) }}</div>
                <div class="manage-record-meta">{{ formatUserValue(user.userName) }}</div>
              </div>
              <span class="manage-badge" :class="{ success: isSystemUserSelected(user) }">
                {{ isSystemUserSelected(user) ? '已选' : '可选' }}
              </span>
            </div>
            <div class="manage-record-meta">系统 ID：{{ formatUserValue(user.id) }}</div>
            <div class="manage-record-meta">密码字段：{{ formatUserValue(user.password) }}</div>
            <div class="manage-record-actions">
              <button
                type="button"
                class="manage-btn manage-btn-danger"
                :disabled="resetPasswordLoading && isSystemUserSelected(user)"
                @click.stop="resetSystemPassword(user)"
              >
                {{ resetPasswordLoading && isSystemUserSelected(user) ? '重置中...' : '重置密码' }}
              </button>
            </div>
          </article>
        </div>
      </div>

      <ManageEmptyState
        v-else-if="userSearched && !userSearchLoading"
        title="未查询到绑定的系统账号"
        description="可以换一个游戏昵称或用户名关键词再试。"
      />
      <ManageEmptyState
        v-else
        title="等待查询"
        description="输入游戏账号关键词后，会列出已绑定的系统账号。"
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

const userKeyword = ref('')
const systemUserList = ref([])
const selectedSystemUser = ref(null)
const userSearchLoading = ref(false)
const resetPasswordLoading = ref(false)
const userSearched = ref(false)
const resetResult = ref(null)

const resultDescription = computed(() => {
  if (!systemUserList.value.length) return ''
  return `共 ${systemUserList.value.length} 条绑定记录`
})

const isSuccessCode = (code) => code === 0 || code === 200 || code === '0' || code === '200'
const getResponseMessage = (res, fallback) => res?.remark || res?.msg || res?.message || fallback

const searchBoundSystemUsers = async () => {
  const keyword = userKeyword.value.trim()
  if (!keyword) {
    showNotify({ type: 'warning', message: '请输入游戏账号昵称或用户名' })
    return
  }

  userSearchLoading.value = true
  userSearched.value = true
  resetResult.value = null
  selectedSystemUser.value = null
  try {
    const res = await request({
      url: '/manage/user/bound-system-account',
      method: 'GET',
      params: { keyword },
    })

    if (isSuccessCode(res.code)) {
      systemUserList.value = Array.isArray(res.data) ? res.data : []
    } else {
      systemUserList.value = []
      showNotify({ type: 'danger', message: getResponseMessage(res, '查询失败') })
    }
  } catch (err) {
    systemUserList.value = []
    showNotify({ type: 'danger', message: '查询请求失败: ' + (err.message || err) })
  } finally {
    userSearchLoading.value = false
  }
}

const selectSystemUser = (user) => {
  selectedSystemUser.value = user
}

const isSystemUserSelected = (user) => selectedSystemUser.value?.id === user.id

const formatUserValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

const resetSystemPassword = async (user) => {
  if (!user?.id) {
    showNotify({ type: 'warning', message: '请选择有效的系统账号' })
    return
  }

  selectSystemUser(user)
  const displayName = user.nickName || user.userName || `ID ${user.id}`
  const confirmed = window.confirm(`确认将系统账号「${displayName}」的密码重置为随机 6 位数字吗？`)
  if (!confirmed) return

  resetPasswordLoading.value = true
  resetResult.value = null
  try {
    const res = await request({
      url: '/manage/user/reset-password',
      method: 'POST',
      params: { systemUserId: user.id },
    })

    if (isSuccessCode(res.code) && res.data) {
      resetResult.value = {
        systemUserId: res.data.systemUserId ?? user.id,
        newPassword: res.data.newPassword,
      }
      showNotify({ type: 'success', message: '密码重置成功' })
    } else {
      showNotify({ type: 'danger', message: getResponseMessage(res, '密码重置失败') })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '重置请求失败: ' + (err.message || err) })
  } finally {
    resetPasswordLoading.value = false
  }
}

const copyNewPassword = async () => {
  if (!resetResult.value?.newPassword) return
  try {
    await navigator.clipboard.writeText(String(resetResult.value.newPassword))
    showNotify({ type: 'success', message: '新密码已复制' })
  } catch {
    showNotify({ type: 'warning', message: '复制失败，请手动选择密码' })
  }
}
</script>
