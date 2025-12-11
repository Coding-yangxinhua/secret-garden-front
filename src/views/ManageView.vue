<script setup>
import { onMounted, ref } from 'vue'
import request from '@/utils/request'
import { showLoadingToast, showNotify } from 'vant'

const currentUser = ref()

const usersSubscribe = ref([])

const subscribes = [
  { text: '自动挂机', value: 1 },
  { text: '刷加速水滴', value: 3 },
  { text: '三倍卡', value: 4 },
  { text: '五倍卡', value: 5 },
]

const saveToast = ref(false)

const showSubscribePicker = ref(false)

const showDatePicker = ref(false)

const minDate = ref(new Date(new Date().setMonth(new Date().getMonth() - 1)))

const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 1)))

const selectSubscribe = (selectedUser) => {
  currentUser.value = selectedUser
  showSubscribePicker.value = true
}

const selectValidUtil = (selectedUser) => {
  currentUser.value = selectedUser
  showDatePicker.value = true
}

const confirmSubscribe = ({ selectedOptions }) => {
  // 备份原数据
  if (currentUser.value.backInfo == null) {
    currentUser.value.backInfo = {}
  }
  if (currentUser.value.backInfo.subscribeName == null) {
    currentUser.value.backInfo.subscribeName = currentUser.value.subscribeName
  }
  if (currentUser.value.backInfo.subscribeId == null) {
    currentUser.value.backInfo.subscribeId = currentUser.value.subscribeId
  }
  // 修改数据
  currentUser.value.subscribeName = selectedOptions[0].text
  currentUser.value.subscribeId = selectedOptions[0].value
  // 隐藏弹窗
  showSubscribePicker.value = false
}

const confirmDate = ({ selectedValues }) => {
  // 备份原数据
  if (currentUser.value.backInfo == null) {
    currentUser.value.backInfo = {}
  }
  if (currentUser.value.backInfo.validUtilStr == null) {
    currentUser.value.backInfo.validUtilStr = currentUser.value.validUtilStr
  }
  // 修改数据
  currentUser.value.validUtilStr = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`

  // 隐藏弹窗
  showDatePicker.value = false
}

const cancelUpdate = (userSubscribe) => {
  if (userSubscribe.backInfo.subscribeName != null) {
    userSubscribe.subscribeName = userSubscribe.backInfo.subscribeName
  }
  if (userSubscribe.backInfo.subscribeId != null) {
    userSubscribe.subscribeId = userSubscribe.backInfo.subscribeId
  }
  if (userSubscribe.backInfo.validUtilStr != null) {
    userSubscribe.validUtilStr = userSubscribe.backInfo.validUtilStr
  }
  userSubscribe.backInfo = null
}

// 保存用户配置
const updateConfig = async (userSubscribe) => {
  let url = '/manage/user/update'
  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '保存中',
  })
  const { code } = await request({
    method: 'post',
    url,
    data: userSubscribe,
  })
  if (code == 200) {
    showNotify({ type: 'success', message: '保存成功' })
    userSubscribe.backInfo = null
  } else {
    showNotify({ type: 'danger', message: '请等待审批通过' })
  }
  saveToast.value.close()
}

const apporveConfig = async (userSubscribe) => {
  let url = `/manage/user/approve?userSubscribeId=${userSubscribe.userSubscribeId}`
  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '保存中',
  })
  const { code } = await request({
    method: 'get',
    url,
  })
  if (code == 200) {
    showNotify({ type: 'success', message: '保存成功' })
    userSubscribe.waitingCheck = false
    userSubscribe.backInfo = null
  } else {
    showNotify({ type: 'danger', message: '失败了' })
  }
  saveToast.value.close()
}

const listUsersSubscribe = async () => {
  let url = '/manage/user/list'
  const { data, code, remark } = await request({
    method: 'get',
    url,
  })
  if (code != 200) {
    console.log(remark)
    return
  }
  usersSubscribe.value = data
}

onMounted(() => {
  listUsersSubscribe()
})
</script>

<template>
  <main>
    <van-nav-bar title="续费管理" />
    <van-row v-for="userSubscribe in usersSubscribe" :key="userSubscribe.userSubscribeId">
      <van-col span="4">
        <van-field v-model="userSubscribe.openId" readonly label="游戏ID"></van-field>
      </van-col>
      <van-col span="4">
        <van-field v-model="userSubscribe.userName" readonly label="游戏名"></van-field>
      </van-col>
      <van-col span="4">
        <van-field
          v-model="userSubscribe.subscribeName"
          is-link
          readonly
          label="套餐"
          placeholder="请选择套餐"
          @click="selectSubscribe(userSubscribe)"
        />
      </van-col>
      <van-col span="4">
        <van-field
          v-model="userSubscribe.validUtilStr"
          is-link
          readonly
          label="有效期"
          @click="selectValidUtil(userSubscribe)"
        />
      </van-col>
      <van-col
        v-show="!userSubscribe.waitingCheck"
        span="4"
        style="display: flex; align-items: center; background-color: white; justify-content: center"
      >
        <van-button
          type="default"
          :disabled="userSubscribe.backInfo == null"
          @click="cancelUpdate(userSubscribe)"
          >取消</van-button
        >
      </van-col>
      <van-col
        v-show="!userSubscribe.waitingCheck"
        span="4"
        style="display: flex; align-items: center; justify-content: center; background-color: white"
      >
        <van-button
          type="primary"
          :disabled="userSubscribe.backInfo == null"
          @click="updateConfig(userSubscribe)"
          >保存</van-button
        >
      </van-col>
      <van-col
        v-show="userSubscribe.waitingCheck"
        span="8"
        style="display: flex; align-items: center; justify-content: center; background-color: white"
      >
        <van-button type="success" @click="apporveConfig(userSubscribe)">同意</van-button>
      </van-col>
    </van-row>

    <van-popup v-model:show="showSubscribePicker" destroy-on-close round position="bottom">
      <van-picker
        :columns="subscribes"
        @cancel="showSubscribePicker = false"
        @confirm="confirmSubscribe"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" destroy-on-close round position="bottom">
      <van-date-picker
        title="生效至所选日期00:00"
        :columns-type="['year', 'month', 'day']"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="confirmDate"
      />
    </van-popup>
  </main>
</template>

<style scoped></style>
