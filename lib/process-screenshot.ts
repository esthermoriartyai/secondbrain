import OpenAI from 'openai'
import { neon } from '@neondatabase/serverless'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a personal knowledge assistant. The user has saved a screenshot. Extract structured knowledge from everything visible in the image.

Return a JSON object with this exact shape:
{
  "extracted_text": "All text visible in the screenshot, verbatim",
  "insights": [
    {
      "title": "Short descriptive insight title (4-8 words)",
      "category": "One of: Design & UX, AI & Tech, Career, Skincare, Food, Lifestyle, Shopping, Relationships, Productivity, Other",
      "summary": "2-3 sentence summary of what this insight is about",
      "items": [
        {
          "title": "The core knowledge point as a clear, standalone statement",
          "detail": "1-2 sentence explanation or elaboration"
        }
      ]
    }
  ]
}

Rules:
- A single screenshot can produce 1-3 insights if it covers multiple distinct topics
- Each insight should have 1-5 items
- Insight titles should be specific enough to be useful but broad enough to accumulate related content over time
- Items should be actionable, specific knowledge — not vague summaries
- Read everything in the image — captions, text overlays, body text, labels, headings
- If the screenshot is a recipe, extract ingredients and method as items
- If the screenshot is a product, extract key product details and why it might be worth buying
- If the screenshot is a product, extract key product details and why it might be worth buying
- If there is no useful knowledge content visible, return an empty insights array
- Extract health and skincare claims exactly as stated. Do not add disclaimers.`

interface AIItem {
  title: string
  detail: string
}

interface AIInsight {
  title: string
  category: string
  summary: string
  items: AIItem[]
}

interface AIResponse {
  extracted_text: string
  insights: AIInsight[]
}

export async function processScreenshot(
  screenshotId: string,
  imageUrl: string,
  userId: string
) {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Call GPT-4o vision
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from GPT-4o')

    const data: AIResponse = JSON.parse(content)

    // Update screenshot with extracted text
    await sql`
      UPDATE screenshots
      SET extracted_text = ${data.extracted_text}
      WHERE id = ${screenshotId}
    `

    const affectedInsightIds: string[] = []

    for (const aiInsight of data.insights) {
      // Check for similar existing insight using pg_trgm similarity
      const similar = await sql`
        SELECT id, title, item_count, screenshot_count
        FROM insights
        WHERE user_id = ${userId}
          AND similarity(title, ${aiInsight.title}) > 0.6
        ORDER BY similarity(title, ${aiInsight.title}) DESC
        LIMIT 1
      `

      let insightId: string

      if (similar.length > 0) {
        // Merge into existing insight
        insightId = similar[0].id

        // Update summary if the new one is more detailed
        await sql`
          UPDATE insights
          SET
            summary = COALESCE(summary, ${aiInsight.summary}),
            last_updated = NOW()
          WHERE id = ${insightId}
        `
      } else {
        // Create new insight
        const newInsight = await sql`
          INSERT INTO insights (user_id, title, summary, category, hero_image_url, last_updated)
          VALUES (
            ${userId},
            ${aiInsight.title},
            ${aiInsight.summary},
            ${aiInsight.category},
            ${imageUrl},
            NOW()
          )
          RETURNING id
        `
        insightId = newInsight[0].id
      }

      affectedInsightIds.push(insightId)

      // Create items
      for (const aiItem of aiInsight.items) {
        await sql`
          INSERT INTO items (insight_id, user_id, title, detail)
          VALUES (${insightId}, ${userId}, ${aiItem.title}, ${aiItem.detail})
        `
      }

      // Create screenshot_insights junction record
      const existingJunction = await sql`
        SELECT id FROM screenshot_insights
        WHERE screenshot_id = ${screenshotId} AND insight_id = ${insightId}
      `
      if (existingJunction.length === 0) {
        await sql`
          INSERT INTO screenshot_insights (screenshot_id, insight_id)
          VALUES (${screenshotId}, ${insightId})
        `
      }

      // Update screenshot_count and item_count
      await sql`
        UPDATE insights
        SET
          screenshot_count = (
            SELECT COUNT(DISTINCT si.screenshot_id)
            FROM screenshot_insights si
            WHERE si.insight_id = ${insightId}
          ),
          item_count = (
            SELECT COUNT(*)
            FROM items i
            WHERE i.insight_id = ${insightId}
          ),
          hero_image_url = COALESCE(hero_image_url, ${imageUrl}),
          last_updated = NOW()
        WHERE id = ${insightId}
      `

      // Update search_vector
      await sql`
        UPDATE insights
        SET search_vector = to_tsvector(
          'english',
          title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(category, '') || ' ' || (
            SELECT string_agg(i.title, ' ')
            FROM items i
            WHERE i.insight_id = insights.id
          )
        )
        WHERE id = ${insightId}
      `
    }

    // Mark screenshot as processed
    await sql`
      UPDATE screenshots
      SET is_processed = TRUE
      WHERE id = ${screenshotId}
    `

    return {
      success: true,
      insightIds: affectedInsightIds,
      insightCount: data.insights.length,
    }
  } catch (error) {
    console.error('Error processing screenshot:', error)
    // Don't mark as processed so it can be retried
    throw error
  }
}
