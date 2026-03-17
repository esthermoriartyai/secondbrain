export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()
  const { sourceId, targetId } = await req.json()

  if (!sourceId || !targetId) {
    return NextResponse.json({ error: 'sourceId and targetId required' }, { status: 400 })
  }

  // Move items from source to target
  await sql`
    UPDATE items SET insight_id = ${targetId}
    WHERE insight_id = ${sourceId} AND user_id = ${user.id}
  `

  // Move screenshot_insights from source to target (avoid duplicates)
  await sql`
    INSERT INTO screenshot_insights (screenshot_id, insight_id)
    SELECT si.screenshot_id, ${targetId}
    FROM screenshot_insights si
    WHERE si.insight_id = ${sourceId}
      AND NOT EXISTS (
        SELECT 1 FROM screenshot_insights si2
        WHERE si2.screenshot_id = si.screenshot_id AND si2.insight_id = ${targetId}
      )
  `

  // Delete source insight (cascades screenshot_insights)
  await sql`
    DELETE FROM insights WHERE id = ${sourceId} AND user_id = ${user.id}
  `

  // Recount target insight
  await sql`
    UPDATE insights
    SET
      screenshot_count = (
        SELECT COUNT(DISTINCT screenshot_id) FROM screenshot_insights WHERE insight_id = ${targetId}
      ),
      item_count = (
        SELECT COUNT(*) FROM items WHERE insight_id = ${targetId}
      ),
      last_updated = NOW()
    WHERE id = ${targetId} AND user_id = ${user.id}
  `

  // Refresh search_vector
  await sql`
    UPDATE insights
    SET search_vector = to_tsvector(
      'english',
      title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(
        (SELECT string_agg(it.title, ' ') FROM items it WHERE it.insight_id = insights.id),
        ''
      )
    )
    WHERE id = ${targetId}
  `

  return NextResponse.json({ ok: true, targetId })
}
