export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { processScreenshot } from '@/lib/process-screenshot'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  const rows = await sql`
    SELECT
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'title', i.title,
            'category', i.category,
            'item_count', i.item_count
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
      ) as insights
    FROM screenshots s
    LEFT JOIN screenshot_insights si ON si.screenshot_id = s.id
    LEFT JOIN insights i ON i.id = si.insight_id
    WHERE s.id = ${params.id} AND s.user_id = ${user.id}
    GROUP BY s.id
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Retry processing
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  const rows = await sql`
    SELECT * FROM screenshots
    WHERE id = ${params.id} AND user_id = ${user.id}
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const screenshot = rows[0]

  processScreenshot(screenshot.id, screenshot.image_url, user.id).catch((err) => {
    console.error('Retry processing error:', err)
  })

  return NextResponse.json({ ok: true, message: 'Processing started' })
}
