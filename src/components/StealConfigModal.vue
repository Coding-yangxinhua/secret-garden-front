<template>
  <div class="steal-config-card" v-if="user.gameId == 2">
    <div class="card-header" @click="toggleExpand('stealConfig')">
      <van-icon name="gift-o" size="20" color="#ff6767" />
      <span class="card-title">摸花配置</span>
      <van-icon
        name="arrow-down"
        size="16"
        :class="{ 'rotate-180': expandStates.stealConfig }"
        class="expand-icon"
      />
    </div>
    <div class="card-content" v-show="expandStates.stealConfig">
      <van-cell class="feature-cell" center label="可配置摸花对象、花种和次数上限">
        <template #title>
          <span class="feature-title">自动摸花</span>
        </template>
        <template #right-icon>
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.autoSteal"
            size="24"
            @change="onAutoStealChange"
          />
        </template>
      </van-cell>

      <!-- 摸花配置列表 -->
      <div v-show="localConfig.autoSteal" class="steal-list-section">
        <div class="section-title">
          <van-icon name="flower-o" size="16" color="#ff6b6b" />
          <span>摸花配置</span>
        </div>

        <div v-if="localConfig.steals.length === 0" class="empty-state">
          <van-empty description="暂无摸花配置，点击添加按钮创建" class="empty-content" />
        </div>

        <div
          v-for="(steal, index) in localConfig.steals"
          :key="`steal-${index}`"
          class="config-item-row steal-row"
        >
          <div class="config-item-col name-col">
            <div class="config-item-label">配置名称</div>
            <div class="config-item-value clickable" @click="editStealConfig(index)">
              <span class="value-text">{{ steal.name || '未命名配置' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <div class="config-item-col switch-col">
            <div class="config-item-label">启用状态</div>
            <van-switch
              :disabled="!localConfig"
              v-model="steal.status"
              size="20"
              @change="updateConfig"
            />
          </div>

          <div class="config-item-col action-col">
            <van-button
              class="delete-button"
              icon="delete-o"
              size="mini"
              type="danger"
              plain
              @click="deleteSteal(index)"
            />
          </div>
        </div>

        <van-button class="add-button" block type="primary" icon="add-o" @click="addSteal">
          添加摸花配置
        </van-button>
      </div>
    </div>
  </div>

  <!-- Portal 弹窗 - 渲染到body层级 -->
  <teleport to="body" v-if="showStealDetail">
    <div class="custom-popup-overlay" @click="closePopup">
      <div class="custom-popup" @click.stop>
        <div class="popup-header">
          <span class="popup-title">{{
            editingIndex === -1 ? '新增摸花配置' : '编辑摸花配置'
          }}</span>
          <van-icon name="cross" class="close-icon" @click="closePopup" />
        </div>
        <div class="popup-content">
          <van-field
            v-model="editingSteal.name"
            label="配置名称"
            placeholder="请输入配置名称"
            class="config-field"
          />

          <van-cell title="摸花对象" :border="false" class="section-title-cell-optimized" />

          <!-- 优化后的摸花对象选择区域 - 小尺寸横排 -->
          <div class="steal-type-horizontal">
            <div
              v-for="typeOption in typeOptions"
              :key="typeOption.value"
              class="type-option-small"
              :class="{
                selected: editingSteal.type.includes(typeOption.value),
                disabled: isOptionDisabled(typeOption.value),
              }"
              @click="toggleType(typeOption.value)"
            >
              <div class="option-text">{{ typeOption.label }}</div>
            </div>
          </div>

          <div v-if="editingSteal.type.includes(4)" class="friend-selection">
            <van-cell title="指定好友" :border="false" class="section-title-cell" />

            <!-- 好友气泡展示区域 -->
            <div class="selected-friends-container">
              <div
                v-for="selectedFriend in selectedFriendsList"
                :key="`selected-${selectedFriend.userId}`"
                class="friend-chip"
              >
                {{ selectedFriend.townName }}
                <van-icon
                  name="cross"
                  class="remove-friend-icon"
                  @click="removeSelectedFriend(selectedFriend.userId)"
                />
              </div>

              <!-- 下拉选择器 -->
              <div class="friend-dropdown-wrapper" v-click-outside="handleClickOutside">
                <van-field
                  readonly
                  clickable
                  label=""
                  placeholder="点击添加好友"
                  @click="toggleFriendDropdown"
                  class="friend-selector-field"
                />

                <!-- 下拉菜单 -->
                <div v-show="showFriendDropdown" class="friend-dropdown">
                  <div class="dropdown-search">
                    <van-field
                      v-model="searchQuery"
                      placeholder="搜索好友..."
                      left-icon="search"
                      clearable
                    />
                  </div>

                  <div class="dropdown-options">
                    <div
                      v-for="friend in filteredFriends"
                      :key="`friend-${friend.userId}`"
                      class="friend-option"
                      @click="toggleFriendSelection(friend.userId)"
                    >
                      <label class="checkbox-label">
                        <input
                          type="checkbox"
                          :checked="tempFriendIds.includes(friend.userId)"
                          @change="updateFriendSelection(friend.userId)"
                          class="native-checkbox"
                        />
                        <span class="custom-checkbox"></span>
                      </label>
                      <span class="friend-name">{{ friend.townName }}</span>
                    </div>

                    <div v-if="filteredFriends.length === 0" class="no-results">
                      没有找到匹配的好友
                    </div>
                  </div>

                  <!-- 确认按钮 -->
                  <div class="dropdown-footer" v-if="showFriendDropdown">
                    <van-button
                      type="primary"
                      block
                      round
                      @click="confirmFriendSelection"
                      class="confirm-button"
                    >
                      确定
                    </van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <van-cell title="摸花品质" :border="false" class="section-title-cell-optimized" />
          <quality-color-selector v-model="editingSteal.color" class="color-selector" />
          <van-cell
            title="具体配置"
            :border="false"
            class="section-title-cell-optimized"
            label="理论上不会摸主花副花，注意观察哦"
          />
          <van-cell-group inset class="switch-group">
            <van-cell
              title="摸星灵（请在好友同意下使用哦）"
              :border="false"
              label="开启后会优先摸星灵，星灵没满时，会保留一定次数留给星灵"
              :class="{ 'disabled-cell': isSpecialDisabled }"
            >
              <template #right-icon>
                <van-switch
                  v-model="editingSteal.special"
                  size="20"
                  active-color="#ff6b6b"
                  :disabled="isSpecialDisabled"
                  @change="onSpecialToggle"
                />
              </template>
            </van-cell>
            <van-cell title="摸花次数" :border="false" label="-1为次数摸满">
              <custom-array-stepper
                :min="-1"
                :max="maxStealCount"
                :step="1"
                v-model="editingSteal.stealCount"
                :inputDisabled="false"
                class="steal-stepper"
                @change="updateEditingConfig"
              >
              </custom-array-stepper>
            </van-cell>
            <van-cell v-show="editingSteal.stealCount != 0" title="只摸没有的花" :border="false">
              <template #right-icon>
                <van-switch
                  v-model="editingSteal.unowned"
                  size="20"
                  active-color="#ff6b6b"
                  @change="updateEditingConfig"
                />
              </template>
            </van-cell>
          </van-cell-group>

          <div class="popup-actions">
            <van-button type="default" @click="cancelEdit" class="popup-cancel-btn"
              >取消</van-button
            >
            <van-button type="primary" @click="saveStealConfig" class="popup-save-btn"
              >保存</van-button
            >
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showNotify } from 'vant'
import QualityColorSelector from '@/components/QualityColorSelector.vue'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'

