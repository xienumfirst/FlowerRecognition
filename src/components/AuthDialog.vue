<template>
  <!-- 登录对话框 -->
  <el-dialog
    v-model="showLoginDialog"
    title="Login"
    width="400px"
    destroy-on-close
    class="login-dialog"
  >
    <el-form 
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="80px"
    >
      <el-form-item label="Username" prop="username">
        <el-input v-model="loginForm.username" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input 
          v-model="loginForm.password" 
          type="password" 
          show-password
        />
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
  <el-dialog
    v-model="showRegisterDialog"
    title="Register"
    width="400px"
    destroy-on-close
    class="register-dialog"
  >
    <el-form 
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="120px"
    >
      <el-form-item label="Username" prop="username">
        <el-input v-model="registerForm.username" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="registerForm.email" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input 
          v-model="registerForm.password" 
          type="password" 
          show-password
        />
      </el-form-item>
      <el-form-item label="Confirm" prop="confirmPassword">
        <el-input 
          v-model="registerForm.confirmPassword" 
          type="password" 
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showRegisterDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleRegister">Register</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const props = defineProps({
  showLogin: {
    type: Boolean,
    default: false
  },
  showRegister: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:showLogin', 'update:showRegister'])

// 登录相关
const showLoginDialog = ref(props.showLogin)
const loginFormRef = ref(null)
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

// 监听 showLogin 的变化
watch(() => props.showLogin, (newVal) => {
  showLoginDialog.value = newVal
})

// 监听 showLoginDialog 的变化
watch(() => showLoginDialog.value, (newVal) => {
  emit('update:showLogin', newVal)
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
const showRegisterDialog = ref(props.showRegister)
const registerFormRef = ref(null)
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 监听 showRegister 的变化
watch(() => props.showRegister, (newVal) => {
  showRegisterDialog.value = newVal
})

// 监听 showRegisterDialog 的变化
watch(() => showRegisterDialog.value, (newVal) => {
  emit('update:showRegister', newVal)
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

const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
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

const handleRegister = () => {
  if (!registerFormRef.value) return
  
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        showRegisterDialog.value = false
        ElMessage.success('Registration successful, please login')
      } catch (error) {
        ElMessage.error('Registration failed: ' + error.message)
      }
    }
  })
}
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: var(--radius);
}

:deep(.el-dialog__header) {
  background-color: var(--background-color);
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 1.5rem;
}

:deep(.el-dialog__body) {
  padding: 2rem;
}

:deep(.el-dialog__footer) {
  padding: 1rem 2rem;
  border-top: 1px solid var(--el-border-color-light);
}
</style>