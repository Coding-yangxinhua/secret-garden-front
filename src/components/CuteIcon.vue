<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: '24' },
  color: { type: String, default: '#444444' },
})

const svgCode = ref('')

// 加载图标函数（抽出来，方便重复调用）
const loadSvg = async (iconName) => {
  try {
    const svgModule = await import(`../assets/icons/${iconName}.svg?raw`)
    let raw = svgModule.default

    // 清除 SVG 自带宽高、颜色
    raw = raw.replace(/width="[^"]*"/g, '')
    raw = raw.replace(/height="[^"]*"/g, '')
    raw = raw.replace(/fill="[^"]*"/g, '')
    raw = raw.replace(/stroke="[^"]*"/g, '')

    // 支持外部修改颜色
    raw = raw.replace(/<svg/, '<svg fill="currentColor"')
    
    svgCode.value = raw
  } catch (e) {
    console.error('图标加载失败：', e)
  }
}

// 首次加载
loadSvg(props.name)

// 🔥 监听 name 变化，自动切换图标
watch(
  () => props.name,
  (newName) => {
    loadSvg(newName)
  }
)

// 样式控制
const iconStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: props.color,
  display: 'inline-block',
  verticalAlign: 'middle',
}))
</script>

<template>
  <div v-if="svgCode" v-html="svgCode" :style="iconStyle" />
</template>