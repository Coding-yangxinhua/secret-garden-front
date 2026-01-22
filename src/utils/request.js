import axios from 'axios'
 
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})
 
// 请求拦截器
service.interceptors.request.use(config => {
  // 根据userId的奇偶性设置baseURL
  config.baseURL =  import.meta.env.VITE_API_BASE_URL
  // 添加Authorization头
  return config
})
 
// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    // 统一错误处理
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
 
export default service