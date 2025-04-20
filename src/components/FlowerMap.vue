<template>
    <div class="map-container">
        <div id="baidu-map" class="baidu-map"></div>
        <div v-if="mapLoadError" class="error-message">
            {{ errorMessage }}
        </div>
        <div v-if="loading" class="loading-message">
            加载中...
        </div>
        <div class="map-controls" v-if="mapInstance">
            <button @click="locateCurrentPosition" class="locate-btn" :disabled="locating">
                {{ locating ? '定位中...' : '定位当前位置' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRecognitionStore } from '../stores/recognition'

const store = useRecognitionStore()
const mapInstance = ref(null)
const currentMarker = ref(null)
const searchResults = ref([])
const mapLoadError = ref(false)
const errorMessage = ref('')
const loading = ref(true)
const locating = ref(false)

// 初始化地图
const initMap = async () => {
    try {
        loading.value = true;
        
        // 确保BMap已加载
        if (!window.BMap) {
            throw new Error('百度地图 API 未加载');
        }

        mapInstance.value = new window.BMap.Map("baidu-map", {
            enableMapClick: false  // 禁用地图点击事件，提高性能
        });
        
        // 默认中心设置为北京
        const defaultPoint = new window.BMap.Point(116.404, 39.915);
        mapInstance.value.centerAndZoom(defaultPoint, 12);
        
        // 添加基础控件，使用最小配置
        const navigationControl = new window.BMap.NavigationControl({
            type: window.BMAP_NAVIGATION_CONTROL_SMALL
        });
        mapInstance.value.addControl(navigationControl);
        
        // 使用passive选项添加滚轮缩放
        mapInstance.value.addEventListener('mousewheel', () => {}, { passive: true });
        mapInstance.value.enableScrollWheelZoom();
        
        console.log('地图初始化成功');
        
        // 尝试定位
        await tryLocation();
        
    } catch (error) {
        console.error("地图初始化失败:", error);
        mapLoadError.value = true;
        errorMessage.value = '地图初始化失败，请刷新页面重试';
    } finally {
        loading.value = false;
    }
};

// 尝试多种定位方式
const tryLocation = async () => {
    try {
        await locateCurrentPosition();
    } catch (error) {
        console.warn('浏览器定位失败，尝试IP定位:', error);
        await useIPLocation();
    }
};

// IP定位
const useIPLocation = () => {
    return new Promise((resolve, reject) => {
        if (!mapInstance.value) {
            reject(new Error('地图未初始化'));
            return;
        }

        const myCity = new window.BMap.LocalCity();
        myCity.get(async (result) => {
            if (result && result.center) {
                try {
                    mapInstance.value.setCenter(result.name);
                    await updateMarker(result.center);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error('IP定位失败'));
            }
        });
    });
};

// 更新标记位置
const updateMarker = async (point) => {
    if (!mapInstance.value) return;

    // 清除旧标记
    if (currentMarker.value) {
        mapInstance.value.removeOverlay(currentMarker.value);
    }

    // 创建新标记
    const myIcon = new window.BMap.Icon(
        "https://api.map.baidu.com/images/geolocation-control/point/position-icon-14x14.png",
        new window.BMap.Size(14, 14)
    );
    currentMarker.value = new window.BMap.Marker(point, { icon: myIcon });
    mapInstance.value.addOverlay(currentMarker.value);
    mapInstance.value.panTo(point);

    // 如果有识别结果，搜索附近花卉
    if (store.recognitionResult?.name) {
        await searchNearbyFlowers(point);
    }
};

// 获取当前位置
const locateCurrentPosition = async () => {
    if (!mapInstance.value || locating.value) return;
    
    locating.value = true;
    
    try {
        return new Promise((resolve, reject) => {
            const geolocation = new window.BMap.Geolocation();
            
            // 配置定位选项
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            geolocation.getCurrentPosition(async function(result) {
                if (this.getStatus() == window.BMAP_STATUS_SUCCESS) {
                    await updateMarker(result.point);
                    resolve(result);
                } else {
                    reject(new Error('定位失败: ' + this.getStatus()));
                }
            }, options);
            
            // 设置超时
            setTimeout(() => {
                reject(new Error('定位超时'));
            }, options.timeout);
        });
    } catch (error) {
        console.error('定位出错:', error);
        throw error;
    } finally {
        locating.value = false;
    }
};

// 搜索附近花卉
const searchNearbyFlowers = async (centerPoint) => {
    if (!mapInstance.value || !store.recognitionResult?.name) return;
    
    clearSearchResults();
    
    return new Promise((resolve) => {
        const local = new window.BMap.LocalSearch(mapInstance.value, {
            renderOptions: { 
                map: mapInstance.value,
                autoViewport: false
            },
            pageCapacity: 10,
            onSearchComplete: (results) => {
                if (local.getStatus() === window.BMAP_STATUS_SUCCESS) {
                    if (results.getCurrentNumPois() === 0) {
                        console.log('未找到相关位置');
                        resolve([]);
                        return;
                    }
                    
                    const points = [];
                    for (let i = 0; i < results.getCurrentNumPois(); i++) {
                        const poi = results.getPoi(i);
                        points.push(poi.point);
                        createInfoMarker(poi);
                    }
                    searchResults.value = points;
                    resolve(points);
                } else {
                    resolve([]);
                }
            }
        });
        
        const bounds = new window.BMap.Circle(centerPoint, 5000);
        local.searchInBounds(store.recognitionResult.name + " 花", bounds.getBounds());
    });
};

// 创建信息窗口标记
const createInfoMarker = (poi) => {
    if (!mapInstance.value) return;
    
    const marker = new window.BMap.Marker(poi.point);
    mapInstance.value.addOverlay(marker);
    
    let content = `
        <div class="map-info-window">
            <h4>${poi.title}</h4>
            <p>地址：${poi.address || '暂无地址信息'}</p>
    `;
    
    if (poi.distance) {
        content += `<p>距离：${poi.distance}米</p>`;
    }
    
    content += `</div>`;
    
    const infoWindow = new window.BMap.InfoWindow(content, {
        width: 250,
        height: 120,
        title: store.recognitionResult.name,
        enableCloseOnClick: true
    });
    
    marker.addEventListener('click', () => {
        marker.openInfoWindow(infoWindow);
    }, { passive: true });
};

// 清除搜索结果
const clearSearchResults = () => {
    if (!mapInstance.value) return;
    mapInstance.value.clearOverlays();
    if (currentMarker.value) {
        mapInstance.value.addOverlay(currentMarker.value);
    }
    searchResults.value = [];
};

// 清理函数
const cleanup = () => {
    if (mapInstance.value) {
        mapInstance.value.clearOverlays();
        mapInstance.value = null;
    }
};

// 监听识别结果变化
watch(() => store.recognitionResult, async (newResult) => {
    if (newResult?.name && mapInstance.value && currentMarker.value) {
        await searchNearbyFlowers(currentMarker.value.getPosition());
    }
}, { immediate: true });

onMounted(() => {
    initMap();
});

onUnmounted(() => {
    cleanup();
});
</script>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 400px;
    margin-top: 1rem;
}

.baidu-map {
    width: 100%;
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.error-message,
.loading-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 1000;
}

.error-message {
    background-color: rgba(255, 0, 0, 0.8);
    color: white;
}

.loading-message {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
}

.map-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
}

.locate-btn {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.locate-btn:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.locate-btn:not(:disabled):hover {
    background-color: #f5f5f5;
}

:deep(.BMap_bubble_content) {
    padding: 10px;
}

:deep(.map-info-window) {
    font-size: 14px;
}

:deep(.map-info-window h4) {
    margin: 0 0 8px 0;
    color: #333;
}

:deep(.map-info-window p) {
    margin: 4px 0;
    color: #666;
}
</style>