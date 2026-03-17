export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Enable extensions
    await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Screenshots table
    await sql`
      CREATE TABLE IF NOT EXISTS screenshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        extracted_text TEXT,
        is_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Insights table
    await sql`
      CREATE TABLE IF NOT EXISTS insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        summary TEXT,
        category TEXT,
        hero_image_url TEXT,
        screenshot_count INTEGER DEFAULT 0,
        item_count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        search_vector TSVECTOR
      )
    `

    // Items table
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        detail TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Screenshot-Insights junction table
    await sql`
      CREATE TABLE IF NOT EXISTS screenshot_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        screenshot_id UUID REFERENCES screenshots(id) ON DELETE CASCADE,
        insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // GIN index for full-text search — raw SQL per spec
    await sql`CREATE INDEX IF NOT EXISTS insights_search_vector_idx ON insights USING gin(search_vector)`

    // Trigram indexes for similarity search
    await sql`CREATE INDEX IF NOT EXISTS insights_title_trgm_idx ON insights USING gin(title gin_trgm_ops)`

    return NextResponse.json({
      ok: true,
      message: 'Database setup complete. All tables and indexes created.',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
