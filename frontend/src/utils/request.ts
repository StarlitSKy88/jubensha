import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在这里可以添加认证信息等
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 如果是下载文件，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 这里可以根据后端的响应结构进行适当的处理
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get&lt;T = any&gt;(url: string, config?: AxiosRequestConfig) {
    return service.get&lt;T&gt;(url, config)
  },

  post&lt;T = any&gt;(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.post&lt;T&gt;(url, data, config)
  },

  put&lt;T = any&gt;(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.put&lt;T&gt;(url, data, config)
  },

  delete&lt;T = any&gt;(url: string, config?: AxiosRequestConfig) {
    return service.delete&lt;T&gt;(url, config)
  }
}

export default request 