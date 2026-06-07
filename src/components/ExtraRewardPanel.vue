<template>
  <div class="activity-panel">
    <van-loading v-if="loading" class="loading" size="24" color="#ff6767" />
    <template v-else-if="allRewards.length">
      <!-- 新用户奖励卡片 -->
      <div v-if="newUserReward" class="card-list">
        <div
          class="reward-card"
          :class="[statusClass(newUserReward.status), typeClass(newUserReward.cardDays)]"
        >
          <div class="card-icon"><span>🎉</span></div>
          <div class="card-body">
            <div class="card-header">
              <div class="type-name">{{ getTypeName(newUserReward.cardDays) }}</div>
              <div class="reward-badge" v-if="newUserReward.status === 0">待领取</div>
              <div class="reward-badge claimed" v-else-if="newUserReward.status === 1">已领取</div>
              <div class="reward-badge locked" v-else>未解锁</div>
            </div>
            <div class="reward-desc">
              注册并绑定账号送 <strong>{{ newUserReward.rewardDays }}</strong> 天会员
            </div>
            <van-button
              v-if="newUserReward.status === 0"
              type="primary"
              size="small"
              round
              block
              class="claim-btn"
              :loading="receivingCard === newUserReward.cardDays"
              @click="doReceive(newUserReward.cardDays)"
            >
              领取
            </van-button>
          </div>
        </div>
      </div>

      <!-- 分界线提示 -->
      <div v-if="newUserReward && otherRewards.length > 0" class="divider">
        <span class="divider-text">
          <template v-if="isNewUserCompleted">✔ 新人奖励已领取，以下开卡额外奖励可领取</template>
          <template v-else>🔒 请先领取新人奖励，才可解锁开卡额外奖励</template>
        </span>
      </div>

      <!-- 其他奖励（邀请 + 开卡） -->
      <div v-if="otherRewards.length > 0" class="card-list">
        <div
          v-for="item in otherRewards"
          :key="item.cardDays"
          class="reward-card"
          :class="[
            isNewUserCompleted ? statusClass(item.status) : 'locked',
            typeClass(item.cardDays),
          ]"
        >
          <div class="card-icon">
            <span v-if="item.cardDays === 1">💌</span>
            <span v-else>👑</span>
          </div>
          <div class="card-body">
            <div class="card-header">
              <div class="type-name">{{ getTypeName(item.cardDays) }}</div>
              <div class="reward-badge" v-if="!isNewUserCompleted">未解锁</div>
              <div class="reward-badge" v-else-if="item.status === 0">待领取</div>
              <div class="reward-badge claimed" v-else-if="item.status === 1">已领取</div>
              <div class="reward-badge locked" v-else>未解锁</div>
            </div>
            <div class="reward-desc">
              <span v-if="item.cardDays === 1"
                >被好友邀请得 <strong>{{ item.rewardDays }}</strong> 天（未开放）</span
              >
              <span v-else
                >购{{ item.cardDays }}天卡 送 <strong>{{ item.rewardDays }}天</strong></span
              >
            </div>
            <van-button
              v-if="isNewUserCompleted && item.status === 0"
              type="primary"
              size="small"
              round
              block
              class="claim-btn"
              :loading="receivingCard === item.cardDays"
              @click="doReceive(item.cardDays)"
            >
              领取
            </van-button>
          </div>
        </div>
      </div>
    </template>
    <van-empty v-else description="暂无活动" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showNotify } from 'vant'
import request from '@/utils/request'

const records = ref([])
const loading = ref(true)
const receivingCard = ref(null)

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await request({ url: '/user/extra-reward/list', method: 'GET' })
    if (res.code === 200) records.value = res.data
    else showNotify(res.remark || '加载失败')
  } catch (e) {
    showNotify('网络错误')
  } finally {
    loading.value = false
  }
}

const doReceive = async (cardDays) => {
  receivingCard.value = cardDays
  try {
    const res = await request({
      url: '/user/extra-reward/receive',
      method: 'POST',
      params: { cardDays },
    })
    if (res.code === 200) {
      showNotify({ type: 'success', message: '领取成功' })
      await fetchRecords()
    } else {
      showNotify(res.remark || '领取失败')
    }
  } catch (e) {
    showNotify('网络错误')
  } finally {
    receivingCard.value = null
  }
}

const allRewards = computed(() => records.value)
const newUserReward = computed(() => records.value.find((r) => r.cardDays === 0) || null)
const otherRewards = computed(() => records.value.filter((r) => r.cardDays !== 0))
const isNewUserCompleted = computed(() => newUserReward.value?.status === 1)

const getTypeName = (cardDays) => {
  if (cardDays === 0) return '新用户奖励'
  if (cardDays === 1) return '邀请奖励'
  return `${cardDays}天卡奖励`
}

const statusClass = (status) => ({
  claimable: status === 0,
  claimed: status === 1,
  locked: status === -1,
})

const typeClass = (cardDays) => ({
  'type-new': cardDays === 0,
  'type-invite': cardDays === 1,
  'type-card': cardDays > 1,
})

onMounted(fetchRecords)
</script>

<style scoped>
.activity-panel {
  padding: 12px 12px 0;
  min-height: 150px;
}
.loading {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 6px;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 14px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}
.divider-text {
  padding: 0 12px;
  font-size: 12px;
  color: #999;
  background: #f8f9fb;
  white-space: nowrap;
}

.reward-card {
  position: relative;
  border-radius: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff, #fff);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 10px;
}
.reward-card::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0.15;
  background: currentColor;
  pointer-events: none;
}
.type-new {
  color: #ff9a9e;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
}
.type-invite {
  color: #a18cd1;
  background: linear-gradient(135deg, #f5f0ff, #e8dcff);
}
.type-card {
  color: #ffb347;
  background: linear-gradient(135deg, #fffaf0, #ffe8c8);
}
.card-icon {
  font-size: 28px;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}
.card-body {
  flex: 1;
  min-width: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.type-name {
  font-size: 14px;
  font-weight: 700;
  color: #2c3e50;
}
.reward-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  background: #ff6767;
  color: #fff;
  font-weight: 500;
}
.reward-badge.claimed {
  background: #b0b0b0;
}
.reward-badge.locked {
  background: #e0e0e0;
  color: #888;
}
.reward-desc {
  font-size: 13px;
  color: #555;
  margin: 4px 0 6px;
  line-height: 1.4;
}
.reward-desc strong {
  color: #e74c3c;
  font-weight: 700;
}
.claim-btn {
  margin-top: 2px;
  background: linear-gradient(135deg, #ff6767, #ff8c8c);
  border: none;
  font-weight: 600;
  font-size: 13px;
  height: 32px;
  box-shadow: 0 2px 8px rgba(255, 103, 103, 0.3);
  letter-spacing: 0.5px;
}
.claim-btn:active {
  background: linear-gradient(135deg, #e55a5a, #ff7a7a);
}
</style>
