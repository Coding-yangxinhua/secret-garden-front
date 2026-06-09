<template>
  <div class="config-card alt-config-card">
    <div class="card-header">
      <cute-icon name="users" size="20" color="#1890ff" />
      <span class="card-title">小号管理</span>
    </div>
    <div class="card-content">
      <van-cell class="feature-cell" center label="只有配置的小号能进行摸花/爬架或使用完整功能">
        <template #title>
          <span class="feature-title">小号功能启用</span>
        </template>
        <template #right-icon>
          <van-switch
            :modelValue="autoAccept"
            @update:modelValue="$emit('update:autoAccept', $event)"
            size="24"
          />
        </template>
      </van-cell>

      <div v-show="autoAccept" class="alt-list-section">
        <div class="section-title">
          <van-icon name="user-o" size="16" color="#8c8c8c" />
          <span>小号列表</span>
        </div>

        <div v-if="userAlts.length === 0" class="empty-state">
          <van-empty description="暂无小号配置，点击添加按钮创建" class="empty-content" />
        </div>

        <div v-for="(alt, index) in userAlts" :key="`alt-${index}`" class="config-item-row">
          <div class="config-item-col alt-name-col">
            <div class="config-item-label">小号名称</div>
            <div class="config-item-value clickable" @click="openFriendPicker(alt)">
              <span class="value-text">{{ alt.userName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <div class="config-item-col alt-type-col">
            <div class="config-item-label">权限类型</div>
            <van-dropdown-menu class="alt-type-dropdown">
              <van-dropdown-item
                v-model="alt.type"
                :options="altTypeOptions"
                class="dropdown-item"
              />
            </van-dropdown-menu>
          </div>

          <div class="config-item-col action-col">
            <van-button
              class="delete-button"
              icon="delete-o"
              size="mini"
              type="danger"
              plain
              @click="deleteAlt(index)"
            />
          </div>
        </div>

        <van-button class="add-button" block type="primary" icon="add-o" @click="addAlt">
          添加小号配置
        </van-button>
      </div>
    </div>

    <!-- 好友选择器弹出层 -->
    <van-popup v-model:show="showFriendPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择好友</span>
      </div>
      <van-field
        placeholder="搜索好友名称..."
        right-icon="search"
        clearable
        v-model="searchFriend"
        @update:model-value="filterFriend"
        class="search-field"
      />
      <van-picker
        :columns="filteredFriends"
        @confirm="confirmFriend"
        class="custom-picker"
        show-toolbar
        cancel-button-text="取消"
        confirm-button-text="确认"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  autoAccept: {
    type: Boolean,
    default: false,
  },
  userAlts: {
    type: Array,
    default: () => [],
  },
  currentUser: {
    type: Object,
    required: true,
  },
  friends: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:autoAccept', 'update:userAlts'])

// ==================== 好友选择器 ====================
const showFriendPicker = ref(false)
const searchFriend = ref('')
const editingAlt = ref(null) // 当前正在编辑的小号对象
const filteredFriends = ref([...props.friends])

const filterFriend = () => {
  if (!searchFriend.value) {
    filteredFriends.value = [...props.friends]
    return
  }
  filteredFriends.value = props.friends.filter((f) =>
    f.text.toLowerCase().includes(searchFriend.value.toLowerCase()),
  )
}

const openFriendPicker = (alt) => {
  editingAlt.value = alt
  showFriendPicker.value = true
  // 重置搜索
  searchFriend.value = ''
  filteredFriends.value = [...props.friends]
}

const confirmFriend = ({ selectedOptions }) => {
  if (editingAlt.value) {
    editingAlt.value.openId = selectedOptions[0].value
    editingAlt.value.userName = selectedOptions[0].text
  }
  showFriendPicker.value = false
}

// ==================== 列表操作 ====================
const addAlt = () => {
  const newList = [...props.userAlts, { openId: '', userName: '', type: 0 }]
  emit('update:userAlts', newList)
}

const deleteAlt = (index) => {
  const newList = [...props.userAlts]
  newList.splice(index, 1)
  emit('update:userAlts', newList)
}

// ==================== 权限类型选项 ====================
const altTypeOptions = computed(() => {
  const base = [{ text: '基础功能（摸花/爬架子）', value: 0 }]
  if (props.currentUser?.subscribe?.ratio > 0) {
    base.push({ text: '完整功能', value: 1 })
  }
  return base
})
</script>

<style scoped>
/* 🍎 苹果磨砂玻璃卡片 */
.alt-config-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.03),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
  animation: appleCardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-header {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(200, 180, 190, 0.2) 30%,
    rgba(200, 180, 190, 0.2) 70%,
    transparent 100%
  );
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  letter-spacing: 0.3px;
}

.card-content {
  padding: 16px 20px;
}

.feature-cell {
  background-color: transparent;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.alt-list-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.config-item-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.config-item-row:last-child {
  border-bottom: none;
}

.config-item-col {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}

.alt-name-col {
  flex: 2;
}

.alt-type-col {
  flex: 1.8;
}

.action-col {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

.config-item-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.config-item-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:active {
  color: #1890ff;
}

.value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  color: #cccccc;
}

.alt-type-dropdown {
  --van-dropdown-menu-background: transparent !important;
  --van-dropdown-menu-shadow: none !important;
}

.dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 14px;
}

.delete-button {
  --van-button-danger-color: #ff4d4f;
  --van-button-border-radius: 6px;
  padding: 0;
  width: 32px;
  height: 32px;
}

.add-button {
  --van-button-primary-color: #1890ff;
  --van-button-border-radius: 12px;
  color: white;
  margin-top: 12px;
  height: 44px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.empty-state {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}

.empty-content :deep(.van-empty__image) {
  width: 80px;
  height: 80px;
}

.empty-content :deep(.van-empty__description) {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

/* 弹出层样式 */
.custom-popup {
  border-radius: 20px 20px 0 0;
  padding: 0;
  overflow: hidden;
}

.popup-header {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.search-field {
  margin: 16px 20px;
  --van-field-background-color: #f5f7fa;
  --van-field-border-radius: 12px;
}

.custom-picker {
  height: 300px;
  padding: 0 20px 20px;
}
</style>
