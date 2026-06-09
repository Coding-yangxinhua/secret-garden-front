<template>
  <div class="steal-config-card apple-card" v-if="user.gameId == 2">
    <div class="apple-card-header">
      <cute-icon name="flower" size="20" color="#ff6767" />
      <span class="apple-card-title">摸花配置</span>
    </div>
    <div class="apple-card-content">
      <!-- 自动摸花开关 -->
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动摸花</div>
          <div class="apple-cell-label">可配置摸花对象、花种和次数上限</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :disabled="!localConfig"
            v-model="localConfig.autoSteal"
            size="22"
            @change="onAutoStealChange"
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

        <div v-for="(steal, index) in localConfig.steals" :key="`steal-${index}`" class="apple-row">
          <div class="apple-row-item steal-name-item" @click="editStealConfig(index)">
            <div class="apple-row-label">配置名称</div>
            <div class="apple-row-value">
              <span class="apple-row-text">{{ steal.name || '未命名配置' }}</span>
              <van-icon name="arrow" size="12" color="#C7C7CC" />
            </div>
          </div>

          <div class="apple-row-item steal-status-item">
            <div class="apple-row-label">启用状态</div>
            <div class="apple-row-value">
              <van-switch
                :disabled="!localConfig"
                v-model="steal.status"
                size="20"
                @change="updateConfig"
              />
            </div>
          </div>

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
          <!-- 配置名称 -->
          <div class="apple-cell popup-field-cell">
            <div class="apple-cell-left">
              <div class="apple-cell-title">配置名称</div>
            </div>
            <div class="apple-cell-right">
              <van-field
                v-model="editingSteal.name"
                placeholder="请输入配置名称"
                class="config-field"
              />
            </div>
          </div>

          <!-- 摸花对象 -->
          <div class="apple-sub-header popup-section-label">
            <van-icon name="contact-o" size="14" color="#86868B" />
            <span>摸花对象</span>
          </div>

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

          <!-- 指定好友 -->
          <div v-if="editingSteal.type.includes(4)" class="friend-selection">
            <div class="apple-sub-header popup-section-label">
              <van-icon name="friends-o" size="14" color="#86868B" />
              <span>指定好友</span>
            </div>

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

              <div class="friend-dropdown-wrapper" v-click-outside="handleClickOutside">
                <van-field
                  readonly
                  clickable
                  label=""
                  placeholder="点击添加好友"
                  @click="toggleFriendDropdown"
                  class="friend-selector-field"
                />

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

          <!-- 摸花品质 -->
          <div class="apple-sub-header popup-section-label">
            <van-icon name="star-o" size="14" color="#86868B" />
            <span>摸花品质</span>
          </div>
          <quality-color-selector v-model="editingSteal.color" class="color-selector" />

          <!-- 具体配置 -->
          <div class="apple-sub-header popup-section-label">
            <van-icon name="setting-o" size="14" color="#86868B" />
            <span>具体配置</span>
          </div>

          <div class="apple-sub-section steal-sub-section">
            <div class="apple-cell">
              <div class="apple-cell-left">
                <div class="apple-cell-title">摸星灵</div>
                <div class="apple-cell-label">开启后会优先摸星灵，星灵没满时保留一定次数</div>
              </div>
              <div class="apple-cell-right">
                <van-switch
                  v-model="editingSteal.special"
                  size="20"
                  :disabled="isSpecialDisabled"
                  @change="onSpecialToggle"
                />
              </div>
            </div>

            <div class="apple-cell">
              <div class="apple-cell-left">
                <div class="apple-cell-title">摸花次数</div>
                <div class="apple-cell-label">-1为次数摸满</div>
              </div>
              <div class="apple-cell-right">
                <custom-array-stepper
                  :min="-1"
                  :max="maxStealCount"
                  :step="1"
                  v-model="editingSteal.stealCount"
                  :inputDisabled="false"
                  class="steal-stepper"
                  @change="updateEditingConfig"
                />
              </div>
            </div>

            <div class="apple-cell" v-show="editingSteal.stealCount != 0">
              <div class="apple-cell-left">
                <div class="apple-cell-title">只摸没有的花</div>
                <div class="apple-cell-label">仅摸取尚未拥有的花种</div>
              </div>
              <div class="apple-cell-right">
                <van-switch
                  v-model="editingSteal.unowned"
                  size="20"
                  @change="updateEditingConfig"
                />
              </div>
            </div>
          </div>

          <div class="popup-actions">
            <button type="button" class="popup-cancel-btn" @click="cancelEdit">取消</button>
            <button type="button" class="popup-save-btn" @click="saveStealConfig">保存</button>
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
/* ============================================================
   🌸 StealConfigModal — iOS 17 Settings 风格
   通用样式见 apple-card.css（全局），此处仅处理组件特有覆写
   ============================================================ */

/* ---------- 卡片容器微调 ---------- */
.steal-config-card {
  margin-bottom: 16px;
}

/* ⚠️ 覆盖全局 apple-card 部分 padding，使其更紧凑 */
.steal-config-card .apple-card-header {
  padding: 16px 16px 0;
}

.steal-config-card .apple-card-content {
  padding: 4px 16px 12px;
}

/* 摸花配置列表缩进 */
.steal-list-section {
  margin-top: 12px;
}

/* ---------- 配置名 + 状态行（apple-row 内） ---------- */
.steal-name-item {
  flex: 1.5;
}

.steal-status-item {
  flex: 0.8;
}

