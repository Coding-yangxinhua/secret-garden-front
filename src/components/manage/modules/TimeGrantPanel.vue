<template>
  <section class="manage-module">
    <ManageModuleHeader title="时长发放" description="按系统用户或游戏用户发放补偿、活动赠送或系统增加时长。" />

    <div class="manage-panel">
      <div class="manage-form-grid">
        <div class="manage-form-row">
          <label class="manage-label" for="grant-type">发放对象</label>
          <select id="grant-type" v-model.number="grantForm.type" class="manage-select" @change="onTypeChange">
            <option :value="0">系统用户</option>
            <option :value="1">游戏用户</option>
          </select>
        </div>

        <div class="manage-form-row">
          <label class="manage-label" for="grant-change-type">变动类型</label>
          <select id="grant-change-type" v-model="grantForm.changeType" class="manage-select">
            <option value="COMPENSATE">维护补偿</option>
            <option value="GIFT">活动赠送</option>
            <option value="SYSTEM_ADD">系统增加</option>
          </select>
        </div>

        <div class="manage-form-row">
          <label class="manage-label" for="grant-hours">发放小时数</label>
          <input
            id="grant-hours"
            v-model.number="grantForm.hours"
            type="number"
            min="1"
            inputmode="numeric"
            class="manage-input"
            placeholder="小时"
          />
        </div>

        <div class="manage-form-row">
          <label class="manage-label" for="grant-source">来源描述</label>
          <input
            id="grant-source"
            v-model.trim="grantForm.sourceDesc"
            type="text"
            class="manage-input"
            placeholder="例如：维护补偿"
          />
        </div>
      </div>
    </div>

    <div class="manage-panel">
      <ManageModuleHeader title="接收用户" description="可按昵称搜索，也可以勾选全服发放。">
        <template #actions>
          <label class="all-users-toggle">
            <input v-model="isAllUsers" type="checkbox" @change="onAllUsersChange(isAllUsers)" />
            <span>所有人（全服）</span>
          </label>
        </template>
      </ManageModuleHeader>

      <template v-if="!isAllUsers">
        <div class="manage-search-row">
          <input
            v-model.trim="searchKeyword"
            type="search"
            class="manage-input"
            placeholder="输入昵称搜索..."
            @input="debounceSearch"
          />
          <button type="button" class="manage-btn manage-btn-ghost" :disabled="searching" @click="fetchUsers">
            {{ searching ? '搜索中...' : '搜索' }}
          </button>
        </div>

        <div v-if="userOptions.length > 0" class="manage-card-list grant-user-list">
          <button
            v-for="user in userOptions"
            :key="user.id"
            type="button"
            class="grant-user-item"
            :class="{ selected: grantForm.ids.includes(user.id) }"
            @click="toggleUser(user)"
          >
            <span class="manage-badge" :class="{ success: grantForm.ids.includes(user.id) }">
              {{ grantForm.ids.includes(user.id) ? '已选' : '选择' }}
            </span>
            <span>
              <strong>{{ user.nickName || user.userName }}</strong>
              <small>ID: {{ user.id }}</small>
            </span>
          </button>
        </div>
        <ManageEmptyState
          v-else-if="searchKeyword && !searching"
          title="暂无匹配用户"
          description="换一个关键词继续搜索。"
        />
      </template>

      <div v-if="!isAllUsers && grantForm.ids.length > 0" class="selected-user-panel">
        <div class="manage-toolbar">
          <span>已选择 {{ grantForm.ids.length }} 名用户</span>
          <button type="button" class="manage-btn manage-btn-ghost" @click="grantForm.ids = []">
            清空
          </button>
        </div>
        <div class="selected-tags">
          <span v-for="id in grantForm.ids" :key="id" class="manage-badge">
            {{ getUserNickName(id) }}
            <button type="button" class="tag-close" @click="removeUser(id)">×</button>
          </span>
        </div>
      </div>
    </div>

    <div class="manage-panel manage-toolbar">
      <button type="button" class="manage-btn manage-btn-primary" :disabled="grantLoading" @click="submitGrant">
        {{ grantLoading ? '发放中...' : '确认发放' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

const grantForm = reactive({
  type: 0,
  ids: [],
  hours: 1,
  changeType: 'COMPENSATE',
  sourceDesc: '',
})
const isAllUsers = ref(false)
const searchKeyword = ref('')
const userOptions = ref([])
const searching = ref(false)
const grantLoading = ref(false)

let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const fetchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    userOptions.value = []
    return
  }
  searching.value = true
  try {
    const res = await request({
      url: '/manage/user/search',
      method: 'GET',
      params: {
        type: grantForm.type,
        nickName: searchKeyword.value.trim(),
      },
    })
    if (res.code === 200) {
      userOptions.value = res.data || []
    } else {
      showNotify({ type: 'danger', message: res.remark || '搜索失败' })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '搜索请求失败: ' + (err.message || err) })
  } finally {
    searching.value = false
  }
}

