<template>
  <div class="config-card shop-config-card apple-card">
    <div class="apple-card-header">
      <cute-icon name="shop" size="20" color="#ff6767" />
      <span class="apple-card-title">店铺管理</span>
    </div>

    <!-- ===== 自动上架 ===== -->
    <div class="apple-card-content">
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动上架</div>
          <div class="apple-cell-label">上架鲜花到商店进行售卖</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :modelValue="localConfig.autoTradeOut"
            @update:modelValue="
              (v) => {
                localConfig.autoTradeOut = v
                updateConfig()
              }
            "
            size="22"
          />
        </div>
      </div>

      <div v-show="localConfig.autoTradeOut" class="sub-list-section">
        <div class="apple-sub-header">
          <van-icon name="cash-o" size="14" color="#86868B" />
          <span>上架设置</span>
        </div>

        <div
          v-if="!localConfig.trade.outs || localConfig.trade.outs.length === 0"
          class="apple-empty"
        >
          <div class="apple-empty-icon">
            <van-icon name="shop-o" size="40" color="#C7C7CC" />
          </div>
          <div class="apple-empty-text">暂无上架配置</div>
          <div class="apple-empty-desc">点击下方按钮添加上架配置</div>
        </div>

        <div
          v-for="(out, index) in localConfig.trade.outs"
          :key="`out-${index}`"
          class="config-row"
        >
          <div class="config-field-item flower-field">
            <div class="config-field-label">上架鲜花</div>
            <div class="config-field-value clickable" @click="editOutFlower(out)">
              <span class="value-text">{{ out.seedName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <div class="config-field-item price-field">
            <div class="config-field-label">价格</div>
            <custom-array-stepper
              :options="getTradePriceOptions(out)"
              :default-value="getTradePriceOptions(out)[1] || 0"
              v-model="out.price"
              class="config-stepper"
            />
          </div>

          <div class="config-field-item small-count-field">
            <div class="config-field-label">数量</div>
            <van-stepper
              v-model="out.count"
              :min="-1"
              :step="1"
              integer
              size="small"
              class="config-stepper"
              @change="updateConfig"
            />
          </div>

          <div class="config-field-item pwd-field">
            <div class="config-field-label">密码</div>
            <van-field
              v-model="out.password"
              type="number"
              inputmode="numeric"
              maxlength="4"
              placeholder="四位"
              clearable
              style="padding: 0"
            />
          </div>

          <div class="config-field-item switch-field">
            <div class="config-field-label">启用</div>
            <van-switch
              :modelValue="out.enable"
              @update:modelValue="
                (v) => {
                  out.enable = v
                  updateConfig()
                }
              "
              size="20"
            />
          </div>

          <button class="apple-delete-btn" @click="deleteTradeOut(index)">
            <van-icon name="delete-o" size="16" color="#FF3B30" />
          </button>
        </div>

        <button class="apple-add-btn" @click="addTradeOut">
          <van-icon name="add-o" size="16" />
          <span>添加上架配置</span>
        </button>
      </div>
    </div>

    <!-- ===== 自动购买 ===== -->
    <div
      class="apple-card-content"
      style="border-top: 0.5px solid rgba(60, 60, 67, 0.08); margin-top: 8px; padding-top: 16px"
    >
      <div class="apple-cell">
        <div class="apple-cell-left">
          <div class="apple-cell-title">自动购买</div>
          <div class="apple-cell-label">从好友商店购买鲜花</div>
        </div>
        <div class="apple-cell-right">
          <van-switch
            :modelValue="localConfig.autoTradeIn"
            @update:modelValue="
              (v) => {
                localConfig.autoTradeIn = v
                updateConfig()
              }
            "
            size="22"
          />
        </div>
      </div>

      <div v-show="localConfig.autoTradeIn" class="sub-list-section">
        <div class="apple-sub-header">
          <van-icon name="paid" size="14" color="#86868B" />
          <span>购买设置</span>
        </div>

        <div
          v-if="!localConfig.trade.ins || localConfig.trade.ins.length === 0"
          class="apple-empty"
        >
          <div class="apple-empty-icon">
            <van-icon name="cart-o" size="40" color="#C7C7CC" />
          </div>
          <div class="apple-empty-text">暂无购买配置</div>
          <div class="apple-empty-desc">点击下方按钮添加购买配置</div>
        </div>

        <div v-for="(inc, index) in localConfig.trade.ins" :key="`in-${index}`" class="config-row">
          <div class="config-field-item mid-field">
            <div class="config-field-label">目标好友</div>
            <div class="config-field-value clickable" @click="editInFriend(inc)">
              <span class="value-text">{{ inc.townName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <div class="config-field-item mid-field">
            <div class="config-field-label">目标鲜花</div>
            <div class="config-field-value clickable" @click="editInFlower(inc)">
              <span class="value-text">{{ inc.seedName || '未选择' }}</span>
              <van-icon name="arrow" size="14" class="arrow-icon" />
            </div>
          </div>

          <div class="config-field-item price-field">
            <div class="config-field-label">价格</div>
            <custom-array-stepper
              :options="getTradePriceOptions(inc)"
              :default-value="getTradePriceOptions(inc)[1] || 0"
              :inputDisabled="true"
              v-model="inc.price"
              class="config-stepper"
            />
          </div>

          <div class="config-field-item count-field">
            <div class="config-field-label">每日</div>
            <van-stepper
              v-model="inc.count"
              :min="-1"
              :step="100"
              integer
              size="small"
              class="config-stepper"
              @change="updateConfig"
            />
          </div>

          <div class="config-field-item pwd-field">
            <div class="config-field-label">密码</div>
            <van-field
              v-model="inc.password"
              type="number"
              inputmode="numeric"
              maxlength="4"
              placeholder="四位"
              clearable
              style="padding: 0"
            />
          </div>

          <div class="config-field-item switch-field">
            <div class="config-field-label">启用</div>
            <van-switch
              :modelValue="inc.enable"
              @update:modelValue="
                (v) => {
                  inc.enable = v
                  updateConfig()
                }
              "
              size="20"
            />
          </div>

          <button class="apple-delete-btn" @click="deleteTradeIn(index)">
            <van-icon name="delete-o" size="16" color="#FF3B30" />
          </button>
        </div>

        <button class="apple-add-btn" @click="addTradeIn">
          <van-icon name="add-o" size="16" />
          <span>添加购买配置</span>
        </button>
      </div>
    </div>

    <!-- 鲜花选择器弹出层 -->
    <van-popup v-model:show="showFlowerPicker" round position="bottom" class="custom-popup">
      <div class="popup-header">
        <span class="popup-title">选择鲜花</span>
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showNotify } from 'vant'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ autoTradeOut: false, autoTradeIn: false, trade: { outs: [], ins: [] } }),
  },
  currentUser: { type: Object, required: true },
  friends: { type: Array, default: () => [] },
  availableSeeds: { type: Array, default: () => [] },
  tradeMap: { type: Map, default: () => new Map() },
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

