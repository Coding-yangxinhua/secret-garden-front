<template>
  <div class="config-card steal-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="flower" size="20" color="#ff6767" />
      <span class="apple-card-title">摸花管理</span>
    </div>
    <div class="apple-card-content">
      <!-- 摸花功能启用开关 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">摸花功能启用</div>
          <div class="apple-cell-label">可配置摸花好友、花种和次数上限</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :modelValue="localConfig.autoSteal"
            @update:modelValue="onAutoStealChange"
            size="22"
          />
        </div>
      </div>

      <!-- 摸花配置列表 -->
      <div v-show="localConfig.autoSteal" class="steal-list-section">
        <div class="apple-sub-header">
          <van-icon name="flower-o" size="14" color="#86868B" />
          <span>摸花配置</span>
        </div>

        <div v-if="localConfig.steals.length === 0" class="apple-empty">
          <div class="apple-empty-icon">
            <van-icon name="flower-o" size="40" color="#C7C7CC" />
          </div>
          <div class="apple-empty-text">暂无摸花配置</div>
          <div class="apple-empty-desc">点击下方按钮添加摸花配置</div>
        </div>

        <div v-for="(steal, index) in localConfig.steals" :key="`steal-${index}`" class="steal-row">
          <!-- 目标好友 -->
          <div class="steal-field-item friend-field">
            <div class="steal-field-label">目标好友</div>
            <div class="steal-field-value clickable" @click="openStealFriendPicker(steal)">
              <span class="value-text">{{ steal.townName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <!-- 摸花花种 -->
          <div class="steal-field-item flower-field">
            <div class="steal-field-label">摸花花种</div>
            <div class="steal-field-value clickable" @click="openStealFlowerPicker(steal)">
              <span class="value-text">{{ steal.seedName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <!-- 摸花次数 -->
          <div class="steal-field-item count-field">
            <div class="steal-field-label">摸花次数</div>
            <van-stepper
              v-model="steal.stealCount"
              :min="1"
              :max="steal.maxExchangeCount || 20"
              :step="1"
              integer
              size="small"
              class="steal-stepper"
              @change="updateConfig"
            />
          </div>

          <!-- 启用状态 -->
          <div class="steal-field-item switch-field">
            <div class="steal-field-label">启用</div>
            <van-switch
              :modelValue="steal.enable"
              @update:modelValue="
                (v) => {
                  steal.enable = v
                  updateConfig()
                }
              "
              size="20"
            />
          </div>

          <!-- 删除按钮 -->
          <button class="apple-delete-btn" @click="deleteSteal(index)">
            <van-icon name="delete-o" size="16" color="#FF3B30" />
          </button>
        </div>

        <button class="apple-add-btn" @click="addSteal">
          <van-icon name="add-o" size="16" />
          <span>添加摸花配置</span>
        </button>
      </div>
    </div>

    <!-- 好友选择器弹出层 -->
    <van-popup v-model:show="showFriendPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择好友</span>
        <van-icon name="cross" class="close-icon" @click="showFriendPicker = false" />
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

    <!-- 花种选择器弹出层 -->
    <van-popup v-model:show="showFlowerPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择花种</span>
        <van-icon name="cross" class="close-icon" @click="showFlowerPicker = false" />
      </div>
      <van-field
        placeholder="搜索花种名称..."
        right-icon="search"
        clearable
        v-model="searchSeed"
        @update:model-value="filterSeed"
        class="search-field"
      />
      <van-picker
        :columns="filteredSeeds"
        @confirm="confirmFlower"
        class="custom-picker"
        show-toolbar
        cancel-button-text="取消"
        confirm-button-text="确认"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import request from '@/utils/request'
import { showNotify } from 'vant'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ autoSteal: false, steals: [] }),
  },
  currentUser: {
    type: Object,
    required: true,
  },
  friends: {
    type: Array,
    default: () => [],
  },
  availableSeeds: {
    type: Array,
    default: () => [],
  },
  currentUserId: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// ==================== 本地配置 ====================
const localConfig = ref(JSON.parse(JSON.stringify(props.modelValue)))

watch(
  () => props.modelValue,
  (val) => {
    localConfig.value = JSON.parse(JSON.stringify(val))
  },
  { deep: true },
)

// 更新到父组件
const updateConfig = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localConfig.value)))
}

// 摸花开关变化
const onAutoStealChange = (val) => {
  localConfig.value.autoSteal = val
  updateConfig()
}

// ==================== 好友选择器 ====================
const showFriendPicker = ref(false)
const searchFriend = ref('')
const editingSteal = ref(null)
const filteredFriends = ref([])

// 初始化好友列表（添加"所有人"选项）
const getFriendOptions = () => {
  const list = [...(props.friends || [])]
  if (props.currentUser?.subscribe?.subscribeId > 0) {
    return [{ value: '-1', text: '所有人' }, ...list]
  }
  return list
}

watch(
  () => props.friends,
  () => {
    filteredFriends.value = getFriendOptions()
  },
  { immediate: true, deep: true },
)

