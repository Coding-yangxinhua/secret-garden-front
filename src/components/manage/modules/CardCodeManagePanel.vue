<template>
  <section class="manage-module">
    <ManageModuleHeader title="兑换码生成" description="生成和查看兑换码相关数据。" />
    <div class="manage-panel manage-code-panel">
      <CardCodeGenerator ref="cardCodeRef" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import CardCodeGenerator from '@/components/CardCodeGenerator.vue'
import ManageModuleHeader from '@/components/manage/ManageModuleHeader.vue'

const cardCodeRef = ref(null)

const refresh = () => {
  cardCodeRef.value?.fetchStats?.()
}

defineExpose({ refresh })
</script>
