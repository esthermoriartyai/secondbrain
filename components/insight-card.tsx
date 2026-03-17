import Link from 'next/link'

interface InsightCardProps {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  heroImageUrl?: string | null
  screenshotCount?: number | null
  itemCount?: number | null
  className?: string
  imageHeight?: string
}

export function InsightCard({
  id,
  title,
  summary,
  category,
  heroImageUrl,
  screenshotCount,
  itemCount,
  className = '',
  imageHeight = 'h-52',
}: InsightCardProps) {
  return (
    <Link href={`/insight/${id}`} className={`insight-card block group ${className}`}>
      {/* Image */}
      <div className={`${imageHeight} rounded-[9px] overflow-hidden bg-[#F5F5F5] mb-3`}>
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={title}
            className="insight-card-image w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#EEEEEE] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="#CCCCCC" strokeWidth="1.5" />
                <circle cx="7" cy="7" r="1.5" fill="#CCCCCC" />
                <path d="M2 13L6 9L9 12L13 8L18 13" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div>
        {category && (
          <p
            className="text-[10px] uppercase tracking-[0.08em] text-[#FF0066] font-semibold mb-1"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            {category}
          </p>
        )}
        <h3
          className="insight-card-title font-dm-sans font-bold text-[18px] leading-snug tracking-tight mb-1 transition-colors duration-200"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>
        {summary && (
          <p
            className="text-[12px] text-[#999999] leading-relaxed mb-2 line-clamp-2"
            style={{ fontFamily: 'Geist, sans-serif', fontWeight: 300 }}
          >
            {summary}
          </p>
        )}
        <div className="flex items-center gap-3">
          {screenshotCount != null && screenshotCount > 0 && (
            <span
              className="text-[11px] text-[#FF0066] font-semibold"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {screenshotCount} screenshot{screenshotCount !== 1 ? 's' : ''}
            </span>
          )}
          {itemCount != null && itemCount > 0 && (
            <span
              className="text-[11px] text-[#CCCCCC]"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
