// 导入配置好的axios实例
import request from './request'

/**
 * 用户登录请求
 * @param {Object} loginData - 登录表单数据
 * @returns {Promise} - 返回请求Promise
 */
export const userLogin = (loginData) => {
  return request({
    method: 'post',
    url: `/user/login`,
    data: loginData,
  })
}

/**
 * 用户注册请求
 * @param {Object} loginData - 登录表单数据
 * @returns {Promise} - 返回请求Promise
 */
export const userReg = (loginData) => {
  return request({
    method: 'post',
    url: `/user/register`,
    data: loginData,
  })
}

// 获得用户信息
export const getUserInfo = () => {
  return request({
    method: 'get',
    url: '/user/info',
  })
}

export const update = (userInfo) => {
  return request({
    method: 'post',
    url: `/user/update`,
    data: userInfo,
  })
}

export const resetPassword = (code, newPwd) => {
  return request({
    method: 'post',
    url: `/user/resetPassword?code=${code}&newPwd=${newPwd}`,
  })
}

// ==========================================
// 系统用户个人资料管理 — 后端 /sg/system/*
// ==========================================

/**
 * 1. 修改昵称
 * PUT /sg/system/nickname
 */
export const updateSystemNickname = (nickName) => {
  return request({
    method: 'put',
    url: '/system/nickname',
    data: { nickName },
  })
}

/**
 * 2. 修改密码
 * PUT /sg/system/password
 */
export const updateSystemPassword = (oldPassword, newPassword) => {
  return request({
    method: 'put',
    url: '/system/password',
    data: { oldPassword, newPassword },
  })
}

/**
 * 3. 一次性修改用户名
 * PUT /sg/system/username
 */
export const updateSystemUsername = (newUserName) => {
  return request({
    method: 'put',
    url: '/system/username',
    data: { newUserName },
  })
}

/**
 * 4. 查询绑定的系统账号
 * GET /sg/system/bound-user?gameUserName=xxx
 */
export const queryBoundSystemUser = (gameUserName) => {
  return request({
    method: 'get',
    url: '/system/bound-user',
    params: { gameUserName },
  })
}
