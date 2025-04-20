import { http, HttpResponse } from 'msw'

// Mock 数据生成函数
const generateFlowerData = () => {
    // 确保生成一致的匹配结果
    const flowerIndex = Math.floor(Math.random() * 6)
    const flowerNames = ['Rose', 'Sunflower', 'Tulip', 'Daisy', 'Lily', 'Orchid']
    const scientificNames = [
        'Rosa',
        'Helianthus annuus',
        'Tulipa',
        'Bellis perennis',
        'Lilium',
        'Orchidaceae'
    ]

    const primaryConfidence = Math.floor(Math.random() * 15 + 85) // 85-100
    const secondaryConfidence = Math.floor(Math.random() * 15 + 70) // 70-85
    const tertiaryConfidence = Math.floor(Math.random() * 20 + 50) // 50-70

    return {
        success: true,
        data: {
            name: flowerNames[flowerIndex],
            scientificName: scientificNames[flowerIndex],
            matches: [
                {
                    name: flowerNames[flowerIndex],
                    confidence: primaryConfidence
                },
                {
                    name: flowerNames[(flowerIndex + 1) % 6],
                    confidence: secondaryConfidence
                },
                {
                    name: flowerNames[(flowerIndex + 2) % 6],
                    confidence: tertiaryConfidence
                }
            ],
            details: {
                sunlight: ['Full Sun', 'Partial Shade', 'Full Shade'][
                    Math.floor(Math.random() * 3)
                ],
                water: ['Regular', 'Moderate', 'Low'][Math.floor(Math.random() * 3)],
                temperature: ['15-25°C', '20-30°C', '10-20°C'][
                    Math.floor(Math.random() * 3)
                ],
                season: ['Spring', 'Summer', 'All Year'][Math.floor(Math.random() * 3)],
                soil: ['Well-drained', 'Sandy', 'Clay', 'Loamy'][
                    Math.floor(Math.random() * 4)
                ],
                height: ['30-60cm', '60-100cm', '100-150cm'][
                    Math.floor(Math.random() * 3)
                ],
                spread: ['20-40cm', '40-80cm', '80-120cm'][
                    Math.floor(Math.random() * 3)
                ],
                lifespan: ['Annual', 'Perennial', 'Biennial'][
                    Math.floor(Math.random() * 3)
                ]
            }
        }
    }
}

// Mock API 处理程序
export const handlers = [
    //测试
    http.post('/api/test', async () => {
        // 模拟网络延迟
        await new Promise(r => setTimeout(r, 1500))
        const mockData = generateFlowerData()
        console.log('Mock API Response:', mockData)
        return HttpResponse.json(mockData)
    }),
    // 识别花朵
    http.post('/api/recognize', async () => {
        // 模拟网络延迟
        await new Promise(r => setTimeout(r, 1500))
        const mockData = generateFlowerData()
        console.log('Mock API Response:', mockData)
        return HttpResponse.json(mockData)
    }),

    // 保存历史记录
    http.post('/api/history', async () => {
        await new Promise(r => setTimeout(r, 500))
        return HttpResponse.json({
            success: true,
            message: 'Successfully saved to history'
        })
    }),

    // 获取历史记录
    http.get('/api/history', async () => {
        await new Promise(r => setTimeout(r, 500))
        return HttpResponse.json({
            success: true,
            data: Array(5)
                .fill(null)
                .map((_, index) => ({
                    id: index + 1,
                    ...generateFlowerData().data,
                    createdAt: new Date(Date.now() - index * 86400000).toISOString()
                }))
        })
    })
]