<template>

  <!-- 动态背景元素 -->
  <!-- 生成更多不同类型的花瓣 -->
  <div class="floating-elements">
    <div v-for="petal in petals" :key="petal.id" class="floating-petal" :style="petal.style">
      {{ petal.type }}
    </div>
  </div>

  <div class="hero-section">
    <!-- 左侧装饰元素 -->
    <div class="decorative-element left">
      <el-icon class="floating">
        <PictureFilled />
      </el-icon>
      <el-icon class="floating delay-1">
        <Camera />
      </el-icon>
      <el-icon class="floating delay-2">
        <Picture />
      </el-icon>
    </div>

    <div class="hero-content">
      <div class="title-section">
        <h1>Welcome to Flower Recognition</h1>
        <p class="subtitle">Discover the beauty of flowers and explore different styles</p>
      </div>

      <!-- 功能卡片区域 -->
      <div class="feature-cards">
        <div class="feature-card recognition">
          <el-icon>
            <Camera />
          </el-icon>
          <h3>Flower Recognition</h3>
          <p>Identify flowers with AI technology</p>
          <router-link to="/flowerRecognition" class="card-button" @click="handleNavigation('/flowerRecognition')">
            Try Now
          </router-link>
        </div>

        <div class="feature-card transfer">
          <el-icon>
            <Picture />
          </el-icon>
          <h3>Style Transfer</h3>
          <p>Transform your photos with artistic styles</p>
          <router-link to="/styleTransfer" class="card-button" @click="handleNavigation('/styleTransfer')">
            Try Now
          </router-link>
        </div>
      </div>

      <!-- 特性展示 -->
      <div class="features-grid">
        <div class="feature-item">
          <el-icon>
            <Loading />
          </el-icon>
          <h4>Real-time Recognition</h4>
          <p>Quick and accurate results</p>
        </div>
        <div class="feature-item">
          <el-icon>
            <Operation />
          </el-icon>
          <h4>Multiple Styles</h4>
          <p>Various artistic effects</p>
        </div>
        <div class="feature-item">
          <el-icon>
            <DataLine />
          </el-icon>
          <h4>History Tracking</h4>
          <p>Save and review results</p>
        </div>
        <div class="feature-item">
          <el-icon>
            <Share />
          </el-icon>
          <h4>Easy Sharing</h4>
          <p>Share with friends</p>
        </div>
      </div>

      <!-- 登录提示 -->
      <div class="auth-section" v-if="!userStore.isLoggedIn">
        <p class="auth-text">
          Want to save your results and access more features?
        </p>
        <router-link to="/login" class="login-link">
          Login or Register now
          <el-icon>
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>
    </div>

    <!-- 右侧装饰元素 -->
    <div class="decorative-element right">
      <el-icon class="floating delay-2">
        <PictureFilled />
      </el-icon>
      <el-icon class="floating">
        <Camera />
      </el-icon>
      <el-icon class="floating delay-1">
        <Picture />
      </el-icon>
    </div>
  </div>

  <!-- 添加左右侧的交互区域 -->
  <div class="interactive-sides">
    <div class="side-area left-area" @click="createRippleEffect($event, 'left')">
      <div class="ripple-container"></div>
      <!-- 动态生成的花瓣将在这里显示 -->
      <div v-for="petal in leftSidePetals" :key="petal.id" class="burst-petal" :style="petal.style">
        {{ petal.type }}
      </div>
    </div>

    <div class="side-area right-area" @click="createRippleEffect($event, 'right')">
      <div class="ripple-container"></div>
      <!-- 动态生成的花瓣将在这里显示 -->
      <div v-for="petal in rightSidePetals" :key="petal.id" class="burst-petal" :style="petal.style">
        {{ petal.type }}
      </div>
    </div>
  </div>

  <!-- 底部波浪效果 -->
  <div class="wave-container">
    <svg class="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
      <path fill="rgba(255, 105, 180, 0.1)" fill-opacity="1"
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
      </path>
    </svg>
  </div>

  <!-- 交互式画布背景 -->
  <canvas ref="interactiveCanvas" class="interactive-background"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import {
  Camera,
  Picture,
  PictureFilled,
  Loading,
  Operation,
  DataLine,
  Share,
  ArrowRight
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const interactiveCanvas = ref(null)
let animationFrame = null
// 添加两侧花瓣状态管理
const leftSidePetals = ref([])
const rightSidePetals = ref([])
const router = useRouter()

const handleNavigation = (path) => {
  router.push(path).then(() => {
    window.location.reload()
  })
}

// 生成绽放效果的花瓣
const createBurstPetals = (side, x, y) => {
  const petals = []
  const petalCount = 5
  const flowers = ['🌸', '🌺', '💮', '🌷']

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * 360
    const distance = 100 + Math.random() * 50
    const duration = 0.5 + Math.random() * 0.5
    const delay = Math.random() * 0.5

    petals.push({
      id: `${side}-${Date.now()}-${i}`,
      type: flowers[Math.floor(Math.random() * flowers.length)],
      style: {
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        position: 'absolute',
        left: x + 'px',
        top: y + 'px'
      }
    })
  }

  if (side === 'left') {
    leftSidePetals.value = [...leftSidePetals.value, ...petals]
  } else {
    rightSidePetals.value = [...rightSidePetals.value, ...petals]
  }

  // 清理花瓣
  setTimeout(() => {
    if (side === 'left') {
      leftSidePetals.value = leftSidePetals.value.filter(p => !petals.includes(p))
    } else {
      rightSidePetals.value = rightSidePetals.value.filter(p => !petals.includes(p))
    }
  }, 1500)
}

