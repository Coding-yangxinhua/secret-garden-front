// 导入配置好的axios实例
import request from './request'

/**
 * 用户登录请求
 * @param {Object} loginData - 登录表单数据
 * @param {boolean} isLogin - 是否为登录状态标识
 * @returns {Promise} - 返回请求Promise
 */
export const userLogin = (loginData) => {
  return request({
    method: 'post',
    url: `/user/login`,
    data: loginData
  })
}

/**
 * 用户注册请求
 * @param {Object} loginData - 登录表单数据
 * @param {boolean} isLogin - 是否为登录状态标识
 * @returns {Promise} - 返回请求Promise
 */
export const userReg = (loginData) => {
  return request({
    method: 'post',
    url: `/user/register`,
    data: loginData
  })
}


// 获得用户信息
export const getUserInfo = () => {
  return request({
    method: 'get',
    url: '/user/info'
  })
}

export const update = (userInfo) => {
  return request({
      method: 'post',
      url: `/user/update`,
      data: userInfo
  })
}

export const resetPassword = (code, newPwd) => {
  return request({
      method: 'post',
      url: `/user/resetPassword?code=${code}&newPwd=${newPwd}`,
  })
}
