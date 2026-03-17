export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json([])
  }

  const rows = await sql`
    SELECT
      i.*,
      ts_rank(i.search_vector, plainto_tsquery('english', ${q})) as rank
    FROM insights i
    WHERE i.user_id = ${user.id}
      AND i.search_vector @@ plainto_tsquery('english', ${q})
    ORDER BY rank DESC, i.last_updated DESC
    LIMIT 20
  `

  return NextResponse.json(rows)
}
