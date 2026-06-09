<template>
  <!--
    🏷️ RaceTaskSelector — 纯任务勾选虚线框（无 header），
    父组件控制布局顺序和标题文案
  -->
  <div>
    <!-- 特殊任务类型勾选框 -->
    <div v-if="acceptTypeOptions.length > 0" class="guild-checkbox-frame">
      <div
        v-for="option in acceptTypeOptions"
        :key="option.value"
        class="guild-checkbox-item"
        :class="{ checked: localAccepts.includes(option.value) }"
        @click="toggleAccept(option.value)"
      >
        <div class="guild-checkbox-box">
          <van-icon name="success" size="10" />
        </div>
        <span class="guild-checkbox-label">{{ option.text }}</span>
      </div>
    </div>

    <!-- 任务配置勾选框 -->
    <div v-if="tasks.length > 0" class="guild-checkbox-frame">
      <div
        v-for="item in tasks"
        :key="item.id"
        class="guild-checkbox-item"
        :class="{ checked: getStatus(item.id) }"
        @click="toggleStatus(item.id)"
      >
        <div class="guild-checkbox-box">
          <van-icon name="success" size="10" />
        </div>
        <span class="guild-checkbox-label">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 特殊任务类型选项数组，传空数组则不显示 */
  acceptTypeOptions: {
    type: Array,
    default: () => [],
  },
  /** 已选中的特殊任务类型值数组 */
  accepts: {
    type: Array,
    default: () => [],
  },
  /** 任务列表 [{ id, title }] */
  tasks: {
    type: Array,
    required: true,
  },
  /** 任务状态映射 { [taskId]: true/false } */
  taskStatuses: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:accepts', 'update:taskStatuses'])

const localAccepts = computed(() => props.accepts)

const getStatus = (taskId) => {
  return !!props.taskStatuses[taskId]
}

const toggleAccept = (value) => {
  const newArr = [...props.accepts]
  const idx = newArr.indexOf(value)
  if (idx > -1) {
    newArr.splice(idx, 1)
  } else {
    newArr.push(value)
  }
  emit('update:accepts', newArr)
}

const toggleStatus = (taskId) => {
  const newMap = { ...props.taskStatuses }
  newMap[taskId] = !newMap[taskId]
  emit('update:taskStatuses', newMap)
}
</script>

<style scoped>
/* ---------- 虚线框 + 迷你勾选框风格 ---------- */
.guild-checkbox-frame {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px dashed rgba(180, 160, 180, 0.35);
  border-radius: 12px;
  background: rgba(245, 238, 245, 0.35);
}

.guild-checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #6b5e6b;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  font-family:
    -apple-system, 'PingFang SC', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans CJK SC', system-ui,
    sans-serif;
  transition: all 0.2s ease;
  background: transparent;
}

.guild-checkbox-item:active {
  background: rgba(200, 170, 200, 0.12);
}

/* 方框 */
.guild-checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid rgba(160, 140, 160, 0.4);
  background: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.guild-checkbox-box .van-icon-success {
  opacity: 0;
  color: #fff;
  transition: all 0.2s ease;
}

/* 选中态 */
.guild-checkbox-item.checked .guild-checkbox-box {
  background: #c89ac8;
  border-color: #c89ac8;
}

.guild-checkbox-item.checked .guild-checkbox-box .van-icon-success {
  opacity: 1;
}

.guild-checkbox-item.checked {
  color: #5a3d5a;
  font-weight: 500;
}
</style>
