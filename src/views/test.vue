<template>
    <div>
        <input type="file" @change="uploadFile" />

        <div v-if="progress > 0">
            <p>上传进度: {{ progress }}%</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            progress: 0,
        };
    },
    methods: {
        async uploadFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('api/test', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        console.log('progressEvent:', progressEvent);
                        if (progressEvent.total) {
                            this.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    },
                });

                console.log('上传成功:', response.data);
                this.progress = 100; // 上传完成后设置为100%
            } catch (error) {
                console.error('上传失败:', error);
                this.progress = 0; // 上传失败后重置进度
            }
        },
    },
};
</script>