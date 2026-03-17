export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()
  const body = await req.json()

  const rows = await sql`
    UPDATE items
    SET
      title = COALESCE(${body.title ?? null}, title),
      detail = COALESCE(${body.detail ?? null}, detail)
    WHERE id = ${params.id} AND user_id = ${user.id}
    RETURNING *
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Refresh search_vector on parent insight
  await sql`
    UPDATE insights
    SET search_vector = to_tsvector(
      'english',
      title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(
        (SELECT string_agg(it.title, ' ') FROM items it WHERE it.insight_id = insights.id),
        ''
      )
    )
    WHERE id = ${rows[0].insight_id}
  `

  return NextResponse.json(rows[0])
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  const rows = await sql`
    DELETE FROM items WHERE id = ${params.id} AND user_id = ${user.id} RETURNING insight_id
  `

  if (rows.length > 0) {
    const insightId = rows[0].insight_id
    await sql`
      UPDATE insights
      SET
        item_count = (SELECT COUNT(*) FROM items WHERE insight_id = ${insightId}),
        last_updated = NOW()
      WHERE id = ${insightId}
    `
  }

  return NextResponse.json({ ok: true })
}
