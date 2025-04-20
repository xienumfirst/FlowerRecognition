<template>
    <div class="style-transfer-container">
        <!-- 上传区域 -->
        <div class="upload-section">
            <!-- 内容图片上传 -->
            <div class="upload-box">
                <h3>Content Image</h3>
                <div class="upload-area" @drop.prevent="handleDrop($event, 'content')" @dragover.prevent
                    @click="triggerUpload('content')">
                    <div v-if="!contentImage" class="upload-placeholder">
                        <i class="fas fa-image"></i>
                        <p>Drop your content image here or click to upload</p>
                        <span class="upload-hint">Supports: JPG, PNG (Max: 10MB)</span>
                    </div>
                    <img v-else :src="contentPreview" alt="Content preview" class="image-preview">
                    <input type="file" ref="contentInput" class="file-input" accept="image/*"
                        @change="handleFileChange($event, 'content')">
                </div>
            </div>

            <!-- 风格图片上传 -->
            <div class="upload-box">
                <h3>Style Image</h3>
                <div class="upload-area" @drop.prevent="handleDrop($event, 'style')" @dragover.prevent
                    @click="triggerUpload('style')">
                    <div v-if="!styleImage" class="upload-placeholder">
                        <i class="fas fa-palette"></i>
                        <p>Drop your style image here or click to upload</p>
                        <span class="upload-hint">Supports: JPG, PNG (Max: 10MB)</span>
                    </div>
                    <img v-else :src="stylePreview" alt="Style preview" class="image-preview">
                    <input type="file" ref="styleInput" class="file-input" accept="image/*"
                        @change="handleFileChange($event, 'style')">
                </div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
            <button class="transfer-btn" :disabled="!canTransfer || isLoading" @click="startTransfer">
                <i class="fas fa-magic"></i>
                <span>{{ isLoading ? 'Processing...' : 'Start Transfer' }}</span>
            </button>
        </div>

        <!-- 结果显示 -->
        <div v-if="isLoading || resultUrl" class="result-section">
            <h3>Result</h3>
            <div class="result-container">
                <div v-if="isLoading" class="loading">
                    <div class="spinner"></div>
                    <p>Transferring style... Please wait</p>
                </div>
                <img v-else-if="resultUrl" :src="resultUrl" alt="Style transfer result" class="result-image">
            </div>

            <!-- 下载按钮 -->
            <button v-if="resultUrl" class="download-btn" @click="downloadResult">
                <i class="fas fa-download"></i>
                <span>Download Result</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { styleTransferService } from '../api/services'

// 文件输入引用
const contentInput = ref(null)
const styleInput = ref(null)

// 状态变量
const contentImage = ref(null)
const styleImage = ref(null)
const contentPreview = ref('')
const stylePreview = ref('')
const isLoading = ref(false)
const resultUrl = ref('')

// 上传进度
const uploadProgress = ref(0)

// 计算属性：是否可以开始转换
const canTransfer = computed(() => {
    return contentImage.value && styleImage.value
})

// 触发文件上传
const triggerUpload = (type) => {
    if (type === 'content') {
        contentInput.value.click()
    } else {
        styleInput.value.click()
    }
}

// 处理文件改变
const handleFileChange = (event, type) => {
    const file = event.target.files[0]
    if (file) {
        validateAndProcessFile(file, type)
    }
}

// 处理拖放
const handleDrop = (event, type) => {
    const file = event.dataTransfer.files[0]
    if (file) {
        validateAndProcessFile(file, type)
    }
}

// 验证和处理文件
const validateAndProcessFile = (file, type) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        ElMessage.error('Please upload an image file')
        return
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('Image size should be less than 10MB')
        return
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)

    // 根据类型设置相应的状态
    if (type === 'content') {
        contentImage.value = file
        contentPreview.value = previewUrl
    } else {
        styleImage.value = file
        stylePreview.value = previewUrl
    }
}

