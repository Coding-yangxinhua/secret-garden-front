<template>
  <ManageLayout
    :modules="availableModules"
    :active-key="activeTab"
    :current-module="currentModule"
    @change="switchTab"
    @refresh="refreshCurrentModule"
    @home="goHome"
  >
    <component :is="currentModule?.component" v-if="currentModule" ref="activeModuleRef" />
    <ManageEmptyState
      v-else
      title="暂无可用后台模块"
      description="当前账号没有后台权限。"
    />
  </ManageLayout>
</template>

<script setup>
import { computed, markRaw, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { showNotify } from 'vant'
import ManageEmptyState from '@/components/manage/ManageEmptyState.vue'
import ManageLayout from '@/components/manage/ManageLayout.vue'
import CardCodeManagePanel from '@/components/manage/modules/CardCodeManagePanel.vue'
import ConfigManagePanel from '@/components/manage/modules/ConfigManagePanel.vue'
import FeedbackManagePanel from '@/components/manage/modules/FeedbackManagePanel.vue'
import NewUserRewardResetPanel from '@/components/manage/modules/NewUserRewardResetPanel.vue'
import NodeManagePanel from '@/components/manage/modules/NodeManagePanel.vue'
import ProxyManagePanel from '@/components/manage/modules/ProxyManagePanel.vue'
import TestNodeManagePanel from '@/components/manage/modules/TestNodeManagePanel.vue'
import TimeGrantPanel from '@/components/manage/modules/TimeGrantPanel.vue'
import UserManagePanel from '@/components/manage/modules/UserManagePanel.vue'
import { useUserStore } from '@/stores/user'
import '@/assets/manage-console.css'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { userInfo: systemUser } = storeToRefs(userStore)

const systemUserType = computed(() => Number(systemUser.value?.userType))
const canViewFullManage = computed(() => systemUserType.value === 2)
const canViewUserManage = computed(() => systemUserType.value === 1 || systemUserType.value === 2)

const moduleDefinitions = [
  {
    key: 'node',
    label: '节点管理',
    description: '节点状态、负载与版本控制',
    icon: 'cluster-o',
    component: markRaw(NodeManagePanel),
    permission: [2],
    refreshable: true,
  },
  {
    key: 'config',
    label: '配置管理',
    description: '全局配置版本与 JSON 内容',
    icon: 'setting-o',
    component: markRaw(ConfigManagePanel),
    permission: [1, 2],
    refreshable: true,
  },
  {
    key: 'code',
    label: '兑换码生成',
    description: '卡密与兑换码生成工具',
    icon: 'coupon-o',
    component: markRaw(CardCodeManagePanel),
    permission: [2],
    refreshable: true,
  },
  {
    key: 'grant',
    label: '时长发放',
    description: '补偿、赠送与系统时长发放',
    icon: 'clock-o',
    component: markRaw(TimeGrantPanel),
    permission: [2],
    refreshable: false,
  },
  {
    key: 'testNode',
    label: '测试节点配置',
    description: '测试节点相关参数维护',
    icon: 'desktop-o',
    component: markRaw(TestNodeManagePanel),
    permission: [2],
    refreshable: false,
  },
  {
    key: 'proxy',
    label: '代理 IP 管理',
    description: '代理池 Token 与 IP 列表',
    icon: 'exchange',
    component: markRaw(ProxyManagePanel),
    permission: [2],
    refreshable: true,
  },
  {
    key: 'feedback',
    label: '反馈管理',
    description: '用户反馈、处理状态与禁用功能',
    icon: 'comment-o',
    component: markRaw(FeedbackManagePanel),
    permission: [2],
    refreshable: true,
  },
  {
    key: 'user',
    label: '用户管理',
    description: '绑定系统账号查询与密码重置',
    icon: 'friends-o',
    component: markRaw(UserManagePanel),
    permission: [1, 2],
    refreshable: false,
  },
  {
    key: 'newUserReward',
    label: '新人奖励重置',
    description: '系统账号新人奖励补发与重置',
    icon: 'gift-o',
    component: markRaw(NewUserRewardResetPanel),
    permission: [1, 2],
    refreshable: false,
  },
]

const availableModules = computed(() =>
  moduleDefinitions.filter((item) => item.permission.includes(systemUserType.value)),
)

const defaultModuleKey = computed(() => availableModules.value[0]?.key || '')
const activeTab = ref(String(route.query.tab || defaultModuleKey.value || ''))
const activeModuleRef = ref(null)

const currentModule = computed(
  () => availableModules.value.find((module) => module.key === activeTab.value) || null,
)

const syncActiveTab = async (targetKey) => {
  const fallback = defaultModuleKey.value
  const nextKey = availableModules.value.some((module) => module.key === targetKey)
    ? targetKey
    : fallback

  activeTab.value = nextKey
  if (route.query.tab !== nextKey) {
    await router.replace({ query: { ...route.query, tab: nextKey || undefined } })
  }
}

const switchTab = async (key) => {
  await syncActiveTab(key)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const refreshCurrentModule = () => {
  activeModuleRef.value?.refresh?.()
}

const goHome = () => {
  router.push({ name: 'home' })
}

watch(
  [systemUserType, availableModules],
  async () => {
    if (!canViewUserManage.value) {
      showNotify({ type: 'warning', message: '当前账号没有后台权限' })
      router.replace({ name: 'home' })
      return
    }
    await syncActiveTab(String(route.query.tab || activeTab.value || defaultModuleKey.value))
  },
  { immediate: true },
)

watch(
  () => route.query.tab,
  (tab) => {
    if (tab && tab !== activeTab.value) {
      syncActiveTab(String(tab))
    }
  },
)

watch(activeTab, () => {
  nextTick(() => {
    document.querySelector('.manage-content')?.focus?.()
  })
})
</script>
