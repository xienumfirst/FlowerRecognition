import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
//import styleTransferView from '../views/styleTransferView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path:'/flowerRecognition',
            name:'flowerRecognition',
            component:()=>import('../views/flowerRecognitionView.vue')
        },
        {
            path:'/styleTransfer',
            name:'styleTransfer',
            component: () => import('../views/styleTransferView.vue')
        },
        {
            path:'/ImageSegmentation',
            name:'ImageSegmentation',
            component:()=>import('../views/ImageSegmentationView.vue')
        },
        {
            path:'/test',
            name:'test',
            component:()=>import('../views/test.vue')
        },
        {
            path:'/FlowerMap',
            name:'FlowerMap',
            component:()=>import('../views/flowerMapView.vue')
        },
        {
            path: '/history',
            name: 'history',
            // 修改这里，去掉多余的空格
            component: () => import('../views/HistoryView.vue')
        }
    ]
})

export default router