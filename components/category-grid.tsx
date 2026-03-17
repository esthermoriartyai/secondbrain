import Link from 'next/link'
import { InsightCard } from './insight-card'

interface Insight {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  hero_image_url?: string | null
  screenshot_count?: number | null
  item_count?: number | null
}

interface CategoryGridProps {
  category: string
  insights: Insight[]
  layoutIndex: number
}

export function CategoryGrid({ category, insights, layoutIndex }: CategoryGridProps) {
  if (insights.length === 0) return null

  // Alternate layouts
  const layout = layoutIndex % 3

  const renderCards = () => {
    if (insights.length === 1) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard
            key={insights[0].id}
            id={insights[0].id}
            title={insights[0].title}
            summary={insights[0].summary}
            category={insights[0].category}
            heroImageUrl={insights[0].hero_image_url}
            screenshotCount={insights[0].screenshot_count}
            itemCount={insights[0].item_count}
            imageHeight="h-64"
          />
        </div>
      )
    }

    if (layout === 0) {
      // Layout A: 1 tall portrait left (spans 2 rows) + 2 stacked right + 1 wide below
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Tall portrait left */}
          <div className="col-span-1 row-span-2 md:col-span-1">
            <InsightCard
              key={insights[0].id}
              id={insights[0].id}
              title={insights[0].title}
              summary={insights[0].summary}
              category={insights[0].category}
              heroImageUrl={insights[0].hero_image_url}
              screenshotCount={insights[0].screenshot_count}
              itemCount={insights[0].item_count}
              imageHeight="h-[420px]"
            />
          </div>
          {/* 2 stacked right */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            {insights.slice(1, 3).map((ins) => (
              <InsightCard
                key={ins.id}
                id={ins.id}
                title={ins.title}
                summary={ins.summary}
                category={ins.category}
                heroImageUrl={ins.hero_image_url}
                screenshotCount={ins.screenshot_count}
                itemCount={ins.item_count}
                imageHeight="h-44"
              />
            ))}
          </div>
          {/* Wide card spanning remaining */}
          {insights[3] && (
            <div className="col-span-2 md:col-span-2">
              <InsightCard
                key={insights[3].id}
                id={insights[3].id}
                title={insights[3].title}
                summary={insights[3].summary}
                category={insights[3].category}
                heroImageUrl={insights[3].hero_image_url}
                screenshotCount={insights[3].screenshot_count}
                itemCount={insights[3].item_count}
                imageHeight="h-52"
              />
            </div>
          )}
          {/* Extra cards */}
          {insights.slice(4).map((ins) => (
            <div key={ins.id} className="col-span-1">
              <InsightCard
                id={ins.id}
                title={ins.title}
                summary={ins.summary}
                category={ins.category}
                heroImageUrl={ins.hero_image_url}
                screenshotCount={ins.screenshot_count}
                itemCount={ins.item_count}
                imageHeight="h-48"
              />
            </div>
          ))}
        </div>
      )
    }

    if (layout === 1) {
      // Layout B: 2 stacked left + 1 tall portrait right + 1 wide below
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* 2 stacked left */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            {insights.slice(0, 2).map((ins) => (
              <InsightCard
                key={ins.id}
                id={ins.id}
                title={ins.title}
                summary={ins.summary}
                category={ins.category}
                heroImageUrl={ins.hero_image_url}
                screenshotCount={ins.screenshot_count}
                itemCount={ins.item_count}
                imageHeight="h-44"
              />
            ))}
          </div>
          {/* Tall portrait right */}
          <div className="col-span-1 md:col-span-1">
            {insights[2] && (
              <InsightCard
                key={insights[2].id}
                id={insights[2].id}
                title={insights[2].title}
                summary={insights[2].summary}
                category={insights[2].category}
                heroImageUrl={insights[2].hero_image_url}
                screenshotCount={insights[2].screenshot_count}
                itemCount={insights[2].item_count}
                imageHeight="h-[420px]"
              />
            )}
          </div>
          {/* Wide card below spanning left 2 cols */}
          {insights[3] && (
            <div className="col-span-2 md:col-span-2">
              <InsightCard
                key={insights[3].id}
                id={insights[3].id}
                title={insights[3].title}
                summary={insights[3].summary}
                category={insights[3].category}
                heroImageUrl={insights[3].hero_image_url}
                screenshotCount={insights[3].screenshot_count}
                itemCount={insights[3].item_count}
                imageHeight="h-52"
              />
            </div>
          )}
          {insights.slice(4).map((ins) => (
            <div key={ins.id} className="col-span-1">
              <InsightCard
                id={ins.id}
                title={ins.title}
                summary={ins.summary}
                category={ins.category}
                heroImageUrl={ins.hero_image_url}
                screenshotCount={ins.screenshot_count}
                itemCount={ins.item_count}
                imageHeight="h-48"
              />
            </div>
          ))}
        </div>
      )
    }

    // Layout C: 1 wide spanning 2 cols + up to 3 regular below
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Wide card top */}
        <div className="col-span-2 md:col-span-3">
          <InsightCard
            key={insights[0].id}
            id={insights[0].id}
            title={insights[0].title}
            summary={insights[0].summary}
            category={insights[0].category}
            heroImageUrl={insights[0].hero_image_url}
            screenshotCount={insights[0].screenshot_count}
            itemCount={insights[0].item_count}
            imageHeight="h-56"
          />
        </div>
        {insights.slice(1, 4).map((ins) => (
          <div key={ins.id} className="col-span-1">
            <InsightCard
              id={ins.id}
              title={ins.title}
              summary={ins.summary}
              category={ins.category}
              heroImageUrl={ins.hero_image_url}
              screenshotCount={ins.screenshot_count}
              itemCount={ins.item_count}
              imageHeight="h-48"
            />
          </div>
        ))}
        {insights.slice(4).map((ins) => (
          <div key={ins.id} className="col-span-1">
            <InsightCard
              id={ins.id}
              title={ins.title}
              summary={ins.summary}
              category={ins.category}
              heroImageUrl={ins.hero_image_url}
              screenshotCount={ins.screenshot_count}
              itemCount={ins.item_count}
              imageHeight="h-48"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="mb-16">
      {/* Category header */}
      <div className="flex items-baseline justify-between mb-3">
        <h2
          className="font-dm-sans font-bold text-[36px]"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          {category}
        </h2>
        <Link
          href={`/?category=${encodeURIComponent(category)}`}
          className="text-[13px] text-[#999999] hover:text-[#111111] transition-colors"
          style={{ fontFamily: 'Geist, sans-serif' }}
        >
          See all
        </Link>
      </div>
      <div className="h-px bg-[#EEEEEE] mb-8" />

      {renderCards()}
    </section>
  )
}
