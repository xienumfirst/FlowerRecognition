import axios from 'axios'

// API 基础配置
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`

// 创建 axios 实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
})

// API 服务
export const flowerService = {
    // 识别花朵
    recognizeFlower(imageFile, onProgress) {
        const formData = new FormData()
        formData.append('flower_img', imageFile)
        return apiClient.post('/api/classify/', formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress?.(percentCompleted)
                }
            }
        })
    },

    // 保存到历史记录
    saveToHistory(historyData) {
        // 创建包含图片的 FormData
        const formData = new FormData()

        // 如果图片是 Blob URL，需要先获取 Blob 数据
        if (historyData.imageData.startsWith('blob:')) {
            return fetch(historyData.imageData)
                .then(r => r.blob())
                .then(blob => {
                    formData.append('image', blob, 'flower_image.jpg')
                    formData.append('result', JSON.stringify(historyData.result))
                    formData.append('type', historyData.type)
                    formData.append('userId', historyData.userId)
                    formData.append('timestamp', new Date().toISOString())

                    return apiClient.post('/api/flower/history', formData)
                })
        } else {
            // 如果已经是 Blob 或 File 对象
            formData.append('image', historyData.imageData)
            formData.append('result', JSON.stringify(historyData.result))
            formData.append('type', historyData.type)
            formData.append('userId', historyData.userId)
            formData.append('timestamp', new Date().toISOString())

            return apiClient.post('/api/flower/history', formData)
        }
    },

    // 获取历史记录
    getHistory(page = 1, limit = 10) {
        return apiClient.get('/api/flower/history', {
            params: {
                userId: 'xienumfirst', // 当前登录用户
                page,
                limit
            }
        })
    },

    // 获取单条历史记录详情
    getHistoryDetail(historyId) {
        return apiClient.get(`/api/flower/history/${historyId}`)
    },

    // 删除单条历史记录
    deleteHistory(historyId) {
        return apiClient.delete(`/api/flower/history/${historyId}`, {
            params: {
                userId: 'xienumfirst' // 确保只能删除自己的记录
            }
        })
    },

    // 清空所有历史记录
    clearHistory() {
        return apiClient.delete('/api/flower/history/all', {
            params: {
                userId: 'xienumfirst' // 确保只能清空自己的记录
            }
        })
    },

    // 批量删除历史记录
    batchDeleteHistory(historyIds) {
        return apiClient.delete('/api/flower/history/batch', {
            data: {
                historyIds,
                userId: 'xienumfirst'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}

// 添加风格迁移服务
export const styleTransferService = {
    // 执行风格迁移
    transferStyle(contentImage, styleImage, onProgress) {
        const formData = new FormData()
        formData.append('contentImage', contentImage)
        formData.append('styleImage', styleImage)

        return apiClient.post('/api/styletransfer/', formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress?.(percentCompleted)
                }
            }
        })
    },

    // 保存风格迁移结果到历史记录
    saveTransferHistory(historyData) {
        return apiClient.post('/api/styletransfer/history', historyData, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    },

    // 获取风格迁移历史记录
    getTransferHistory() {
        return apiClient.get('/api/styletransfer/history')
    }
}

// 添加请求拦截器，统一处理认证
apiClient.interceptors.request.use(
    config => {
        // 如果是历史记录相关的请求，设置合适的 Content-Type
        if (config.url.includes('/history') && !config.url.includes('/api/styletransfer')) {
            // 如果不是 FormData，则设置为 application/json
            if (!(config.data instanceof FormData)) {
                config.headers['Content-Type'] = 'application/json'
            }
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 添加响应拦截器，统一处理错误
apiClient.interceptors.response.use(
    response => response,
    error => {
        // 统一错误处理
        let errorMessage = '操作失败'
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMessage = error.response.data.message || '请求参数错误'
                    break
                case 401:
                    errorMessage = '未授权，请重新登录'
                    // 这里可以添加重定向到登录页的逻辑
                    break
                case 403:
                    errorMessage = '拒绝访问'
                    break
                case 404:
                    errorMessage = '请求的资源不存在'
                    break
                case 500:
                    errorMessage = '服务器内部错误'
                    break
                default:
                    errorMessage = error.response.data.message || '操作失败'
            }
        } else if (error.request) {
            errorMessage = '网络错误，请检查您的网络连接'
        }
        console.error('API Error:', errorMessage)
        return Promise.reject(new Error(errorMessage))
    }
)