const onTypeChange = () => {
  grantForm.ids = []
  userOptions.value = []
  searchKeyword.value = ''
  isAllUsers.value = false
}

const onAllUsersChange = (checked) => {
  if (checked) {
    grantForm.ids = []
    searchKeyword.value = ''
    userOptions.value = []
  }
}

const toggleUser = (user) => {
  const index = grantForm.ids.findIndex((id) => id === user.id)
  if (index > -1) {
    grantForm.ids.splice(index, 1)
  } else {
    grantForm.ids.push(user.id)
    if (!userOptions.value.find((u) => u.id === user.id)) {
      userOptions.value.push(user)
    }
  }
}

const removeUser = (id) => {
  const index = grantForm.ids.indexOf(id)
  if (index > -1) grantForm.ids.splice(index, 1)
}

const getUserNickName = (id) => {
  const user = userOptions.value.find((u) => u.id === id)
  return user ? user.nickName || user.userName : id
}

const submitGrant = async () => {
  if (grantForm.hours <= 0) {
    showNotify({ type: 'warning', message: '请输入有效的小时数' })
    return
  }
  if (!grantForm.sourceDesc.trim()) {
    showNotify({ type: 'warning', message: '请填写来源描述' })
    return
  }
  if (!isAllUsers.value && grantForm.ids.length === 0) {
    showNotify({ type: 'warning', message: '请选择用户，或勾选所有人' })
    return
  }

  grantLoading.value = true
  try {
    const payload = {
      type: grantForm.type,
      hours: grantForm.hours,
      changeType: grantForm.changeType,
      sourceDesc: grantForm.sourceDesc.trim(),
      ids: isAllUsers.value ? [] : grantForm.ids,
    }
    const res = await request({
      url: '/manage/time/grant',
      method: 'POST',
      data: payload,
    })
    if (res.code === 200) {
      showNotify({ type: 'success', message: '发放成功' })
      grantForm.ids = []
      isAllUsers.value = false
      searchKeyword.value = ''
      userOptions.value = []
      grantForm.hours = 1
      grantForm.sourceDesc = ''
    } else {
      showNotify({ type: 'danger', message: res.remark || '发放失败' })
    }
  } catch (err) {
    showNotify({ type: 'danger', message: '发放请求失败: ' + (err.message || err) })
  } finally {
    grantLoading.value = false
  }
}
</script>

<style scoped>
.all-users-toggle {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #435369;
  font-size: 13px;
  font-weight: 700;
}

.grant-user-list {
  margin-top: 12px;
}

.grant-user-item {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--manage-border);
  border-radius: 8px;
  background: #fff;
  color: var(--manage-text);
  cursor: pointer;
  padding: 9px 10px;
  text-align: left;
}

.grant-user-item.selected {
  border-color: #bfdbfe;
  background: var(--manage-accent-soft);
}

.grant-user-item small {
  display: block;
  margin-top: 2px;
  color: var(--manage-muted);
}

.selected-user-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--manage-border);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-close {
  margin-left: 5px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
}
</style>