/* ---------- 横向选择按钮（摸花对象） ---------- */
.steal-type-horizontal {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.type-option-small {
  flex: 1;
  padding: 10px 4px;
  border: 1.5px solid var(--apple-separator, rgba(60, 60, 67, 0.12));
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--apple-text-primary, #1d1d1f);
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  letter-spacing: -0.1px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.type-option-small.selected {
  border-color: #ff6767;
  background: #ff6767;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 103, 103, 0.25);
}

.type-option-small.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.type-option-small:not(.disabled):active {
  transform: scale(0.96);
}

/* ---------- 品质选择器间距 ---------- */
.color-selector {
  margin-bottom: 18px;
}

/* ---------- 好友选择区域 ---------- */
.friend-selection {
  margin-bottom: 18px;
  padding: 0 12px 12px;
  background: var(--apple-bg-tertiary, rgba(242, 242, 247, 0.5));
  border-radius: 12px;
  border: 1px solid var(--apple-separator-light, rgba(60, 60, 67, 0.04));
}

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
  background: #ff6767;
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

.remove-friend-icon:active {
  background-color: rgba(255, 255, 255, 0.25);
}

.friend-selector-field {
  width: 100%;
  --van-field-input-text-color: #86868b;
  --van-field-placeholder-text-color: #aeaeb2;
  border-radius: 8px;
  background: white;
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
  background: rgba(250, 250, 252, 0.95);
  backdrop-filter: blur(40px) saturate(1.5);
  -webkit-backdrop-filter: blur(40px) saturate(1.5);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 10002;
  margin-top: 8px;
  border: 0.5px solid rgba(60, 60, 67, 0.12);
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-search {
  padding: 12px;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.08);
  background: transparent;
}

.dropdown-options {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  background: transparent;
}

.friend-option {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-radius: 6px;
  margin: 0 8px 2px;
}

.friend-option:active {
  background-color: rgba(0, 0, 0, 0.04);
}

.friend-name {
  flex: 1;
  font-size: 15px;
  font-weight: 400;
  color: var(--apple-text-primary, #1d1d1f);
}

.no-results {
  padding: 16px;
  text-align: center;
  color: var(--apple-text-tertiary, #aeaeb2);
  font-size: 14px;
}

.dropdown-footer {
  padding: 10px 12px;
  background: transparent;
  border-top: 0.5px solid rgba(60, 60, 67, 0.08);
}

.confirm-button {
  --van-button-primary-color: #ff6767;
  --van-button-border-radius: 12px;
  height: 40px;
  font-weight: 500;
}

/* ---------- 自定义复选框 ---------- */
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
  border: 2px solid #c7c7cc;
  border-radius: 5px;
  transition: all 0.2s ease;
}

.checkbox-label:hover .custom-checkbox {
  border-color: #ff6767;
}

.native-checkbox:checked + .custom-checkbox {
  background-color: #ff6767;
  border-color: #ff6767;
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

/* ---------- 弹窗遮罩 + 内容 ---------- */
.custom-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
  touch-action: none;
  overscroll-behavior: contain;
}

.custom-popup {
  width: 92%;
  max-width: 420px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  overscroll-behavior: contain;
  /* 实心底色 + 磨砂玻璃效果 */
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
}

.popup-header {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.08);
  position: relative;
}

.popup-title {
  font-size: 20px;
  font-weight: 630;
  line-height: 1.2;
  letter-spacing: -0.3px;
  color: var(--apple-text-primary, #1d1d1f);
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Display', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

.close-icon {
  cursor: pointer;
  font-size: 22px;
  color: var(--apple-text-quaternary, #c7c7cc);
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  background: rgba(242, 242, 247, 0.6);
}

.close-icon:active {
  background: rgba(229, 229, 234, 0.8);
  color: #86868b;
}

.popup-content {
  padding: 20px 20px 24px;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ---------- 弹窗内样式 ---------- */
.popup-section-label {
  margin-top: 18px;
  margin-bottom: 8px;
}

/* 配置名称 — 内嵌 apple-cell 形式 */
.popup-field-cell {
  padding: 4px 0 8px !important;
}

.popup-field-cell .apple-cell-left {
  margin-right: 4px;
}

.popup-field-cell .apple-cell-title {
  white-space: nowrap;
  font-size: 15px;
}

.popup-field-cell .config-field {
  width: 100%;
  margin: 0;
  --van-field-input-text-color: var(--apple-text-primary, #1d1d1f);
  --van-field-placeholder-text-color: var(--apple-text-quaternary, #c7c7cc);
  --van-field-background: transparent;
  --van-cell-background: transparent;
  --van-field-border: none;
  --van-cell-border: none;
  border: none;
  background: transparent;
  padding: 0;
  text-align: right;
  font-size: 15px;
  font-weight: 400;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
}

/* 具体配置子分区开关组加一点内边距 */
.steal-sub-section {
  margin-top: 4px;
}

/* ---------- 弹窗操作按钮 ---------- */
.popup-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
  padding-top: 14px;
  border-top: 0.5px solid rgba(60, 60, 67, 0.08);
}

.popup-cancel-btn,
.popup-save-btn {
  flex: 1;
  height: 38px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.2px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.popup-cancel-btn {
  border: 0.5px solid rgba(60, 60, 67, 0.12);
  color: var(--apple-text-primary, #1d1d1f);
  background: var(--apple-bg-secondary, #f2f2f7);
}

.popup-save-btn {
  border: none;
  color: white;
  background: #ff6767;
  box-shadow: 0 4px 12px rgba(255, 103, 103, 0.3);
}

.popup-cancel-btn:active,
.popup-save-btn:active {
  transform: scale(0.97);
  opacity: 0.85;
}

/* ---------- Stepper 宽度 ---------- */
.steal-stepper {
  width: 108px;
}

/* ---------- 动画 ---------- */
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
    transform: translateY(20px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* ---------- 小屏幕适配 ---------- */
@media (max-width: 375px) {
  .type-option-small {
    flex: calc(50% - 4px);
  }
}
</style>
