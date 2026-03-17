export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'

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
      i.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', it.id,
            'title', it.title,
            'detail', it.detail,
            'created_at', it.created_at
          ) ORDER BY it.created_at
        ) FILTER (WHERE it.id IS NOT NULL),
        '[]'
      ) as items,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', s.id,
              'image_url', s.image_url,
              'thumbnail_url', s.thumbnail_url,
              'created_at', s.created_at
            ) ORDER BY s.created_at DESC
          )
          FROM screenshot_insights si
          JOIN screenshots s ON s.id = si.screenshot_id
          WHERE si.insight_id = i.id
        ),
        '[]'
      ) as sources
    FROM insights i
    LEFT JOIN items it ON it.insight_id = i.id
    WHERE i.id = ${params.id} AND i.user_id = ${user.id}
    GROUP BY i.id
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()
  const body = await req.json()

  const rows = await sql`
    UPDATE insights
    SET
      title = COALESCE(${body.title ?? null}, title),
      hero_image_url = COALESCE(${body.heroImageUrl ?? null}, hero_image_url),
      last_updated = NOW()
    WHERE id = ${params.id} AND user_id = ${user.id}
    RETURNING *
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Refresh search_vector if title changed
  if (body.title) {
    await sql`
      UPDATE insights
      SET search_vector = to_tsvector(
        'english',
        title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(category, '') || ' ' || COALESCE(
          (SELECT string_agg(it.title, ' ') FROM items it WHERE it.insight_id = insights.id),
          ''
        )
      )
      WHERE id = ${params.id}
    `
  }

  return NextResponse.json(rows[0])
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  await sql`
    DELETE FROM insights
    WHERE id = ${params.id} AND user_id = ${user.id}
  `

  return NextResponse.json({ ok: true })
}