/*
// 开始风格迁移
const startTransfer = async () => {
    if (!canTransfer.value) return

    isLoading.value = true
    uploadProgress.value = 0

    try {
        const response = await styleTransferService.transferStyle(
            contentImage.value,
            styleImage.value,
            (progress) => {
                uploadProgress.value = progress
            }
        )

        resultUrl.value = response.data
        console.log(response.data)

        const baseUrl = import.meta.env.VITE_API_BASE_URL
        const imagePath = response.data
        resultUrl.value = `${baseUrl}${imagePath.replace(/\\/g, '/')}`
/*
        // 保存到历史记录
        await styleTransferService.saveTransferHistory({
            date: new Date().toISOString(),
            contentImage: contentPreview.value,
            styleImage: stylePreview.value,
            resultImage: resultUrl.value
        })
            

        ElMessage.success('Style transfer completed successfully!')
    } catch (error) {
        console.error('Style transfer error:', error)
        ElMessage.error('Failed to transfer style. Please try again.')
    } finally {
        isLoading.value = false
    }
}

*/

const startTransfer = async () => {
    if (!canTransfer.value) return

    isLoading.value = true
    uploadProgress.value = 0

    try {
        const response = await styleTransferService.transferStyle(
            contentImage.value,
            styleImage.value,
            (progress) => {
                uploadProgress.value = progress
            }
        )

        const baseUrl = import.meta.env.VITE_API_BASE_URL
        // 正确访问图片路径：response.data.data
        const imagePath = response.data.data
        resultUrl.value = `${baseUrl}${imagePath.replace(/\\/g, '/')}`

        ElMessage.success('Style transfer completed successfully!')
    } catch (error) {
        console.error('Style transfer error:', error)
        ElMessage.error('Failed to transfer style. Please try again.')
    } finally {
        isLoading.value = false
    }
}

// 下载结果
const downloadResult = async () => {
    if (!resultUrl.value) return

    try {
        // 1. 获取图片的 blob 数据
        const response = await fetch(resultUrl.value)
        if (!response.ok) {
            throw new Error('Failed to fetch image')
        }
        const blob = await response.blob()

        // 2. 生成带时间戳的文件名
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
        const fileName = `style-transfer-${timestamp}.jpg`

        // 3. 使用 blob URL 下载
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()

        // 4. 清理
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)

        ElMessage.success('Download started successfully')
    } catch (error) {
        console.error('Download error:', error)
        ElMessage.error('Failed to download image. Please try again.')
    }
} 
</script>

<style scoped>
.style-transfer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.upload-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.upload-box {
    background: white;
    border-radius: var(--radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.upload-box h3 {
    margin-bottom: 1rem;
    color: var(--text-color);
    text-align: center;
}

.upload-area {
    border: 2px dashed var(--primary-color);
    border-radius: var(--radius);
    padding: 2rem;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.upload-area:hover {
    border-color: var(--secondary-color);
    background-color: var(--el-color-primary-light-9);
}

.upload-placeholder {
    text-align: center;
}

.upload-placeholder i {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.upload-hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-light);
}

.file-input {
    display: none;
}

.image-preview {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
}

.actions {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
}

.transfer-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.transfer-btn:hover:not(:disabled) {
    background: var(--secondary-color);
    transform: translateY(-2px);
}

.transfer-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.result-section {
    background: white;
    border-radius: var(--radius);
    padding: 2rem;
    box-shadow: var(--shadow);
    text-align: center;
}

.result-section h3 {
    margin-bottom: 1.5rem;
    color: var(--text-color);
}

.result-container {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--el-color-primary-light-8);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.result-image {
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
}

.download-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.3s ease;
}

.download-btn:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
}

/* 添加上传进度样式 */
.upload-progress {
    margin: 1rem 0;
    text-align: center;
}

.progress-text {
    margin-top: 0.5rem;
    color: var(--text-light);
    font-size: 0.875rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .upload-section {
        grid-template-columns: 1fr;
    }

    .upload-area {
        min-height: 200px;
    }

    .result-container {
        min-height: 200px;
    }
}
</style>