const updateConfig = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localConfig.value)))
}

// ==================== 价格选项 ====================
const getTradePriceOptions = (item) => {
  if (!item || !item.seedId || item.seedId === '-1' || item.seedId === '-2') return [0]
  const trade = props.tradeMap.get(item.seedId)
  return trade ? [trade.minPrice, trade.defaultPrice, trade.maxPrice] : [0]
}

// ==================== 花种选择 ====================
const showFlowerPicker = ref(false)
const searchSeed = ref('')
const editingItem = ref(null)
const filteredSeeds = ref([])

const getSeedOptions = () =>
  [...(props.availableSeeds || [])].map((s) => ({ value: s.value, text: s.text }))

watch(
  () => props.availableSeeds,
  () => {
    filteredSeeds.value = getSeedOptions()
  },
  { immediate: true, deep: true },
)

const filterSeed = () => {
  const base = getSeedOptions()
  if (!searchSeed.value) {
    filteredSeeds.value = base
    return
  }
  const kw = searchSeed.value.toLowerCase()
  filteredSeeds.value = base.filter((f) => f.text?.toLowerCase().includes(kw))
}

const openFlowerPicker = (item) => {
  editingItem.value = item
  showFlowerPicker.value = true
  searchSeed.value = ''
  filterSeed()
}

