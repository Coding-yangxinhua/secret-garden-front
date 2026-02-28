<script setup>
import { RouterView } from 'vue-router'
import '@vant/touch-emulator'
</script>

<template>
  <div id="app">
    <header>
      <!-- 在 head 标签中添加 meta 标签，并设置 viewport-fit=cover 值 -->
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover"
      />
      <!-- 开启 safe-area-inset-bottom 属性 -->
      <van-number-keyboard safe-area-inset-bottom />
    </header>
    <RouterView />
  </div>
</template>

<style scoped>

</style>
