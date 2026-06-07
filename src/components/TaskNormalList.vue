<template>
  <div class="accept-type-section">
    <div class="accept-type-wrapper">
      <div class="accept-type-container">
        <div
          v-for="item in taskList"
          :key="item.id"
          class="accept-type-option"
          :class="{ selected: isSelected(item.id) }"
          @click="toggleStatus(item.id)"
        >
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  // 父组件传入：展示用的任务列表（固定配置）
  taskList: {
    type: Array,
    required: true,
    default: () => []
  },
  // 双向绑定：你的核心数据 → 对象数组 [ {id, status}, ... ]
  tasks: {
    type: Array,
    default: () => []
  }
})

// 双向绑定事件
const emit = defineEmits(['update:tasks'])

// ✅ 判断选中状态：容错 + 查找对象
const isSelected = (taskId) => {
  if (!Array.isArray(props.tasks)) return false
  const task = props.tasks.find(t => t.id === taskId)
  return task?.status === 1
}

// ✅ 点击切换状态：核心修复（保证响应式+双向绑定生效）
const toggleStatus = (taskId) => {
  if (!Array.isArray(props.tasks)) return

  // 1. 深拷贝原数组，解决Vue响应式不更新的问题
  const newTasks = JSON.parse(JSON.stringify(props.tasks))
  
  // 2. 查找任务
  const task = newTasks.find(t => t.id === taskId)
  
  if (task) {
    // 3. 切换status
    task.status = task.status === 1 ? 0 : 1
  } else {
    // 4. 兼容：任务不存在时自动添加（解决初始化无数据的问题）
    newTasks.push({ id: taskId, status: 1 })
  }

  // 5. 触发双向绑定，更新父组件数据
  emit('update:tasks', newTasks)
}
</script>

<style scoped>
.accept-type-section { margin-bottom: 12px; }
.accept-type-wrapper { border: 1px solid #ffd6e7; border-radius: 12px; padding: 10px; background: #fff9fc; }
.accept-type-container { display: flex; flex-wrap: wrap; gap: 6px; }
.accept-type-option { padding: 4px 10px; border: 1px solid #f5c2d3; border-radius: 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; background: #fff; }
.accept-type-option:hover { border-color: #ff85c0; background: #fff0f6; }
.accept-type-option.selected { border-color: #ff6b9d; background: #ffadd2; color: #fff; font-weight: 500; }
</style>