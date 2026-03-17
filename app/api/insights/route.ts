export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { neon } from '@neondatabase/serverless'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function GET(req: NextRequest) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL!)
  const user = await getOrCreateUser()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')

  let rows

  if (q) {
    rows = await sql`
      SELECT * FROM insights
      WHERE user_id = ${user.id}
        AND search_vector @@ plainto_tsquery('english', ${q})
      ORDER BY screenshot_count DESC, last_updated DESC
    `
  } else if (category && category !== 'All') {
    rows = await sql`
      SELECT * FROM insights
      WHERE user_id = ${user.id} AND category = ${category}
      ORDER BY screenshot_count DESC, last_updated DESC
    `
  } else {
    rows = await sql`
      SELECT * FROM insights
      WHERE user_id = ${user.id}
      ORDER BY screenshot_count DESC, last_updated DESC
    `
  }

  return NextResponse.json(rows)
}