// 创建涟漪效果
const createRippleEffect = (event, side) => {
  const container = event.currentTarget.querySelector('.ripple-container')
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 创建涟漪元素
  const ripple = document.createElement('div')
  ripple.className = 'ripple'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  container.appendChild(ripple)

  // 创建花瓣绽放效果
  createBurstPetals(side, x, y)

  // 清理涟漪元素
  setTimeout(() => {
    ripple.remove()
  }, 1000)
}


const generatePetal = (id) => {
  return {
    id,
    type: ['🌸', '🌺', '💮', '🌷'][Math.floor(Math.random() * 4)],
    style: {
      '--delay': `${Math.random() * 10}s`,
      '--duration': `${10 + Math.random() * 15}s`,
      '--start-pos': `${Math.random() * 100}%`,
      '--size': `${0.8 + Math.random() * 0.6}`,
      '--rotate': `${Math.random() * 360}deg`,
      '--swing': `${-30 + Math.random() * 60}deg`
    }
  }
}

const petals = ref([])

// 初始化花瓣
const initPetals = () => {
  petals.value = Array.from({ length: 20 }, (_, i) => generatePetal(i))
}

// 定期刷新花瓣
let petalInterval

onMounted(() => {
  initPetals()
  // 每30秒刷新一次花瓣
  petalInterval = setInterval(initPetals, 30000)
})

onUnmounted(() => {
  if (petalInterval) {
    clearInterval(petalInterval)
  }
})


// 交互式背景动画
onMounted(() => {
  const canvas = interactiveCanvas.value
  const ctx = canvas.getContext('2d')
  const particles = []

  // 设置画布尺寸
  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  // 创建粒子
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 3 + 1
      this.speedX = Math.random() * 3 - 1.5
      this.speedY = Math.random() * 3 - 1.5
      this.color = `rgba(255, 182, 193, ${Math.random() * 0.5})`
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY

      if (this.x > canvas.width) this.x = 0
      if (this.x < 0) this.x = canvas.width
      if (this.y > canvas.height) this.y = 0
      if (this.y < 0) this.y = canvas.height
    }

    draw() {
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 初始化粒子
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle())
  }

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(particle => {
      particle.update()
      particle.draw()
    })

    animationFrame = requestAnimationFrame(animate)
  }

  animate()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.hero-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-align: center;
  max-width: 1000px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
  /* 降低 z-index，之前是 10 */
  position: relative;
}

.title-section {
  margin-bottom: 3rem;
}

.title-section h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  color: var(--text-color);
  font-size: 1.2rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 105, 180, 0.2);
}

.feature-card i {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.card-button {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: var(--radius);
  text-decoration: none;
  margin-top: 1rem;
  transition: var(--transition);
}

.card-button:hover {
  background-color: var(--secondary-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

/*更改 */
.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius);
  transition: all 0.3s ease;
  /* 使用 all 让所有变化都有过渡效果 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid transparent;
  /* 添加透明边框 */
  position: relative;
  /* 为伪元素做准备 */
}

.feature-item:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 105, 180, 0.3);
  /* 增加阴影范围和强度 */
  border-color: rgba(255, 105, 180, 0.2);
  /* 显示粉色边框 */
}

/* 添加悬停时的光晕效果 */
.feature-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius);
  background: radial-gradient(circle at center,
      rgba(255, 105, 180, 0.1) 0%,
      transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-item:hover::after {
  opacity: 1;
}

.feature-item i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  transition: transform 0.3s ease, color 0.3s ease;
}

