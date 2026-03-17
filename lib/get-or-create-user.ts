import { auth } from '@clerk/nextjs/server'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'

export async function getOrCreateUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error('Not authenticated')

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)

  if (existing.length > 0) return existing[0]

  const created = await db
    .insert(users)
    .values({ clerkId })
    .returning()

  return created[0]
}
