<template>
  <div v-if="store.showResult || store.isLoading" class="result-container">
    <div class="result-grid">
      <!-- 图片预览区域 -->
      <div class="image-section">
        <h3>Uploaded Image</h3>
        <div class="image-preview">
          <img v-if="imagePreview" :src="imagePreview" alt="Flower preview">
          <div v-else class="no-image">
            <i class="fas fa-image"></i>
            <p>No image available</p>
          </div>
        </div>
      </div>

      <!-- 识别结果区域 -->
      <div class="info-section">
        <!-- 加载状态 -->
        <div v-if="store.isLoading" class="loading">
          <div class="spinner"></div>
          <p>Analyzing image...</p>
        </div>

        <!-- 识别结果 -->
        <div v-else-if="store.recognitionResult" class="result-content">
          <h2 class="flower-name">{{ store.recognitionResult.name }}</h2>

          <!-- 置信度展示 -->
          <div class="confidence-section">
            <h3>Top Matches</h3>
            <div class="confidence-bars">
              <div v-for="(match, index) in store.recognitionResult.matches" :key="index"
                class="confidence-bar-wrapper">
                <div class="confidence-label">
                  {{ match.name }}
                  <span class="confidence-percentage">
                    {{ match.confidence.toFixed(1) }}%
                  </span>
                </div>
                <div class="confidence-bar">
                  <div class="confidence-fill" :style="{ width: `${match.confidence}%` }" :class="{
                    'high': match.confidence >= 80,
                    'medium': match.confidence >= 60 && match.confidence < 80,
                    'low': match.confidence < 60
                  }">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 操作按钮组 -->
          <div class="action-buttons-wrapper">
            <button class="action-button details-button" @click="showDetails">
              <i class="fas fa-info-circle"></i>
              <span>Details</span>
            </button>
            <button class="action-button share-button" @click="shareResult" :disabled="!store.recognitionResult">
              <i class="fas fa-share-alt"></i>
              <span>Share Result</span>
            </button>
            <button class="action-button save-button" @click="saveToHistory" :disabled="!store.recognitionResult">
              <i class="fas fa-bookmark"></i>
              <span>Save to History</span>
            </button>
          </div>

        </div>

        <!-- 错误信息 -->
        <div v-if="store.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ store.error }}
        </div>
      </div>
    </div>
    <!-- 花卉详情对话框 -->
    <el-dialog v-model="detailsVisible" :title="`${store.recognitionResult?.name || 'Flower'} Details`" width="60%"
      class="details-dialog">
      <div class="details-grid">
        <div v-for="(detail, key) in store.recognitionResult?.details" :key="key" class="detail-item"
          :title="formatDetailLabel(key)">
          <i :class="getDetailIcon(key)"></i>
          <div class="detail-info">
            <span class="detail-label">{{ formatDetailLabel(key) }}</span>
            <span class="detail-value">{{ detail }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ref } from 'vue';
import { useRecognitionStore } from '../stores/recognition'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'

const store = useRecognitionStore()
const { recognitionResult, selectedImage, isLoading, error, showResult } = storeToRefs(store)
const detailsVisible = ref(false)

// 图片预览URL
const imagePreview = computed(() => {
  if (selectedImage.value) {
    return URL.createObjectURL(selectedImage.value)
  }
  return ''
})

// 获取详情图标
const getDetailIcon = (key) => {
  const icons = {
    sunlight: 'fas fa-sun',
    water: 'fas fa-tint',
    temperature: 'fas fa-temperature-high',
    season: 'fas fa-seedling',
    soil: 'fas fa-mountain',
    height: 'fas fa-arrows-alt-v',
    spread: 'fas fa-arrows-alt-h',
    lifespan: 'fas fa-clock'
  }
  return icons[key] || 'fas fa-info-circle'
}

const showDetails = () => {
  detailsVisible.value = true
}

// 格式化详情标签
const formatDetailLabel = (key) => {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
}