// 模拟request函数，实际项目中需要替换为真实的API调用
const request = async ({ method, url }) => {
  console.log(`模拟请求: ${method} ${url}`)
  // 模拟返回数据
  return {
    data: {
      exchangeCount: 15,
    },
  }
}

// 自定义指令：点击外部关闭下拉框
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  config: {
    type: Object,
    required: true,
    default: () => ({
      autoSteal: false,
      steals: [],
    }),
  },
  friends: {
    type: Array,
    default: () => [],
  },
  expandStates: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:config'])

// 使用本地状态来避免直接修改props
const localConfig = ref(JSON.parse(JSON.stringify(props.config)))

// 监听props.config的变化，同步到本地状态
watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = JSON.parse(JSON.stringify(newConfig))
  },
  { deep: true },
)

const showStealDetail = ref(false)
const editingIndex = ref(-1)
const editingSteal = ref({
  name: '',
  type: [], // 存储为整数数组 [1, 2, 3, 4]
  friendIds: [],
  color: [],
  special: false,
  unowned: false,
  stealCount: 10,
  status: true,
})

// 好友选择相关状态
const showFriendDropdown = ref(false)
const searchQuery = ref('')
const tempFriendIds = ref([])

// 摸花对象选项配置 - 移除图标
const typeOptions = [
  { value: 1, label: '所有人' },
  { value: 2, label: '公会' },
  { value: 3, label: '闺蜜' },
  { value: 4, label: '好友' },
]