.feature-item:hover i {
  transform: scale(1.1);
  /* 图标稍微放大 */
  color: var(--secondary-color);
  /* 图标颜色加深 */
}

.feature-item h4 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.feature-item:hover h4 {
  color: var(--primary-color);
}

.feature-item p {
  color: var(--text-light);
  font-size: 0.9rem;
}

.auth-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--el-border-color-light);
}

.auth-text {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.login-link:hover {
  color: var(--secondary-color);
}

/* 装饰元素样式 */
.decorative-element {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.decorative-element.left {
  left: 5%;
}

.decorative-element.right {
  right: 5%;
}

.floating {
  font-size: 2rem;
  color: var(--primary-color);
  animation: float 3s ease-in-out infinite;
}

.delay-1 {
  animation-delay: 1s;
}

.delay-2 {
  animation-delay: 2s;
}

/* 背景样式 */
.interactive-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* 保持在最底层 */
  pointer-events: none;
}

/* 漂浮元素容器 */
.floating-elements {
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
  /* 提高 z-index，确保在 hero-content 上层 */
}

/* 角落装饰 */
.corner-decoration {
  position: fixed;
  width: 200px;
  height: 200px;
  z-index: 3;
  /* 提高 z-index，确保在花瓣上层 */
}

.wave-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 1;
  /* 与内容框同层 */
}

.top-left {
  top: 0;
  left: 0;
  transform: rotate(45deg);
}

.top-right {
  top: 0;
  right: 0;
  transform: rotate(-45deg);
}

.flower-pattern {
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at center,
      rgba(255, 182, 193, 0.2) 0%,
      rgba(255, 182, 193, 0.1) 30%,
      transparent 70%);
  animation: rotatePattern 20s linear infinite;
}

/* 漂浮花瓣 */
.floating-petal {
  position: fixed;
  font-size: 24px;
  opacity: 0;
  transform-origin: center;
  will-change: transform, opacity;
  left: var(--start-pos);
  z-index: 2;
}

/* 动画定义 */
@keyframes float {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes rotatePattern {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes floatPetal {
  0% {
    transform: translateY(-100%) translateX(0) rotate(var(--rotate)) scale(var(--size));
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  45% {
    transform: translateY(45vh) translateX(-20px) rotate(calc(var(--rotate) + 180deg)) scale(var(--size));
  }

  55% {
    transform: translateY(55vh) translateX(20px) rotate(calc(var(--rotate) + 270deg)) scale(var(--size));
  }

  75% {
    transform: translateY(75vh) translateX(-15px) rotate(calc(var(--rotate) + 360deg)) scale(var(--size));
    opacity: 0.8;
  }

  100% {
    transform: translateY(105vh) translateX(15px) rotate(calc(var(--rotate) + 480deg)) scale(var(--size));
    opacity: 0;
  }
}

/* 添加摆动动画 */
@keyframes swingPetal {
  0% {
    transform: rotate(calc(var(--rotate) - var(--swing)));
  }

  50% {
    transform: rotate(calc(var(--rotate) + var(--swing)));
  }

  100% {
    transform: rotate(calc(var(--rotate) - var(--swing)));
  }
}

/* 添加风的效果 */
.wind-effect {
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.3;
  background:
    repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px);
  animation: windMove 10s linear infinite;
}

@keyframes windMove {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* 添加交互区域样式 */
.interactive-sides {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.side-area {
  position: absolute;
  top: 0;
  height: 100%;
  width: 20%;
  pointer-events: auto;
  cursor: pointer;
  overflow: hidden;
}

.left-area {
  left: 0;
}

.right-area {
  right: 0;
}

/* 涟漪效果 */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 182, 193, 0.3);
  transform: translate(-50%, -50%);
  animation: ripple 1s ease-out;
}

/* 花瓣绽放效果 */
.burst-petal {
  position: absolute;
  font-size: 24px;
  pointer-events: none;
  animation: burstPetal var(--duration) ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }

  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

@keyframes burstPetal {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform:
      translate(calc(-50% + cos(var(--angle)) * var(--distance)),
        calc(-50% + sin(var(--angle)) * var(--distance))) rotate(calc(var(--angle) + 360deg));
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content {
    padding: 2rem;
  }

  .title-section h1 {
    font-size: 2rem;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .decorative-element {
    display: none;
  }

  .corner-decoration {
    width: 100px;
    height: 100px;
  }

  .side-area {
    width: 15%;
  }

  .burst-petal {
    font-size: 18px;
  }
}

.floating-petal {
  animation: floatPetal var(--duration) linear infinite;
  animation-delay: var(--delay);
}
</style>