// 分享结果
const shareResult = async () => {
  if (!recognitionResult.value) return

  try {
    const shareData = {
      title: `Flower Recognition: ${recognitionResult.value.name}`,
      text: `I found a ${recognitionResult.value.name} (${recognitionResult.value.scientificName}) using the Flower Recognition app!`,
      url: window.location.href
    }

    if (navigator.share) {
      await navigator.share(shareData)
      ElMessage.success('Shared successfully!')
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      ElMessage.success('Link copied to clipboard!')
    }
  } catch (err) {
    console.error('Error sharing:', err)
    ElMessage.error('Failed to share result')
  }
}

// 保存到历史记录
const saveToHistory = async () => {
  if (!recognitionResult.value) return

  try {
    await store.saveToHistory({
      date: new Date().toISOString(),
      result: recognitionResult.value,
      imageUrl: imagePreview.value
    })
    ElMessage.success('Saved to history successfully!')
  } catch (err) {
    console.error('Error saving to history:', err)
    ElMessage.error('Failed to save to history')
  }
}

// 统一处理预测结果的显示
const predictions = computed(() => {
  if (!store.recognitionResult) return []

  // 如果是服务器返回的结果
  if (store.recognitionResult.predictions) {
    return store.recognitionResult.predictions
  }

  // 如果是本地预测的结果
  return store.recognitionResult
})
</script>

<style scoped>
.result-container {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-top: 2rem;
  animation: fadeIn 0.3s ease-in-out;
}

.debug-panel {
  background: #f5f5f5;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: var(--radius);
  font-family: monospace;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

.image-section h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.image-preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-light);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.no-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.flower-name {
  color: var(--primary-color);
  font-size: 2rem;
  margin: 0;
}

.confidence-section {
  margin-top: 1rem;
}

.confidence-bar-wrapper {
  margin: 0.5rem 0;
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.confidence-percentage {
  font-size: 0.875rem;
  color: var(--text-light);
}

.confidence-bar {
  height: 24px;
  background: var(--bg-light);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

/*
.confidence-fill.high {
  background: #4CAF50;
}

.confidence-fill.medium {
  background: #FFA726;
}

.confidence-fill.low {
  background: #EF5350;
}
*/
.confidence-fill.high {
  background: #ef208b;
}

.confidence-fill.medium {
  background: #db507e;
}

.confidence-fill.low {
  background: #FF80AB;
}

.flower-details {
  margin-top: 1rem;
}

/* 详情网格布局 */
.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 改为一行3个 */
  gap: 1.5rem;
  /* 增加间距使布局更加舒适 */
  padding: 1rem;
  /* 添加内边距 */
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem;
  /* 增加内边距使每个块更高 */
  background: var(--bg-light);
  border-radius: var(--radius);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 100px;
  /* 设置最小高度使块更高 */
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-item i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-light);
}

.detail-value {
  font-weight: 500;
}

/* 完全重写按钮样式 */
.action-buttons-wrapper {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
}

.action-button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0 1.5rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.action-button i {
  font-size: 14px;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.details-button {
  background-color: var(--primary-color);
  color: white;
}

.share-button {
  background-color: var(--primary-color);
  color: white;
}

.save-button {
  background-color: var(--primary-color);
  /* Hot Pink */
  color: white;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--error-color);
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background: #FFEBEE;
  border-radius: var(--radius);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: var(--radius);
}

:deep(.el-dialog__header) {
  background: var(--primary-color);
  color: white;
  padding: 1rem 1.5rem;
  margin: 0;
  border-radius: var(--radius) var(--radius) 0 0;
  text-align: center;

}

:deep(.el-dialog__title) {
  color: white;
  font-size: 1.25rem;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

:deep(.el-dialog__body) {
  padding: 2rem;
}



@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .result-grid {
    grid-template-columns: 1fr;
  }

  .details-btn,
  .share-btn,
  .save-btn {
    width: 100%;
    justify-content: center;
  }

  :deep(.el-dialog) {
    width: 90% !important;
  }

  .action-buttons {
    flex-direction: column !important;
  }

  .action-buttons button {
    width: 100% !important;
  }

  .action-buttons-wrapper {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .details-grid {
    grid-template-columns: 1fr;
    /* 在移动端改为一列 */
  }

  .detail-item {
    min-height: 80px;
    /* 移动端可以稍微矮一点 */
  }
}
</style>