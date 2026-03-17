'use client'

import { useState, useEffect, useCallback } from 'react'
import { Nav } from '@/components/nav'
import { CategoryGrid } from '@/components/category-grid'
import Link from 'next/link'

const CATEGORIES = [
  'All',
  'Design & UX',
  'AI & Tech',
  'Career',
  'Skincare',
  'Food',
  'Lifestyle',
  'Shopping',
  'Relationships',
  'Productivity',
  'Other',
]

interface Insight {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  hero_image_url?: string | null
  screenshot_count?: number | null
  item_count?: number | null
}

export default function LibraryPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Insight[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url =
      activeCategory !== 'All'
        ? `/api/insights?category=${encodeURIComponent(activeCategory)}`
        : '/api/insights'

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setInsights(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activeCategory])

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await r.json()
    setSearchResults(Array.isArray(data) ? data : [])
  }, [])

  // Group insights by category
  const grouped = (searchResults ?? insights).reduce<Record<string, Insight[]>>(
    (acc, ins) => {
      const cat = ins.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(ins)
      return acc
    },
    {}
  )

  // Sort categories by total screenshot_count desc
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aTotal = grouped[a].reduce((sum, i) => sum + (i.screenshot_count ?? 0), 0)
    const bTotal = grouped[b].reduce((sum, i) => sum + (i.screenshot_count ?? 0), 0)
    return bTotal - aTotal
  })

  const displayInsights = searchResults ?? insights
  const isEmpty = !loading && displayInsights.length === 0

  return (
    <>
      <Nav />
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="flex items-center gap-4 mb-8 border-b border-[#EEEEEE] pb-4">
          <span
            className="text-[11px] uppercase tracking-[0.1em] text-[#CCCCCC] font-semibold flex-shrink-0"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            SEARCH
          </span>
          <div className="w-px h-5 bg-[#EEEEEE]" />
          <input
            type="text"
            placeholder="Search your insights..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-[15px] text-[#111111] placeholder-[#CCCCCC] outline-none border-none bg-transparent"
            style={{ fontFamily: 'Geist, sans-serif' }}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="text-[#CCCCCC] hover:text-[#111111] text-[20px] leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center flex-wrap gap-0 mb-12">
          {CATEGORIES.map((cat, idx) => (
            <div key={cat} className="flex items-center">
              {idx > 0 && <div className="w-px h-4 bg-[#EEEEEE] mx-3" />}
              <button
                onClick={() => {
                  setActiveCategory(cat)
                  setSearchQuery('')
                  setSearchResults(null)
                }}
                className={`text-[13px] transition-colors ${
                  activeCategory === cat && !searchQuery
                    ? 'font-bold text-[#111111]'
                    : 'text-[#999999] hover:text-[#111111]'
                }`}
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                {cat}
              </button>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-4 border-[#EEEEEE] border-t-[#FF0066] animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#CCCCCC" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="#CCCCCC" />
                <path d="M3 15L8 10L11 13L15 9L21 15" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3
              className="font-dm-sans font-bold text-[22px] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {searchQuery ? 'No results found' : 'Your library is empty'}
            </h3>
            <p className="text-[#999999] text-[14px] mb-8" style={{ fontFamily: 'Geist, sans-serif' }}>
              {searchQuery
                ? `No insights match "${searchQuery}"`
                : 'Start by saving your first screenshot'}
            </p>
            {!searchQuery && (
              <Link
                href="/save"
                className="bg-[#FF0066] text-white font-dm-sans font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-[#e6005c] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                + Save a screenshot
              </Link>
            )}
          </div>
        ) : searchResults ? (
          <div>
            <p className="text-[12px] text-[#999999] mb-8" style={{ fontFamily: 'Geist, sans-serif' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {searchResults.map((ins) => (
                <Link
                  key={ins.id}
                  href={`/insight/${ins.id}`}
                  className="insight-card block group"
                >
                  <div className="h-48 rounded-[9px] overflow-hidden bg-[#F5F5F5] mb-3">
                    {ins.hero_image_url && (
                      <img
                        src={ins.hero_image_url}
                        alt={ins.title}
                        className="insight-card-image w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {ins.category && (
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#FF0066] font-semibold mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {ins.category}
                    </p>
                  )}
                  <h3 className="insight-card-title font-bold text-[16px] tracking-tight leading-snug" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>
                    {ins.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          sortedCategories.map((cat, idx) => (
            <CategoryGrid
              key={cat}
              category={cat}
              insights={grouped[cat]}
              layoutIndex={idx}
            />
          ))
        )}
      </main>
    </>
  )
}
