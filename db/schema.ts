import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  customType,
} from 'drizzle-orm/pg-core'

// Custom tsvector type for full-text search
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const screenshots = pgTable('screenshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  extractedText: text('extracted_text'),
  isProcessed: boolean('is_processed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary'),
  category: text('category'),
  heroImageUrl: text('hero_image_url'),
  screenshotCount: integer('screenshot_count').default(0),
  itemCount: integer('item_count').default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  searchVector: tsvector('search_vector'),
})

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  insightId: uuid('insight_id').references(() => insights.id, {
    onDelete: 'cascade',
  }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const screenshotInsights = pgTable('screenshot_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  screenshotId: uuid('screenshot_id').references(() => screenshots.id, {
    onDelete: 'cascade',
  }),
  insightId: uuid('insight_id').references(() => insights.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type Screenshot = typeof screenshots.$inferSelect
export type Insight = typeof insights.$inferSelect
export type Item = typeof items.$inferSelect
export type ScreenshotInsight = typeof screenshotInsights.$inferSelect