// 计算属性：获取选中的好友列表
const selectedFriendsList = computed(() => {
  return props.friends.filter((friend) => editingSteal.value.friendIds.includes(friend.userId))
})

// 计算属性：过滤好友列表
const filteredFriends = computed(() => {
  if (!searchQuery.value) {
    return props.friends
  }
  return props.friends.filter(
    (friend) =>
      (friend.text || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (friend.townName || '').toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// 计算属性：获取最大摸花次数
const maxStealCount = computed(() => {
  if (!editingSteal.value.type || editingSteal.value.type.length === 0) {
    return 20
  }

  // 定义各种类型的最大次数
  const typeLimits = {
    1: 20, // 所有人
    2: 30, // 公会
    3: 30, // 闺蜜
    4: null, // 指定好友，需要单独计算
  }

  // 获取当前选中类型中的基础限制
  const baseLimits = editingSteal.value.type
    .map((type) => typeLimits[type])
    .filter((limit) => limit !== undefined)

  // 如果包含了指定好友类型，计算好友的stealMax最小值
  let friendLimit = Infinity
  if (editingSteal.value.type.includes(4) && editingSteal.value.friendIds.length > 0) {
    const selectedFriends = props.friends.filter((friend) =>
      editingSteal.value.friendIds.includes(friend.userId),
    )

    if (selectedFriends.length > 0) {
      friendLimit = Math.min(
        ...selectedFriends.map(
          (friend) => friend.stealMax || Infinity, // 如果没有stealMax字段，默认为无穷大
        ),
      )
    }
  }

  // 综合考虑所有限制，取最小值
  const allLimits = [...baseLimits, friendLimit].filter(
    (limit) => limit !== null && limit !== Infinity,
  )

  if (allLimits.length === 0) {
    return 20 // 如果没有有效限制，返回默认值
  }

  return Math.min(...allLimits, 99) // 最大值不超过99
})

// 计算属性：判断摸星灵选项是否被禁用
const isSpecialDisabled = computed(() => {
  // 如果选择了"所有人"选项，则禁用摸星灵
  return editingSteal.value.type.includes(1)
})

// 监听编辑好友ID变化，同步到临时变量
watch(
  () => editingSteal.value.friendIds,
  (newVal) => {
    tempFriendIds.value = [...newVal]
  },
  { deep: true },
)

// 监听选中好友变化，更新摸花次数的最大值
watch(
  () => editingSteal.value.friendIds,
  () => {
    if (editingSteal.value.type.includes(4) && editingSteal.value.friendIds.length > 0) {
      // 如果当前摸花次数超过了新的最大值，则调整为最大值
      if (editingSteal.value.stealCount > maxStealCount.value) {
        editingSteal.value.stealCount = maxStealCount.value
      }
    }
  },
  { deep: true },
)

// 监听类型变化，更新摸花次数
watch(
  () => editingSteal.value.type,
  (newType) => {
    if (newType.includes(1)) {
      editingSteal.value.stealCount = Math.min(editingSteal.value.stealCount, 20)
    } else if (newType.includes(2) || newType.includes(3)) {
      editingSteal.value.stealCount = Math.min(editingSteal.value.stealCount, 30)
    } else if (newType.includes(4) && editingSteal.value.friendIds.length > 0) {
      // 指定好友时，设置为最大可用次数
      editingSteal.value.stealCount = Math.min(editingSteal.value.stealCount, maxStealCount.value)
    }

    // 如果选择了"所有人"且开启了摸星灵，则关闭摸星灵
    if (newType.includes(1) && editingSteal.value.special) {
      editingSteal.value.special = false
      updateEditingConfig()
    }
  },
  { deep: true },
)

// 监听props.config的变化，强制触发响应式更新
watch(
  () => props.config?.steals,
  (newSteals) => {},
  { deep: true },
)

// 判断选项是否被禁用
const isOptionDisabled = (value) => {
  // 如果当前选中了"所有人"，则禁用其他选项
  if (editingSteal.value.type.includes(1) && value !== 1) {
    return true
  }
  return false
}

// 切换摸花对象选择
const toggleType = (typeValue) => {
  // 如果当前点击的是"所有人"选项
  if (typeValue === 1) {
    // 如果还没有选中"所有人"，则清除其他所有选项
    if (!editingSteal.value.type.includes(typeValue)) {
      editingSteal.value.type = [1] // 只保留"所有人"
      // 如果当前开启了摸星灵，则关闭它
      if (editingSteal.value.special) {
        editingSteal.value.special = false
        updateEditingConfig()
      }
    } else {
      // 如果已经选中了"所有人"，则移除它
      const index = editingSteal.value.type.indexOf(typeValue)
      if (index > -1) {
        editingSteal.value.type.splice(index, 1)
      }
    }
  } else {
    // 如果当前选中了"所有人"，不能选择其他选项
    if (editingSteal.value.type.includes(1)) {
      return
    }

    const index = editingSteal.value.type.indexOf(typeValue)
    if (index > -1) {
      // 如果已选中则取消选中
      editingSteal.value.type.splice(index, 1)
    } else {
      // 如果未选中则添加选中
      editingSteal.value.type.push(typeValue)
    }
  }

  // 确保类型数组中的值都是数字
  editingSteal.value.type = editingSteal.value.type.map((item) => Number(item))
  updateEditingConfig()
}

// 摸星灵选项切换处理
const onSpecialToggle = (value) => {
  // 如果开启了摸星灵并且选中了"所有人"，则从类型中移除"所有人"
  if (value && editingSteal.value.type.includes(1)) {
    const index = editingSteal.value.type.indexOf(1)
    if (index > -1) {
      editingSteal.value.type.splice(index, 1)
    }
  }
  updateEditingConfig()
}

// 切换展开状态
const toggleExpand = (key) => {
  if (props.expandStates && typeof props.expandStates === 'object') {
    props.expandStates[key] = !props.expandStates[key]
    // 触发更新事件
    emit('update-expand-states', props.expandStates)
  }
}

// 更新配置到父组件
const updateConfig = () => {
  emit('update:config', JSON.parse(JSON.stringify(localConfig.value)))
}

// 更新编辑中的配置
const updateEditingConfig = () => {
  // 深拷贝当前编辑的配置，防止直接修改
  const updatedSteal = JSON.parse(JSON.stringify(editingSteal.value))
  // 确保类型数组中的值都是数字
  updatedSteal.type = updatedSteal.type.map((item) => Number(item))
  // 更新本地配置中的对应项
  if (editingIndex.value !== -1) {
    localConfig.value.steals[editingIndex.value] = updatedSteal
    updateConfig()
  }
}

// 自动摸花开关变化
const onAutoStealChange = () => {
  updateConfig()
}

// 添加摸花配置
const addSteal = () => {
  editingIndex.value = -1
  editingSteal.value = {
    name: `摸花配置${localConfig.value.steals.length + 1}`,
    type: [], // 存储为整数数组
    friendIds: [],
    color: [],
    special: false,
    unowned: false,
    stealCount: 10,
    status: true,
  }
  tempFriendIds.value = []
  showStealDetail.value = true
}

// 删除摸花配置
const deleteSteal = (index) => {
  // 创建一个新的配置对象，避免直接修改props
  const newConfig = JSON.parse(JSON.stringify(localConfig.value))
  newConfig.steals.splice(index, 1)

  // 强制触发响应式更新 - 使用替换整个数组的方式
  localConfig.value = newConfig

  // 发送更新事件
  updateConfig()
  showNotify({
    type: 'success',
    message: '删除成功',
    duration: 1000,
  })
}

// 编辑摸花配置
const editStealConfig = (index) => {
  editingIndex.value = index
  // 深拷贝当前配置项，避免直接修改props
  editingSteal.value = JSON.parse(JSON.stringify(localConfig.value.steals[index]))
  // 确保类型数组中的值都是数字
  editingSteal.value.type = editingSteal.value.type.map((item) => Number(item))
  tempFriendIds.value = [...editingSteal.value.friendIds]
  showStealDetail.value = true
}

// 移除选中的好友
const removeSelectedFriend = (friendId) => {
  const index = editingSteal.value.friendIds.indexOf(friendId)
  if (index > -1) {
    editingSteal.value.friendIds.splice(index, 1)
    // 同步更新临时变量
    const tempIndex = tempFriendIds.value.indexOf(friendId)
    if (tempIndex > -1) {
      tempFriendIds.value.splice(tempIndex, 1)
    }
    updateEditingConfig()
  }
}

// 切换好友下拉框显示状态
const toggleFriendDropdown = () => {
  showFriendDropdown.value = !showFriendDropdown.value
  if (showFriendDropdown.value) {
    // 打开时复制当前选中的好友到临时变量
    tempFriendIds.value = [...editingSteal.value.friendIds]
  }
}

// 处理点击外部事件
const handleClickOutside = () => {
  if (showFriendDropdown.value) {
    // 点击外部时，将临时变量的值同步回编辑状态
    editingSteal.value.friendIds = [...tempFriendIds.value]
    showFriendDropdown.value = false
    searchQuery.value = ''
  }
}

// 切换好友选择状态
const toggleFriendSelection = (friendId) => {
  const index = tempFriendIds.value.indexOf(friendId)
  if (index > -1) {
    // 已选中，取消选中
    tempFriendIds.value.splice(index, 1)
  } else {
    // 未选中，添加选中
    tempFriendIds.value.push(friendId)
  }
}

// 更新好友选择状态 - 用于checkbox change事件
const updateFriendSelection = (friendId) => {
  const index = tempFriendIds.value.indexOf(friendId)
  if (index > -1) {
    // 已选中，取消选中
    tempFriendIds.value.splice(index, 1)
  } else {
    // 未选中，添加选中
    tempFriendIds.value.push(friendId)
  }
}

// 确认好友选择
const confirmFriendSelection = () => {
  // 确保存储的是userId
  const validFriendIds = tempFriendIds.value
  editingSteal.value.friendIds = [...validFriendIds]
  showFriendDropdown.value = false
  searchQuery.value = ''
  updateEditingConfig()
}

// 保存摸花配置
const saveStealConfig = async () => {
  if (!editingSteal.value.name.trim()) {
    showNotify({
      type: 'warning',
      message: '请输入配置名称',
      duration: 2000,
    })
    return
  }

  if (editingSteal.value.type.length === 0) {
    showNotify({
      type: 'warning',
      message: '请选择摸花对象',
      duration: 2000,
    })
    return
  }

  // 如果选择了指定好友，验证是否选择了好友
  if (editingSteal.value.type.includes(4) && editingSteal.value.friendIds.length === 0) {
    showNotify({
      type: 'warning',
      message: '请选择指定好友',
      duration: 2000,
    })
    return
  }

  // 创建一个新的配置对象，避免直接修改props
  const newConfig = JSON.parse(JSON.stringify(localConfig.value))

  // 确保类型数组中的值都是数字
  const updatedSteal = {
    ...editingSteal.value,
    type: editingSteal.value.type.map((item) => Number(item)),
  }

  if (editingIndex.value === -1) {
    // 新增配置
    newConfig.steals = [...newConfig.steals, updatedSteal]
    showNotify({
      type: 'success',
      message: '添加成功',
      duration: 1000,
    })
  } else {
    // 更新现有配置
    const updatedSteals = [...newConfig.steals]
    updatedSteals[editingIndex.value] = updatedSteal
    newConfig.steals = updatedSteals
    showNotify({
      type: 'success',
      message: '更新成功',
      duration: 1000,
    })
  }

  // 更新本地配置
  localConfig.value = newConfig

  // 发送更新事件
  updateConfig()
  closePopup()
}

// 取消编辑
const cancelEdit = () => {
  closePopup()
}

// 关闭弹窗
const closePopup = () => {
  showStealDetail.value = false
  showFriendDropdown.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
.steal-config-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.card-content {
  padding: 16px 20px;
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #7f8c8d;
}

.rotate-180 {
  transform: rotate(180deg);
}

.feature-cell {
  background-color: transparent;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.steal-list-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
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

.name-col {
  flex: 3;
}

.switch-col {
  flex: 1.2;
}

.action-col {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

.config-item-label {
  font-size: 12px;
  color: #8c8c8d;
  margin-bottom: 4px;
  font-weight: 500;
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
  color: #ff6b6b;
}

.value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  color: #bdc3c7;
  transition: transform 0.2s ease;
}

.delete-button {
  --van-button-danger-color: #ff6b6b;
  --van-button-border-radius: 8px;
  padding: 0;
  width: 36px;
  height: 36px;
  border: 1px solid #ffe0e0;
}

.add-button {
  --van-button-border-radius: 14px;
  color: white;
  margin-top: 16px;
  height: 48px;
  font-weight: 500;
  font-size: 16px;
  border: none;
  transition: all 0.3s ease;
}

.add-button:active {
  transform: translateY(-2px);
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
  color: #8c8c8d;
  margin-top: 8px;
}

/* 自定义弹窗样式 - 修复z-index层级问题 */
.custom-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7));
  z-index: 10001; /* 提高层级确保高于底部导航 */
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
  /* 防止父容器滚动 */
  touch-action: none;
  overscroll-behavior: contain;
}

.custom-popup {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 20px 20px 0 0;
  width: 90%;
  max-width: 420px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  /* 防止内容区域滚动影响父元素 */
  overscroll-behavior: contain;
}

.popup-header {
  padding: 20px 24px 16px;
  background: linear-gradient(to right, #fff5f5, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.close-icon {
  cursor: pointer;
  font-size: 22px;
  color: #95a5a6;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-icon:hover {
  color: #ff6b6b;
  background: #f8f9fa;
}

.popup-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  /* 防止内容区域滚动影响父元素 */
  overscroll-behavior: contain;
}

.config-field {
  margin-bottom: 20px;
  --van-field-input-text-color: #2c3e50;
  --van-field-label-color: #7f8c8d;
  --van-field-border-color: #e0e0e0;
  border-radius: 12px;
  padding: 12px 16px;
}

.section-title-cell {
  --van-cell-background: transparent;
  --van-cell-text-color: #ff6b6b;
  --van-cell-font-size: 15px;
  --van-cell-line-height: 1.5;
  margin: 20px 0 12px;
  padding: 0;
  font-weight: 500;
}

/* 优化后的标题单元格样式 */
.section-title-cell-optimized {
  --van-cell-background: transparent;
  --van-cell-text-color: #ff6b6b;
  --van-cell-font-size: 15px;
  --van-cell-line-height: 1.5;
  margin: 20px 0 12px;
  padding: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title-cell-optimized::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #ff6b6b, #ff8e8e);
  border-radius: 2px;
  margin-right: 8px;
}

/* 横向排列的小尺寸摸花对象选择 */
.steal-type-horizontal {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.type-option-small {
  flex: 1;
  padding: 8px 4px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  text-align: center;
  font-size: 12px;
  color: #2c3e50;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-option-small.selected {
  border-color: #ff6b6b;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
}

.type-option-small.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e0e0e0;
  color: #999;
  border-color: #ccc;
}

.color-selector {
  margin-bottom: 20px;
}

.friend-selection {
  margin-bottom: 20px;
  padding: 0px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #eee;
}

.switch-group {
  margin: 20px 0;
  background: transparent;
  --van-cell-padding: 14px 16px;
  --van-cell-background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.popup-cancel-btn {
  flex: 1;
  border-radius: 12px;
  height: 48px;
  font-weight: 500;
  border: 1px solid #e0e0e0;
  color: #7f8c8d;
  background: #f8f9fa;
}

.popup-save-btn {
  flex: 1;
  border-radius: 12px;
  height: 48px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
}

.popup-cancel-btn:active,
.popup-save-btn:active {
  transform: scale(0.98);
}

/* 好友选择区域 */
.selected-friends-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.friend-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
}

.remove-friend-icon {
  font-size: 12px;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.remove-friend-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.friend-selector-field {
  width: 100%;
  margin-top: 8px;
  --van-field-input-text-color: #95a5a6;
  --van-field-placeholder-text-color: #bdc3c7;
  border-radius: 8px;
  background: white;
  border: 1px solid #e0e0e0;
}

.friend-dropdown-wrapper {
  position: relative;
  width: 100%;
}

.friend-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 10002; /* 下拉框也需要更高的层级 */
  margin-top: 8px;
  border: 1px solid #e0e0e0;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.dropdown-options {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  background: #fff;
}

.friend-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin: 0 8px 2px;
}

.friend-option:hover {
  background-color: #f8f9fa;
}

.friend-name {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
}

.dropdown-footer {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.confirm-button {
  --van-button-primary-color: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  --van-button-border-radius: 12px;
  height: 40px;
  font-weight: 500;
}

/* 自定义复选框样式 */
.checkbox-label {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.native-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-label:hover .custom-checkbox {
  border-color: #ff6b6b;
}

.native-checkbox:checked + .custom-checkbox {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
}

.custom-checkbox:after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.native-checkbox:checked + .custom-checkbox:after {
  display: block;
}

/* 摸星灵选项禁用样式 */
.disabled-cell {
  opacity: 0.6;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 响应式适配 - 修复移动端按钮问题 */
@media (max-width: 375px) {
  .config-item-row {
    align-items: flex-start;
    gap: 8px;
  }

  .config-item-col {
    width: 100%;
    margin-right: 0;
  }

  .action-col {
    align-self: flex-end;
  }

  .type-option-small {
    flex: calc(50% - 4px); /* 在小屏幕上每行两个 */
  }

  .popup-actions {
    flex-direction: row;
    gap: 12px;
  }

  .popup-cancel-btn,
  .popup-save-btn {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  }

  .friend-dropdown {
    max-height: 250px;
  }

  /* 确保弹窗内容区域不会导致页面滚动 */
  .custom-popup {
    max-height: 80vh;
  }

  /* 调整按钮在小屏幕上的间距 */
  .popup-actions {
    margin-top: 16px;
  }
}

/* 修复遮罩层拖拽问题 */
.custom-popup-overlay {
  -webkit-overflow-scrolling: touch;
  /* 防止在iOS设备上出现页面滚动 */
  position: fixed;
  overscroll-behavior: none;
}

/* 修复弹窗圆角样式 */
.custom-popup {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 优化按钮样式 */
.popup-cancel-btn,
.popup-save-btn {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>