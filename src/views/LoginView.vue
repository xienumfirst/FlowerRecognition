<template>
    <div class="login-container">
        <div class="form-container">
            <div class="form-header">
                <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
                <p>{{ isLogin ? 'Welcome back!' : 'Create your account' }}</p>
            </div>

            <!-- 登录表单 -->
            <el-form v-if="isLogin" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0"
                class="login-form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="Username" :prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="Password" :prefix-icon="Lock"
                        show-password />
                </el-form-item>
                <el-form-item class="remember-forgot">
                    <div class="remember-forgot-container">
                        <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
                        <a class="forget-password" @click="handleForgotPassword">Forgot password?</a>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading">
                        Login
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 注册表单 -->
            <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0"
                class="register-form">
                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="Username" :prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="email">
                    <el-input v-model="registerForm.email" placeholder="Email" :prefix-icon="Message" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="Password" :prefix-icon="Lock"
                        show-password />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="Confirm Password"
                        :prefix-icon="Lock" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">
                        Register
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 切换登录/注册 -->
            <div class="form-footer">
                <div class="toggle-text">
                    {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                    <a class="toggle-link" @click="toggleForm">
                        {{ isLogin ? 'Register now' : 'Login now' }}
                    </a>
                </div>
                <router-link to="/" class="back-home">
                    <el-button link class="back-button">
                        <el-icon>
                            <Back />
                        </el-icon>
                        Back to Home
                    </el-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Back } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const loading = ref(false)

// 登录相关
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

const handleLogin = () => {
    if (!loginFormRef.value) return

    loginFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                await userStore.login({
                    username: loginForm.value.username,
                    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
                })
                ElMessage.success('Login successful')
                router.push('/')
            } catch (error) {
                ElMessage.error('Login failed: ' + error.message)
            } finally {
                loading.value = false
            }
        }
    })
}

const handleRegister = () => {
    if (!registerFormRef.value) return

    registerFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                // 模拟注册请求
                await new Promise(resolve => setTimeout(resolve, 1000))
                ElMessage.success('Registration successful, please login')
                isLogin.value = true
            } catch (error) {
                ElMessage.error('Registration failed: ' + error.message)
            } finally {
                loading.value = false
            }
        }
    })
}

const toggleForm = () => {
    isLogin.value = !isLogin.value
    // 重置表单
    if (isLogin.value) {
        loginForm.value = {
            username: '',
            password: '',
            remember: false
        }
    } else {
        registerForm.value = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    }
}

const handleForgotPassword = () => {
    ElMessage.info('Reset password functionality coming soon')
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
        url('https://source.unsplash.com/featured/?flowers') center/cover;
    padding: 2rem;
}

.form-container {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 400px;
    backdrop-filter: blur(10px);
}

.form-header {
    text-align: center;
    margin-bottom: 2rem;
}

.form-header h2 {
    color: var(--primary-color);
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.form-header p {
    color: var(--text-light);
}

.login-form,
.register-form {
    margin-bottom: 1rem;
}

:deep(.el-input__wrapper) {
    border-radius: var(--radius);
}

:deep(.el-input__inner) {
    height: 45px;
}

:deep(.el-checkbox__label) {
    color: var(--text-light);
}

.remember-forgot-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.forget-password {
    font-size: 0.9rem;
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition);
}

.forget-password:hover {
    color: var(--secondary-color);
    text-decoration: none;
}

.submit-btn {
    width: 100%;
    padding: 0.8rem;
    font-size: 1.1rem;
    border-radius: var(--radius);
    margin-top: 1rem;
}

.form-footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--el-border-color-light);
}

.toggle-text {
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.toggle-link {
    color: var(--primary-color);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition);
}

.toggle-link:hover {
    color: var(--secondary-color);
    text-decoration: none;
}

.back-home {
    text-decoration: none;
}

:deep(.back-button) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-light);
}

:deep(.back-button:hover) {
    color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 480px) {
    .form-container {
        padding: 1.5rem;
    }

    .form-header h2 {
        font-size: 1.5rem;
    }

    :deep(.el-input__inner) {
        height: 40px;
    }
}
</style>