const removeTextAfterBracket = (s) => {
  if (!s) return ''
  const i = s.indexOf('（')
  return i !== -1 ? s.substring(0, i).trim() : s
}

const confirmFlower = ({ selectedOptions }) => {
  if (editingItem.value) {
    editingItem.value.seedId = selectedOptions[0].value
    editingItem.value.seedName = removeTextAfterBracket(selectedOptions[0].text)
    updateConfig()
  }
  showFlowerPicker.value = false
}

const editOutFlower = (out) => openFlowerPicker(out)
const editInFlower = (inc) => openFlowerPicker(inc)

// ==================== 好友选择 ====================
const showFriendPicker = ref(false)
const searchFriend = ref('')
const filteredFriends = ref([])

watch(
  () => props.friends,
  (list) => {
    filteredFriends.value = [{ value: '-1', text: '所有人' }, ...(list || [])]
  },
  { immediate: true, deep: true },
)

const filterFriend = () => {
  const base = [{ value: '-1', text: '所有人' }, ...(props.friends || [])]
  if (!searchFriend.value) {
    filteredFriends.value = base
    return
  }
  const kw = searchFriend.value.toLowerCase()
  filteredFriends.value = base.filter((f) => f.text?.toLowerCase().includes(kw))
}

const editInFriend = (inc) => {
  editingItem.value = inc
  showFriendPicker.value = true
  searchFriend.value = ''
  filterFriend()
}

const confirmFriend = ({ selectedOptions }) => {
  if (editingItem.value) {
    editingItem.value.userId = selectedOptions[0].value
    editingItem.value.townName = selectedOptions[0].text
    updateConfig()
  }
  showFriendPicker.value = false
}

// ==================== 列表操作 ====================
const ensureTrade = () => {
  if (!localConfig.value.trade) localConfig.value.trade = { outs: [], ins: [] }
  if (!localConfig.value.trade.outs) localConfig.value.trade.outs = []
  if (!localConfig.value.trade.ins) localConfig.value.trade.ins = []
}

const addTradeOut = () => {
  ensureTrade()
  localConfig.value.trade.outs.push({
    seedId: '-2',
    seedName: '无',
    price: 0,
    count: -1,
    enable: true,
    password: '',
  })
  updateConfig()
}

const deleteTradeOut = (index) => {
  localConfig.value.trade.outs.splice(index, 1)
  updateConfig()
  showNotify({ type: 'success', message: '删除成功', duration: 1000 })
}

const addTradeIn = () => {
  ensureTrade()
  localConfig.value.trade.ins.push({
    userId: '-1',
    townName: '所有人',
    seedId: '-1',
    seedName: '所有花',
    price: 0,
    count: -1,
    enable: true,
    password: '',
  })
  updateConfig()
}

const deleteTradeIn = (index) => {
  localConfig.value.trade.ins.splice(index, 1)
  updateConfig()
  showNotify({ type: 'success', message: '删除成功', duration: 1000 })
}
</script>

<style scoped>
.shop-config-card {
  margin-bottom: 16px;
}
.shop-config-card .apple-card-header {
  padding: 16px 16px 0;
}
.shop-config-card .apple-card-content {
  padding: 4px 16px 12px;
}
.sub-list-section {
  margin-top: 12px;
}
.config-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  gap: 8px;
}
.config-row:last-child {
  border-bottom: none;
}
.config-field-item {
  display: flex;
  flex-direction: column;
}
.mid-field {
  flex: 1.2;
  min-width: 90px;
}
.flower-field {
  flex: 1.2;
  min-width: 90px;
}
.price-field {
  flex: 1;
  min-width: 80px;
}
.count-field {
  flex: 1;
  min-width: 80px;
}
.small-count-field {
  flex: 0.8;
  min-width: 70px;
}
.pwd-field {
  flex: 0.9;
  min-width: 70px;
}
.switch-field {
  flex: 0.5;
  min-width: 50px;
}
.config-field-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}
.config-field-value {
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
  max-width: 70px;
}
.arrow-icon {
  color: #cccccc;
  flex-shrink: 0;
  margin-left: 4px;
}
.config-stepper {
  width: 80px;
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