const filterFriend = () => {
  if (!searchFriend.value) {
    filteredFriends.value = getFriendOptions()
    return
  }
  const kw = searchFriend.value.toLowerCase()
  filteredFriends.value = (props.friends || []).filter((f) => f.text?.toLowerCase().includes(kw))
  // 搜索时也保留"所有人"（如果存在）
  if (props.currentUser?.subscribe?.subscribeId > 0) {
    filteredFriends.value = [{ value: '-1', text: '所有人' }, ...filteredFriends.value]
  }
}

const openStealFriendPicker = (steal) => {
  editingSteal.value = steal
  showFriendPicker.value = true
  searchFriend.value = ''
  filterFriend()
}

const confirmFriend = async ({ selectedOptions }) => {
  const openId = selectedOptions[0].value
  const townName = selectedOptions[0].text
  if (editingSteal.value) {
    editingSteal.value.userId = openId
    editingSteal.value.townName = townName
    // 获取好友的鲜花信息和可摸花次数
    if (openId && openId !== '-1') {
      try {
        const { data } = await request({
          method: 'get',
          url: `/config/friendFlowers?userId=${props.currentUserId}&openId=${openId}`,
        })
        editingSteal.value.maxExchangeCount = data.exchangeCount || 20
      } catch {
        editingSteal.value.maxExchangeCount = 20
      }
    } else {
      editingSteal.value.maxExchangeCount = 20
    }
    updateConfig()
  }
  showFriendPicker.value = false
}

// ==================== 花种选择器 ====================
const showFlowerPicker = ref(false)
const searchSeed = ref('')
const filteredSeeds = ref([])

// 获取花种列表（含"所有花"选项）
const getSeedOptions = () => {
  return [
    { value: '-1', text: '所有花' },
    ...(props.availableSeeds || []).map((s) => ({ value: s.value, text: s.text })),
  ]
}

watch(
  () => props.availableSeeds,
  () => {
    filteredSeeds.value = getSeedOptions()
  },
  { immediate: true, deep: true },
)

const filterSeed = () => {
  const baseList = getSeedOptions()
  if (!searchSeed.value) {
    filteredSeeds.value = baseList
    return
  }
  const kw = searchSeed.value.toLowerCase()
  filteredSeeds.value = baseList.filter((f) => f.text?.toLowerCase().includes(kw))
}

const openStealFlowerPicker = (steal) => {
  editingSteal.value = steal
  showFlowerPicker.value = true
  searchSeed.value = ''
  filterSeed()
}

// 辅助：去除花种名称中括号及后面的内容
const removeTextAfterBracket = (inputString) => {
  if (!inputString) return ''
  const bracketIndex = inputString.indexOf('（')
  return bracketIndex !== -1 ? inputString.substring(0, bracketIndex).trim() : inputString
}

const confirmFlower = ({ selectedOptions }) => {
  if (editingSteal.value) {
    editingSteal.value.seedId = selectedOptions[0].value
    editingSteal.value.seedName = removeTextAfterBracket(selectedOptions[0].text)
    updateConfig()
  }
  showFlowerPicker.value = false
}

// ==================== 列表操作 ====================
const addSteal = () => {
  localConfig.value.steals.push({
    userId: '-1',
    townName: '所有人',
    seedId: '-1',
    seedName: '所有花',
    stealCount: 10,
    maxExchangeCount: 20,
    enable: true,
  })
  updateConfig()
}

const deleteSteal = (index) => {
  localConfig.value.steals.splice(index, 1)
  updateConfig()
  showNotify({
    type: 'success',
    message: '删除成功',
    duration: 1000,
  })
}
</script>

<style scoped>
/* ============================================================
   🍎 StealFlowerConfig — iOS 17 Settings 风格（gameId==1 摸花管理）
   ============================================================ */

.steal-config-card {
  margin-bottom: 16px;
}

.steal-list-section {
  margin-top: 12px;
}

/* ---------- 摸花配置行（flex 换行布局） ---------- */
.steal-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  gap: 8px;
}

.steal-row:last-child {
  border-bottom: none;
}

.steal-field-item {
  display: flex;
  flex-direction: column;
}

.friend-field {
  flex: 2;
  min-width: 120px;
}

.flower-field {
  flex: 2;
  min-width: 120px;
}

.count-field {
  flex: 1.2;
  min-width: 90px;
}

.switch-field {
  flex: 0.6;
  min-width: 50px;
}

.steal-field-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.steal-field-value {
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
  max-width: 80px;
}

.arrow-icon {
  color: #cccccc;
  flex-shrink: 0;
  margin-left: 4px;
}

.steal-stepper {
  width: 100px;
}

.apple-delete-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.apple-delete-btn:active {
  background-color: rgba(255, 59, 48, 0.1);
}

/* ---------- 弹出层样式 ---------- */
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
  justify-content: space-between;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-icon {
  cursor: pointer;
  font-size: 20px;
  color: #c7c7cc;
  padding: 4px;
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
