<template>
  <section class="manage-module">
    <ManageModuleHeader title="测试节点配置" description="维护测试节点相关配置。" />
    <div class="manage-panel">
      <TestNodeConfig />
    </div>
  </section>
</template>

<script setup>
import TestNodeConfig from '@/components/TestNodeConfig.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'
</script>
