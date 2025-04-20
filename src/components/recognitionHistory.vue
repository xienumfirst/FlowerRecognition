<template>
    <div class="history-container">
        <h2 class="history-title">
            <i class="fas fa-history"></i>
            Recognition History
        </h2>

        <!-- 空状态显示 -->
        <div v-if="!historyRecords.length" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No recognition history yet</p>
        </div>

        <!-- 历史记录列表 -->
        <div v-else class="history-grid">
            <div v-for="record in historyRecords" :key="record.date" class="history-card">
                <div class="card-image">
                    <img :src="record.imageUrl" :alt="record.result.name">
                </div>
                <div class="card-content">
                    <h3 class="flower-name">{{ record.result.name }}</h3>
                    <p class="scientific-name">{{ record.result.scientificName }}</p>
                    <p class="timestamp">
                        <i class="fas fa-clock"></i>
                        {{ formatDate(record.date) }}
                    </p>
                    <div class="confidence-info">
                        <p class="confidence-text">Confidence: {{ record.result.matches[0].confidence.toFixed(1) }}%</p>
                        <div class="confidence-bar">
                            <div class="confidence-fill" :style="{ width: `${record.result.matches[0].confidence}%` }"
                                :class="getConfidenceClass(record.result.matches[0].confidence)">
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <el-button size="small" @click="showDetails(record)">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </el-button>
                        <el-button size="small" @click="deleteRecord(record)" type="danger">
                            <i class="fas fa-trash"></i>
                            Delete
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详情对话框 -->
        <el-dialog v-model="detailsVisible" :title="`${selectedRecord?.result.name || 'Flower'} Details`" width="60%">
            <div v-if="selectedRecord" class="details-grid">
                <div v-for="(detail, key) in selectedRecord.result.details" :key="key" class="detail-item">
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
import { ref, onMounted } from 'vue'
import { useRecognitionStore } from '../stores/recognition'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'

const store = useRecognitionStore()
const historyRecords = ref([])
const detailsVisible = ref(false)
const selectedRecord = ref(null)

// 在组件挂载时加载历史记录
onMounted(async () => {
    await loadHistory()
})

// 加载历史记录
const loadHistory = async () => {
    try {
        historyRecords.value = await store.getHistory()
    } catch (error) {
        ElMessage.error('Failed to load history')
        console.error('Error loading history:', error)
    }
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

// 获取置信度类名
const getConfidenceClass = (confidence) => {
    if (confidence >= 80) return 'high'
    if (confidence >= 60) return 'medium'
    return 'low'
}

// 显示详情
const showDetails = (record) => {
    selectedRecord.value = record
    detailsVisible.value = true
}

// 删除记录
const deleteRecord = async (record) => {
    try {
        await ElMessageBox.confirm(
            'Are you sure you want to delete this record?',
            'Warning',
            {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }
        )
        await store.deleteHistoryRecord(record)
        await loadHistory()
        ElMessage.success('Record deleted successfully')
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('Failed to delete record')
            console.error('Error deleting record:', error)
        }
    }
}

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

// 格式化详情标签
const formatDetailLabel = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
}
</script>

<style scoped>
.history-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.history-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    color: #2c3e50;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 8px;
    color: #6c757d;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.history-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s;
}

.history-card:hover {
    transform: translateY(-4px);
}

.card-image {
    height: 200px;
    overflow: hidden;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.card-content {
    padding: 1rem;
}

.flower-name {
    margin: 0;
    color: #2c3e50;
    font-size: 1.25rem;
}

.scientific-name {
    color: #666;
    font-style: italic;
    margin: 0.5rem 0;
}

.timestamp {
    color: #666;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.confidence-info {
    margin: 1rem 0;
}

.confidence-text {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.confidence-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
}

.confidence-fill {
    height: 100%;
    transition: width 0.3s;
}

.confidence-fill.high {
    background: #4caf50;
}

.confidence-fill.medium {
    background: #ff9800;
}

.confidence-fill.low {
    background: #f44336;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.detail-info {
    display: flex;
    flex-direction: column;
}

.detail-label {
    font-weight: 500;
    color: #666;
}

.detail-value {
    color: #2c3e50;
}
</style>