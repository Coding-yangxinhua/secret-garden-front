<template>
  <div class="flower-select-wrapper">
    <!-- 第一个选择框：激活时加 active 类 -->
    <div class="custom-select" :class="{ disabled: !options1.length, active: showOptions1 }">
      <div class="select-display" @click="toggleOptions(1)">
        <span class="label">{{ selected1 ? getFlowerNameById(selected1) : "第一朵花" }}</span>
        <span class="arrow">{{ showOptions1 ? "▲" : "▼" }}</span>
      </div>
      <div v-if="showOptions1" class="select-options">
        <input v-model="search1" class="search-input" placeholder="搜索..." @click.stop />
        <div v-for="flower in filterOptions1" :key="flower.id" class="select-option" @click="handleSelect(1, flower.id)">
          {{ flower.name }}
        </div>
      </div>
    </div>

    <!-- 第二个选择框 -->
    <div class="custom-select" :class="{ disabled: !selected1 || !options2.length, active: showOptions2 }">
      <div class="select-display" @click="toggleOptions(2)">
        <span class="label">{{ selected2 ? getFlowerNameById(selected2) : "第二朵花" }}</span>
        <span class="arrow">{{ showOptions2 ? "▲" : "▼" }}</span>
      </div>
      <div v-if="showOptions2" class="select-options">
        <input v-model="search2" class="search-input" placeholder="搜索..." @click.stop />
        <div v-for="flower in filterOptions2" :key="flower.id" class="select-option" @click="handleSelect(2, flower.id)">
          {{ flower.name }}
        </div>
      </div>
    </div>

    <!-- 第三个选择框 -->
    <div class="custom-select" :class="{ disabled: !selected2 || !options3.length, active: showOptions3 }">
      <div class="select-display" @click="toggleOptions(3)">
        <span class="label">{{ selected3 ? getFlowerNameById(selected3) : "第三朵花" }}</span>
        <span class="arrow">{{ showOptions3 ? "▲" : "▼" }}</span>
      </div>
      <div v-if="showOptions3" class="select-options">
        <input v-model="search3" class="search-input" placeholder="搜索..." @click.stop />
        <div v-for="flower in filterOptions3" :key="flower.id" class="select-option" @click="handleSelect(3, flower.id)">
          {{ flower.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { DS_ARRANGE_INFO } from '@/config/ds.arrange.info.js'
import flowerUtil from '@/utils/flowerUtil.js'

// 稳定版：双向绑定标准写法
const props = defineProps({
  gameId: {
    type: [Number, String],
    required: true,
  },
  // v-model 绑定的值
  modelValue: {
    type: [String, Number],
    default: ''
  }
})
// 触发更新
const emit = defineEmits(['update:modelValue'])

// 选中的鲜花ID
const selected1 = ref('')
const selected2 = ref('')
const selected3 = ref('')
// 下拉状态
const showOptions1 = ref(false)
const showOptions2 = ref(false)
const showOptions3 = ref(false)
// 搜索
const search1 = ref('')
const search2 = ref('')
const search3 = ref('')

// 获取鲜花名称
const getFlowerNameById = (flowerId) => {
  if (!flowerId) return ''
  return flowerUtil.getFlowerNameByGameAndFlowerId(props.gameId, flowerId) || '未知鲜花'
}

const floristryData = ref(DS_ARRANGE_INFO)

// 格式化鲜花组合
const flowerList = computed(() => {
  return Object.values(floristryData.value).map(item =>
    item.flowers.split(',').map(str => Number(str.trim()))
  )
})

// 下拉选项
const options1 = computed(() => [...new Set(flowerList.value.map(i => i[0]))].map(id => ({ id, name: getFlowerNameById(id) })))
const options2 = computed(() => {
  if (!selected1.value) return []
  return [...new Set(flowerList.value.filter(i => i[0] === selected1.value).map(i => i[1]))].map(id => ({ id, name: getFlowerNameById(id) }))
})
const options3 = computed(() => {
  if (!selected1.value || !selected2.value) return []
  return [...new Set(flowerList.value.filter(i => i[0] === selected1.value && i[1] === selected2.value).map(i => i[2]))].map(id => ({ id, name: getFlowerNameById(id) }))
})

// 搜索过滤
const filterOptions1 = computed(() => options1.value.filter(i => i.name.toLowerCase().includes(search1.value.toLowerCase())))
const filterOptions2 = computed(() => options2.value.filter(i => i.name.toLowerCase().includes(search2.value.toLowerCase())))
const filterOptions3 = computed(() => options3.value.filter(i => i.name.toLowerCase().includes(search3.value.toLowerCase())))

// 匹配花艺ID（核心）
const matchFloristryId = computed(() => {
  if (!selected1.value || !selected2.value || !selected3.value) return ''
  for (const [floristryId, item] of Object.entries(floristryData.value)) {
    const f = item.flowers.split(',').map(Number)
    if (f[0] === selected1.value && f[1] === selected2.value && f[2] === selected3.value) {
      return floristryId
    }
  }
  return ''
})

// ============== 修复核心：选完花立刻同步到父组件 ==============
watch(matchFloristryId, (newId) => {
  // 强制触发 v-model 更新
  emit('update:modelValue', newId)
})

// ============== 修复核心：父组件赋值 → 自动回显鲜花 ==============
watch(() => props.modelValue, (newId) => {
  if (!newId) {
    selected1.value = selected2.value = selected3.value = ''
    return
  }
  const item = floristryData.value[newId]
  if (item) {
    const [f1, f2, f3] = item.flowers.split(',').map(Number)
    selected1.value = f1
    selected2.value = f2
    selected3.value = f3
  }
}, { immediate: true })

// 点击切换下拉
const toggleOptions = (num) => {
  const current = num === 1 ? showOptions1 : num === 2 ? showOptions2 : showOptions3
  current.value = !current.value

  showOptions1.value = num === 1 ? showOptions1.value : false
  showOptions2.value = num === 2 ? showOptions2.value : false
  showOptions3.value = num === 3 ? showOptions3.value : false
  search1.value = search2.value = search3.value = ''
}

// 选择鲜花
const handleSelect = (num, id) => {
  if (num === 1) { selected1.value = id; selected2.value = ''; selected3.value = ''; showOptions1.value = false }
  if (num === 2) { selected2.value = id; selected3.value = ''; showOptions2.value = false }
  if (num === 3) { selected3.value = id; showOptions3.value = false }
}

// 点击外部关闭
const closeAllOptions = (e) => {
  if (!e.target.closest('.custom-select')) {
    showOptions1.value = showOptions2.value = showOptions3.value = false
  }
}

onMounted(() => window.addEventListener('click', closeAllOptions))
onUnmounted(() => window.removeEventListener('click', closeAllOptions))
</script>

<style scoped>
.flower-select-wrapper {
  display: flex;
  gap: 8px;
  padding: 10px 0;
  flex-wrap: wrap;
  position: static;
  z-index: 9999;
}
.custom-select {
  position: relative;
  width: 140px;
  flex-shrink: 0;
  font-size: 14px;
  z-index: 9999;
}
.custom-select.disabled .select-display {
  background: #F7F8FA;
  color: #C9CDD4;
  cursor: not-allowed;
  border-color: #E4E6EB;
}
.select-display {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #E4E6EB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: #FFFFFF;
}
.select-display:hover { border-color: #54A9FF; }
.arrow { font-size: 12px; color: #8B939F; }
/* 激活的选择框，层级拉到最高 */
.custom-select.active {
  z-index: 99999999 !important;
  position: relative;
}

/* 下拉框强化层级 */
.select-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 99999999;
  animation: fadeIn 0.2s ease;
  /* 强制脱离文档流，不被同级挤压 */
  will-change: transform;
}
.search-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: none;
  outline: none;
  font-size: 13px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
}
.select-option {
  padding: 8px 10px;
  cursor: pointer;
}
.select-option:hover { background: #EDF5FF; color: #54A9FF; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.select-options::-webkit-scrollbar { width: 3px; }
.select-options::-webkit-scrollbar-thumb { background: #DCE0E6; }
</style>