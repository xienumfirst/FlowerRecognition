import { defineStore } from 'pinia'
import { ref } from 'vue'
import { flowerService } from '../api/services'

export const useRecognitionStore = defineStore('recognition', () => {
    const selectedImage = ref(null)
    const recognitionResult = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const previewUrl = ref('')
    const showResult = ref(false)
    const uploadProgress = ref(0)
    const history = ref([])

    // 设置选中的图片
    const setSelectedImage = (file) => {
        selectedImage.value = file
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
        }
        previewUrl.value = URL.createObjectURL(file)
        showResult.value = true
        uploadProgress.value = 0
    }

    // 设置识别结果（本地识别）
    const setRecognitionResult = async (predictions) => {
        const result = {
            name: predictions.length > 0 ? predictions[0].label : 'Unknown',
            matches: predictions.map(p => ({
                name: p.label,
                confidence: parseFloat(p.probability)
            }))
        }
        recognitionResult.value = result
        showResult.value = true

        // 保存到历史记录
        await saveToHistory({
            date: new Date().toISOString(),
            result: result,
            imageUrl: previewUrl.value,
            type: 'local' // 标记为本地识别
        })
    }

    // 识别花朵（服务端识别）
    const recognizeFlower = async (file) => {
        isLoading.value = true
        error.value = null
        uploadProgress.value = 0

        try {
            const response = await flowerService.recognizeFlower(file, (progress) => {
                uploadProgress.value = progress
            })

            if (response.data.success) {
                // 获取matches数组
                const serverResults = response.data.data.matches // 修改这里
                const details = response.data.data.details      // 添加这行来获取详细信息

                const result = {
                    name: serverResults.length > 0 ? serverResults[0][0] : 'Unknown',
                    matches: serverResults.map(item => ({
                        name: item[0],
                        confidence: item[1] * 100
                    })),
                    details: details  // 添加详细信息到结果中
                }

                recognitionResult.value = result
                showResult.value = true
                uploadProgress.value = 100

                // 保存到历史记录
                await saveToHistory({
                    date: new Date().toISOString(),
                    result: result,
                    imageUrl: previewUrl.value,
                    type: 'server' // 标记为服务器识别
                })
            } else {
                throw new Error(response.data.message || '识别失败')
            }
        } catch (err) {
            error.value = err.message || '识别失败，请重试'
            console.error('Recognition error:', err)
        } finally {
            isLoading.value = false
        }
    }
    // 保存到历史记录
    const saveToHistory = async (record) => {
        try {
            // 获取现有历史记录
            const existingHistory = JSON.parse(localStorage.getItem('flowerHistory') || '[]')

            // 添加新记录到开头
            existingHistory.unshift(record)

            // 限制历史记录数量（例如最多保存50条）
            const maxHistory = 50
            if (existingHistory.length > maxHistory) {
                existingHistory.splice(maxHistory)
            }

            // 保存到 localStorage
            localStorage.setItem('flowerHistory', JSON.stringify(existingHistory))

            // 更新 state
            history.value = existingHistory
        } catch (error) {
            console.error('Error saving to history:', error)
            throw error
        }
    }

    // 获取历史记录
    const getHistory = async () => {
        try {
            const existingHistory = JSON.parse(localStorage.getItem('flowerHistory') || '[]')
            history.value = existingHistory
            return existingHistory
        } catch (error) {
            console.error('Error getting history:', error)
            throw error
        }
    }

    // 删除历史记录
    const deleteHistoryRecord = async (record) => {
        try {
            let existingHistory = JSON.parse(localStorage.getItem('flowerHistory') || '[]')
            existingHistory = existingHistory.filter(item => item.date !== record.date)
            localStorage.setItem('flowerHistory', JSON.stringify(existingHistory))
            history.value = existingHistory
            return existingHistory
        } catch (error) {
            console.error('Error deleting history record:', error)
            throw error
        }
    }

    // 清空所有历史记录
    const clearHistory = async () => {
        try {
            localStorage.removeItem('flowerHistory')
            history.value = []
        } catch (error) {
            console.error('Error clearing history:', error)
            throw error
        }
    }

    // 清理函数
    const clearRecognition = () => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
        }
        selectedImage.value = null
        recognitionResult.value = null
        error.value = null
        previewUrl.value = ''
        showResult.value = false
        uploadProgress.value = 0
    }

    return {
        selectedImage,
        recognitionResult,
        isLoading,
        error,
        previewUrl,
        showResult,
        uploadProgress,
        history,
        setSelectedImage,
        recognizeFlower,
        clearRecognition,
        setRecognitionResult,
        saveToHistory,
        getHistory,
        deleteHistoryRecord,
        clearHistory
    }
})