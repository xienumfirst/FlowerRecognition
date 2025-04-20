<template>
  <div class="upload-container">
    <div class="upload-methods">
      <!-- 文件上传区域 -->
      <div class="method-box">
        <h3 class="method-title">Upload Image</h3>
      </div>
      <!-- 添加识别模式开关 -->
      <div class="mode-switch">
        <el-switch v-model="localRecognition" active-text="quick" inactive-text="accuracy" @change="handleModeChange" />
        <el-tooltip effect="dark" content="本地识别使用浏览器进行推理，服务端识别将图片发送到服务器进行处理" placement="top">
          <i class="fas fa-question-circle help-icon"></i>
        </el-tooltip>
      </div>

      <!-- 摄像头区域 -->
      <div class="method-box">
        <h3 class="method-title">Use Camera</h3>
      </div>
    </div>
    <div class="upload-methods">
      <div class="method-box">
        <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
          <div class="upload-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Drop your image here</h3>
            <p>or</p>
            <label class="upload-btn" for="imageInput">
              Select Image
              <input type="file" id="imageInput" ref="fileInput" @change="handleFileSelect" accept="image/*" hidden>
            </label>
            <p class="upload-hint">Supports: JPG, PNG (Max: 5MB)</p>
          </div>
        </div>
      </div>
      <!-- 摄像头区域 -->
      <div class="method-box">
        <div class="camera-area">
          <div class="camera-content">
            <div class="camera-preview" ref="cameraPreview">
              <i v-if="!streamActive" class="fas fa-camera camera-icon"></i>
              <p v-if="!streamActive">Camera feed will appear here</p>
              <video v-show="streamActive" ref="videoElement" autoplay playsinline></video>
            </div>
            <canvas ref="canvasElement" hidden></canvas>
            <div class="camera-buttons">
              <button class="camera-btn" @click="toggleCamera">
                <i :class="streamActive ? 'fas fa-video-slash' : 'fas fa-video'"></i>
                {{ streamActive ? 'Stop Camera' : 'Start Camera' }}
              </button>
              <button class="camera-btn" :disabled="!streamActive" @click="capturePhoto">
                <i class="fas fa-camera"></i>
                Take Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 添加加载状态显示 -->
    <div v-if="store.isLoading" class="loading-overlay">
      <el-progress type="circle" :percentage="store.uploadProgress"
        :status="store.uploadProgress >= 100 ? 'success' : ''" />
      <p>{{ store.uploadProgress < 100 ? 'Uploading image...' : 'Processing your image...' }}</p>
    </div>

    <!-- 添加错误提示 -->
    <el-alert v-if="store.error" :title="store.error" type="error" @close="store.error = null" show-icon
      :closable="true" />
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useRecognitionStore } from '../stores/recognition'
import { storeToRefs } from 'pinia'
import { ElMessage, ElAlert } from 'element-plus'
import * as ort from 'onnxruntime-web'
import flowerLabelsMap from '../constants/flower_labels.json'

const store = useRecognitionStore()
const { isLoading, error, uploadProgress } = storeToRefs(store)
const fileInput = ref(null)
const videoElement = ref(null)
const canvasElement = ref(null)
const cameraPreview = ref(null)
const streamActive = ref(false)
let stream = null

// 添加本地识别相关的状态
const localRecognition = ref(false)
const session = ref(null)
const IMAGE_SIZE = 256

// 将 ID-名称 映射转换为数组
const createLabelsArray = (labelsMap) => {
  const maxId = Math.max(...Object.keys(labelsMap).map(id => parseInt(id)))
  const labelsArray = new Array(maxId + 1).fill('unknown')
  Object.entries(labelsMap).forEach(([id, name]) => {
    labelsArray[parseInt(id)] = name
  })
  return labelsArray
}

const labels = ref(createLabelsArray(flowerLabelsMap))


// 定义预处理参数
const IMAGENET_MEAN = [0.485, 0.456, 0.406]
const IMAGENET_STD = [0.229, 0.224, 0.225]

// 图像预处理函数
const preprocessImage = async (imageElement) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const scale = Math.max(IMAGE_SIZE / imageElement.width, IMAGE_SIZE / imageElement.height)
  const newWidth = Math.round(imageElement.width * scale)
  const newHeight = Math.round(imageElement.height * scale)

  canvas.width = newWidth
  canvas.height = newHeight
  ctx.drawImage(imageElement, 0, 0, newWidth, newHeight)

  const startX = Math.floor((newWidth - IMAGE_SIZE) / 2)
  const startY = Math.floor((newHeight - IMAGE_SIZE) / 2)

  const imageData = ctx.getImageData(startX, startY, IMAGE_SIZE, IMAGE_SIZE)
  const data = imageData.data

  const float32Data = new Float32Array(1 * 3 * IMAGE_SIZE * IMAGE_SIZE)

  for (let y = 0; y < IMAGE_SIZE; y++) {
    for (let x = 0; x < IMAGE_SIZE; x++) {
      const pixelIndex = (y * IMAGE_SIZE + x) * 4
      for (let c = 0; c < 3; c++) {
        const normalized = (data[pixelIndex + c] / 255.0 - IMAGENET_MEAN[c]) / IMAGENET_STD[c]
        float32Data[c * IMAGE_SIZE * IMAGE_SIZE + y * IMAGE_SIZE + x] = normalized
      }
    }
  }

  return float32Data
}

