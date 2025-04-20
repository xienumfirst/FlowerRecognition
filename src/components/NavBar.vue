<template>
  <el-header class="navbar">
    <div class="nav-content">
      <!-- Logo和品牌名称 -->
      <router-link to="/" class="nav-brand">
        <el-icon>
          <Picture />
        </el-icon>
        <span>Flower Recognition</span>
      </router-link>

      <!-- 导航菜单 -->
      <el-menu :default-active="activeIndex" class="nav-menu" mode="horizontal" router>
        <el-menu-item index="/">Home</el-menu-item>
        <el-sub-menu index="/">
          <template #title>Explore</template>
          <el-menu-item index="/flowerRecognition">
            <router-link :to="{path:'/flowerRecognition'}" class="menu-link">flowerRecognition</router-link>
          </el-menu-item>
          <el-menu-item index="/styleTransfer">
            <router-link :to="{ path: '/styleTransfer' }" class="menu-link">styleTransfer</router-link>
          </el-menu-item>
          <el-menu-item index="/ImageSegmentation">
            <router-link :to="{ path: '/ImageSegmentation' }" class="menu-link">ImageSegmentation</router-link>
          </el-menu-item>
          <el-menu-item index="/FlowerMap">
            <router-link :to="{ path: '/FlowerMap' }" class="menu-link">FlowerMap</router-link>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/History">
          <router-link :to="{ path: '/History' }" class="menu-link">history</router-link>
        </el-menu-item>
        <el-menu-item index="/about">About</el-menu-item>
      </el-menu>

      <!-- 用户操作区 -->
      <div class="nav-user">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">{{ userStore.userInfo?.username }}</span>
              <el-icon>
                <CaretBottom />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <router-link to="/profile" class="dropdown-link">
                    <el-icon>
                      <User />
                    </el-icon>Profile
                  </router-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <router-link to="/history" class="dropdown-link">
                    <el-icon>
                      <Timer />
                    </el-icon>History
                  </router-link>
                </el-dropdown-item>
                <el-dropdown-item>
                  <router-link to="/settings" class="dropdown-link">
                    <el-icon>
                      <Setting />
                    </el-icon>Settings
                  </router-link>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>Logout
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="showLoginDialog = true">Login</el-button>
          <el-button type="primary" @click="showRegisterDialog = true">
            Register
          </el-button>
        </template>
      </div>
    </div>

    <!-- 登录对话框 -->
    <el-dialog v-model="showLoginDialog" title="Login" width="400px" destroy-on-close>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="loginForm.username" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="loginForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLoginDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleLogin">Login</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 注册对话框 -->
    <el-dialog v-model="showRegisterDialog" title="Register" width="400px" destroy-on-close>
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="120px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="registerForm.username" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="registerForm.email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="registerForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Confirm" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRegisterDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleRegister">Register</el-button>
        </span>
      </template>
    </el-dialog>
  </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  Timer,
  Setting,
  SwitchButton,
  CaretBottom,
  Picture

} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

// 用户头像
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// 登录相关
const showLoginDialog = ref(false)
const loginFormRef = ref(null)
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ]
}

// 注册相关
const showRegisterDialog = ref(false)
const registerFormRef = ref(null)
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== registerForm.value.password) {
    callback(new Error("Passwords don't match!"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Please input correct email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 实现实际的登录API调用
        await userStore.login({
          username: loginForm.value.username,
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
        })
        showLoginDialog.value = false
        ElMessage.success('Login successful')
      } catch (error) {
        ElMessage.error('Login failed: ' + error.message)
      }
    }
  })
}

// 处理注册
const handleRegister = () => {
  if (!registerFormRef.value) return
  
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 实现实际的注册API调用
        showRegisterDialog.value = false
        ElMessage.success('Registration successful, please login')
      } catch (error) {
        ElMessage.error('Registration failed: ' + error.message)
      }
    }
  })
}

// 处理登出
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('Logout successful')
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background-color: var(--white);
  box-shadow: var(--shadow);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  padding: 0;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
}

.nav-menu {
  border: none;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: var(--transition);
}

.user-info:hover {
  background: rgba(0, 0, 0, 0.05);
}

.username {
  color: var(--text-color);
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-user {
    margin-left: auto;
  }
}
</style>