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
  const { insightId, title, detail } = await req.json()

  if (!insightId || !title) {
    return NextResponse.json({ error: 'insightId and title required' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO items (insight_id, user_id, title, detail)
    VALUES (${insightId}, ${user.id}, ${title}, ${detail ?? null})
    RETURNING *
  `

  // Update item_count and search_vector
  await sql`
    UPDATE insights
    SET
      item_count = (SELECT COUNT(*) FROM items WHERE insight_id = ${insightId}),
      last_updated = NOW(),
      search_vector = to_tsvector(
        'english',
        title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(
          (SELECT string_agg(it.title, ' ') FROM items it WHERE it.insight_id = insights.id),
          ''
        )
      )
    WHERE id = ${insightId} AND user_id = ${user.id}
  `

  return NextResponse.json(rows[0])
}