// 初始化 ONNX Runtime
onMounted(async () => {
  try {
    session.value = await ort.InferenceSession.create('/shufflenet_v2_x1.onnx')
    console.log('Model loaded successfully')
    console.log('Input name:', session.value.inputNames[0])
  } catch (e) {
    console.error('Failed to load model:', e)
    localRecognition.value = false
  }
})

// 处理模式切换
const handleModeChange = async (value) => {
  if (value && !session.value) {
    try {
      session.value = await ort.InferenceSession.create('/shufflenet_v2_x1.onnx')
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Failed to load model:', error)
      ElMessage.error('Failed to initialize local recognition model')
      localRecognition.value = false
    }
  }
}

// 修改文件处理逻辑
const processFile = async (file) => {
  if (file.type.startsWith('image/')) {
    if (file.size <= 5 * 1024 * 1024) {
      store.setSelectedImage(file)
      console.log('File processed, starting recognition...')

      try {
        if (localRecognition.value) {
          // 本地识别逻辑
          const img = new Image()
          img.src = URL.createObjectURL(file)
          await new Promise(resolve => img.onload = resolve)

          // 预处理图片
          const preprocessedData = await preprocessImage(img)

          // 创建输入 tensor
          const input = new ort.Tensor(
            'float32',
            preprocessedData,
            [1, 3, IMAGE_SIZE, IMAGE_SIZE]
          )

          // 获取模型的输入名称
          const inputName = session.value.inputNames[0]

          // 运行推理
          const results = await session.value.run({
            [inputName]: input
          })

          // 处理结果
          const output = results[session.value.outputNames[0]]
          const scores = Array.from(output.data)

          // 使用 softmax 转换为概率
          const expScores = scores.map(Math.exp)
          const sumExp = expScores.reduce((a, b) => a + b, 0)
          const probs = expScores.map(exp => exp / sumExp)

          // 获取 top 3 预测并过滤掉 unknown
          const top3Indices = Array.from(Array(probs.length).keys())
            .sort((a, b) => probs[b] - probs[a])
            .slice(0, 3)

          const predictions = top3Indices
            .filter(index => labels.value[index] !== 'unknown')
            .map(index => ({
              label: labels.value[index],
              probability: (probs[index] * 100).toFixed(2)
            }))
          console.log(predictions)
          store.setRecognitionResult(predictions)
        } else {
          // 服务端识别
          await store.recognizeFlower(file)
        }
        console.log('Recognition completed')
      } catch (error) {
        console.error('Recognition error:', error)
        ElMessage.error('Recognition failed: ' + error.message)
      }
    } else {
      ElMessage.error('File size should not exceed 5MB')
    }
  } else {
    ElMessage.error('Please upload an image file')
  }
}


const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
  // 重置文件输入，以便同一文件可以再次触发change事件
  event.target.value = ''
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 摄像头相关方法
const toggleCamera = async () => {
  if (streamActive.value) {
    stopCamera()
  } else {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      videoElement.value.srcObject = stream
      streamActive.value = true
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Unable to access camera. Please make sure you have granted camera permissions.')
    }
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    videoElement.value.srcObject = null
    streamActive.value = false
  }
}

const capturePhoto = () => {
  if (!streamActive.value) return

  const video = videoElement.value
  const canvas = canvasElement.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext('2d')
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob((blob) => {
    const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
    store.setSelectedImage(file)
    store.recognizeFlower(file)
    stopCamera()
  }, 'image/jpeg', 0.8)
}

// 组件卸载时清理摄像头
onUnmounted(() => {
  stopCamera()
})
</script>


<style scoped>
.upload-methods {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.method-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  flex: 1;
  border: 2px dashed #FFB6C1;
  border-radius: var(--radius);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  cursor: pointer;
  transition: var(--transition);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background-color: #FFF0F5;
}

.camera-area {
  flex: 1;
  border: 2px dashed #FFB6C1;
  border-radius: var(--radius);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* 添加开关样式 */
.mode-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.help-icon {
  color: var(--text-light);
  cursor: pointer;
  font-size: 1rem;
}

.upload-content,
.camera-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.camera-content {
  height: 100%;
  justify-content: space-between;
}

.upload-content i {
  font-size: 3rem;
  color: var(--primary-color);
}

.camera-preview {
  width: 100%;
  flex: 1;
  background-color: #FFF0F5;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  overflow: hidden;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.camera-icon {
  font-size: 2.5rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.camera-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.camera-btn,
.upload-btn {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.camera-btn:hover:not(:disabled),
.upload-btn:hover {
  background-color: var(--secondary-color);
}

.camera-btn:disabled {
  background-color: #FFB6C1;
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-hint {
  color: var(--text-light);
  font-size: 0.9rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1000;
}

.loading-overlay p {
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-methods {
    flex-direction: column;
  }

  .method-box {
    width: 100%;
  }

  .camera-buttons {
    flex-direction: column;
  }

  .camera-btn {
    width: 100%;
  }

  .mode-switch {
    order: -1;
    /* 在移动端将开关移到最上方 */
    justify-content: center;
    margin: 1rem 0;
  }
}
</style>