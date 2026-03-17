export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { db, screenshots } from '@/db'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { processScreenshot } from '@/lib/process-screenshot'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const user = await getOrCreateUser()

    // Upload to Vercel Blob
    const blob = await put(`screenshots/${user.id}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Create screenshot record
    const [screenshot] = await db
      .insert(screenshots)
      .values({
        userId: user.id,
        imageUrl: blob.url,
        thumbnailUrl: blob.url,
        isProcessed: false,
      })
      .returning()

    // Process async — do not await
    processScreenshot(screenshot.id, blob.url, user.id).catch((err) => {
      console.error('Async processing error:', err)
    })

    return NextResponse.json({ id: screenshot.id, imageUrl: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await getOrCreateUser()
    const rows = await db
      .select()
      .from(screenshots)
      .where(eq(screenshots.userId, user.id))
      .orderBy(screenshots.createdAt)

    return NextResponse.json(rows.reverse())
  } catch {
    return NextResponse.json({ error: 'Failed to fetch screenshots' }, { status: 500 })
  }
}
