'use client'

import { useEffect, useState } from 'react'

export default function VisitCounter() {
    const [visitCount, setVisitCount] = useState(0)
    const [lastVisit, setLastVisit] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isVisible, setIsVisible] = useState(true)

    const formatLastVisit = (timestamp: string | null) => {
        if (!timestamp) return 'ไม่มีข้อมูล'

        const date = new Date(timestamp)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'เมื่อสักครู่'
        if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`

        // For longer periods, show the actual date
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    useEffect(() => {
        const incrementVisitCount = async () => {
            try {
                // Increment visit count via API
                const response = await fetch('/api/visits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setVisitCount(data.count)
                    setLastVisit(data.last_visit)
                } else {
                    // Fallback: get current count without incrementing
                    const getResponse = await fetch('/api/visits')
                    if (getResponse.ok) {
                        const data = await getResponse.json()
                        setVisitCount(data.count)
                        setLastVisit(data.last_visit)
                    }
                }
            } catch (error) {
                console.error('Error updating visit count:', error)
                // Fallback to show 0 if API fails
                setVisitCount(0)
                setLastVisit(null)
            } finally {
                setLoading(false)
            }
        }

        incrementVisitCount()
    }, [])

    // Fade out after 3 seconds
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [loading])

    if (loading) {
        return (
            <div className="fixed top-2 right-4 z-50">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                    <div className="text-xs text-gray-600 font-medium">
                        เข้าชม: <span className="text-blue-600 font-semibold">...</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        ครั้งล่าสุด: ...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`fixed top-2 right-4 z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <div className="text-xs text-gray-600 font-medium">
                    เข้าชม: <span className="text-blue-600 font-semibold">{visitCount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    ครั้งล่าสุด: {formatLastVisit(lastVisit)}
                </div>
            </div>
        </div>
    )
}