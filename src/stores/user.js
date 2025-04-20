import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const isLoggedIn = ref(false)
    const userInfo = ref(null)

    function login(userData) {
        // TODO: 实现实际的登录API调用
        userInfo.value = userData
        isLoggedIn.value = true
    }

    function logout() {
        userInfo.value = null
        isLoggedIn.value = false
    }

    return {
        isLoggedIn,
        userInfo,
        login,
        logout
    }
})