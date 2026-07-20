<template>
  <section class="manage-module">
    <ManageModuleHeader title="配置管理" description="维护全局配置模块与版本内容。">
      <template #actions>
        <button type="button" class="manage-btn manage-btn-primary" @click="openAddModal">
          新增配置
        </button>
      </template>
    </ManageModuleHeader>

    <div class="manage-panel">
      <div v-if="configList.length > 0" class="manage-table-wrap">
        <table class="manage-table desktop-only">
          <thead>
            <tr>
              <th>模块标识</th>
              <th style="width: 140px">当前版本</th>
              <th style="width: 220px">更新时间</th>
              <th style="width: 120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="config in configList" :key="config.moduleKey">
              <td>{{ config.moduleKey }}</td>
              <td><span class="manage-badge">V{{ config.version }}</span></td>
              <td>{{ config.updateTime || '-' }}</td>
              <td>
                <button type="button" class="manage-btn manage-btn-ghost" @click="openEditModal(config)">
                  编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="manage-card-list mobile-only">
          <article v-for="config in configList" :key="config.moduleKey" class="manage-record-card">
            <div class="manage-record-head">
              <div>
                <div class="manage-record-title">{{ config.moduleKey }}</div>
                <div class="manage-record-meta">更新时间：{{ config.updateTime || '-' }}</div>
              </div>
              <span class="manage-badge">V{{ config.version }}</span>
            </div>
            <div class="manage-record-actions">
              <button type="button" class="manage-btn manage-btn-ghost" @click="openEditModal(config)">
                编辑
              </button>
            </div>
          </article>
        </div>
      </div>
      <ManageEmptyState v-else title="暂无配置数据" description="点击新增配置创建第一条记录。" />
    </div>

    <div v-if="showEditModal" class="manage-modal-mask" @click="closeEditModal">
      <div class="manage-modal" @click.stop>
        <div class="manage-modal-header">
          <h3>{{ modalType === 'add' ? '新增全局配置' : '编辑全局配置' }}</h3>
          <button type="button" class="manage-close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="manage-modal-body">
          <div class="manage-form-grid">
            <div class="manage-form-row full">
              <label class="manage-label" for="module-key">模块标识</label>
              <input
                id="module-key"
                v-model.trim="editForm.moduleKey"
                type="text"
                class="manage-input"
                :readonly="modalType === 'edit'"
                placeholder="例如：ds.item"
              />
            </div>
            <div class="manage-form-row full">
              <label class="manage-label" for="config-data">配置内容（JSON）</label>
              <textarea
                id="config-data"
                v-model="editForm.configData"
                class="manage-textarea"
                placeholder="请输入完整 JSON 配置内容"
              />
            </div>
          </div>
        </div>
        <div class="manage-modal-footer">
          <button type="button" class="manage-btn manage-btn-ghost" @click="closeEditModal">
            取消
          </button>
          <button type="button" class="manage-btn manage-btn-primary" @click="submitUpdateConfig">
            {{ modalType === 'add' ? '确认新增' : '保存更新' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

const configList = ref([])
const showEditModal = ref(false)
const modalType = ref('add')
const editForm = ref({ moduleKey: '', configData: '' })

const refresh = async () => {
  try {
    const res = await request({ url: '/manage/config/list', method: 'GET' })
    if (res.code === 200 && res.data) configList.value = res.data
  } catch (err) {
    showNotify({ type: 'danger', message: '配置列表请求失败: ' + (err.message || err) })
  }
}

const openAddModal = () => {
  modalType.value = 'add'
  editForm.value = { moduleKey: '', configData: '' }
  showEditModal.value = true
}

const openEditModal = (config) => {
  modalType.value = 'edit'
  editForm.value = { ...config }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = { moduleKey: '', configData: '' }
}

const submitUpdateConfig = async () => {
  try {
    const { id, moduleKey, configData, version } = editForm.value
    if (!moduleKey || !configData) {
      showNotify({ type: 'warning', message: '模块标识和配置内容不能为空' })
      return
    }
    const res = await request({
      url: '/manage/config/update',
      method: 'POST',
      data: { id, moduleKey, configData, version },
    })
    showNotify({ type: 'success', message: String(res?.remark || res?.msg || '保存成功') })
    closeEditModal()
    refresh()
  } catch (err) {
    showNotify({ type: 'danger', message: '操作失败: ' + (err.message || err) })
  }
}

onMounted(refresh)
defineExpose({ refresh })
</script>
