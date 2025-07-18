import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const visitsFilePath = path.join(process.cwd(), 'database', 'visits.json')

// GET - Read current visit count and last visit
export async function GET() {
    try {
        if (!fs.existsSync(visitsFilePath)) {
            // Create file if it doesn't exist
            fs.writeFileSync(visitsFilePath, JSON.stringify({ count: 0, last_visit: null }))
        }

        const data = fs.readFileSync(visitsFilePath, 'utf8')
        const visits = JSON.parse(data)

        return NextResponse.json({
            count: visits.count || 0,
            last_visit: visits.last_visit || null
        })
    } catch (error) {
        console.error('Error reading visits:', error)
        return NextResponse.json({ count: 0, last_visit: null })
    }
}

// POST - Increment visit count and update last visit time
export async function POST() {
    try {
        let visits: { count: number; last_visit: string | null } = { count: 0, last_visit: null }

        if (fs.existsSync(visitsFilePath)) {
            const data = fs.readFileSync(visitsFilePath, 'utf8')
            visits = JSON.parse(data)
        }

        // Store the previous last_visit time before updating
        const previousLastVisit: string | null = visits.last_visit

        // Increment count and update last visit time to current time
        visits.count += 1
        visits.last_visit = new Date().toISOString()

        // Write back to file
        fs.writeFileSync(visitsFilePath, JSON.stringify(visits, null, 2))

        // Return the previous last visit time (not the current one)
        return NextResponse.json({
            count: visits.count,
            last_visit: previousLastVisit  // Return previous visit time, not current
        })
    } catch (error) {
        console.error('Error updating visits:', error)
        return NextResponse.json({ error: 'Failed to update visit count' }, { status: 500 })
    }
}