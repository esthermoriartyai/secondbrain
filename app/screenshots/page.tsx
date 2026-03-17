'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/nav'

interface InsightChip {
  id: string
  title: string
  category: string
  item_count: number
}

interface Screenshot {
  id: string
  image_url: string
  thumbnail_url?: string | null
  is_processed: boolean
  created_at: string
  insights: InsightChip[]
}

type Filter = 'all' | 'processed' | 'unprocessed'

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  const fetchScreenshots = async () => {
    const r = await fetch('/api/screenshots')
    const data = await r.json()
    setScreenshots(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchScreenshots()
  }, [])

  const retryProcessing = async (id: string) => {
    await fetch(`/api/screenshots/${id}`, { method: 'POST' })
    // Optimistically show as pending
    setScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s } : s))
    )
    // Poll once after 15s
    setTimeout(fetchScreenshots, 15000)
  }

  const filtered = screenshots.filter((s) => {
    if (filter === 'processed') return s.is_processed
    if (filter === 'unprocessed') return !s.is_processed
    return true
  })

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'processed', label: 'Processed' },
    { key: 'unprocessed', label: 'Unprocessed' },
  ]

  return (
    <>
      <Nav />
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <h1
            className="font-dm-sans font-bold text-[36px]"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}
          >
            Screenshots
          </h1>
          <Link
            href="/save"
            className="bg-[#FF0066] text-white font-dm-sans font-semibold text-[14px] px-5 py-2 rounded-full hover:bg-[#e6005c] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            + Save
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 mb-8">
          {FILTERS.map((f, idx) => (
            <div key={f.key} className="flex items-center">
              {idx > 0 && <div className="w-px h-4 bg-[#EEEEEE] mx-3" />}
              <button
                onClick={() => setFilter(f.key)}
                className={`text-[13px] transition-colors ${
                  filter === f.key ? 'font-bold text-[#111111]' : 'text-[#999999] hover:text-[#111111]'
                }`}
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                {f.label}
              </button>
            </div>
          ))}
        </div>

        <div className="h-px bg-[#EEEEEE] mb-8" />

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-4 border-[#EEEEEE] border-t-[#FF0066] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p
              className="font-dm-sans font-bold text-[22px] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              No screenshots yet
            </p>
            <p className="text-[#999999] text-[14px] mb-6" style={{ fontFamily: 'Geist, sans-serif' }}>
              Save your first screenshot to get started
            </p>
            <Link
              href="/save"
              className="bg-[#FF0066] text-white font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-[#e6005c] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              + Save a screenshot
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-5 py-4 border-b border-[#EEEEEE]"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <img
                    src={s.thumbnail_url || s.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[12px] text-[#999999]" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {!s.is_processed && (
                      <span className="text-[10px] uppercase tracking-[0.06em] bg-red-500 text-white font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: 'Geist, sans-serif' }}>
                        Unprocessed
                      </span>
                    )}
                  </div>

                  {/* Insight chips */}
                  {s.insights && s.insights.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {s.insights.map((ins) => (
                        <Link
                          key={ins.id}
                          href={`/insight/${ins.id}`}
                          className="flex items-center gap-2 border border-[#EEEEEE] rounded-full px-3 py-1.5 hover:border-[#111111] transition-colors"
                        >
                          {ins.category && (
                            <span
                              className="text-[10px] uppercase tracking-[0.06em] text-[#FF0066] font-semibold"
                              style={{ fontFamily: 'Geist, sans-serif' }}
                            >
                              {ins.category}
                            </span>
                          )}
                          <span
                            className="text-[12px] font-semibold text-[#111111]"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {ins.title}
                          </span>
                          <span className="text-[11px] text-[#CCCCCC]" style={{ fontFamily: 'Geist, sans-serif' }}>
                            {ins.item_count} items
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#CCCCCC]" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {s.is_processed ? 'No insights extracted' : 'Processing...'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    href={s.image_url}
                    target="_blank"
                    className="text-[12px] text-[#999999] hover:text-[#111111] transition-colors"
                    style={{ fontFamily: 'Geist, sans-serif' }}
                  >
                    View
                  </Link>
                  {!s.is_processed && (
                    <button
                      onClick={() => retryProcessing(s.id)}
                      className="text-[12px] text-[#FF0066] hover:underline font-semibold"
                      style={{ fontFamily: 'Geist, sans-serif' }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
