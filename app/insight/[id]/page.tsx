'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/nav'

interface Item {
  id: string
  title: string
  detail?: string | null
  created_at: string
}

interface Source {
  id: string
  image_url: string
  thumbnail_url?: string | null
  created_at: string
}

interface InsightDetail {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  hero_image_url?: string | null
  screenshot_count: number
  item_count: number
  last_updated: string
  items: Item[]
  sources: Source[]
}

export default function InsightDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [insight, setInsight] = useState<InsightDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState({ title: '', detail: '' })
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', detail: '' })
  const [showMerge, setShowMerge] = useState(false)
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [heroPickerOpen, setHeroPickerOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/insights/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInsight(data)
        setTitleDraft(data.title)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const saveTitle = async () => {
    if (!insight || !titleDraft.trim()) return
    const r = await fetch(`/api/insights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleDraft }),
    })
    const data = await r.json()
    setInsight((prev) => prev ? { ...prev, title: data.title } : prev)
    setEditingTitle(false)
  }

  const saveItem = async (itemId: string) => {
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemDraft),
    })
    setInsight((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, ...itemDraft } : it
        ),
      }
    })
    setEditingItem(null)
  }

  const deleteItem = async (itemId: string) => {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    setInsight((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.filter((it) => it.id !== itemId),
        item_count: prev.item_count - 1,
      }
    })
  }

  const addItem = async () => {
    if (!newItem.title.trim()) return
    const r = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insightId: id, ...newItem }),
    })
    const item = await r.json()
    setInsight((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: [...prev.items, item],
        item_count: prev.item_count + 1,
      }
    })
    setNewItem({ title: '', detail: '' })
    setAddingItem(false)
  }

  const deleteInsight = async () => {
    if (!confirm('Delete this insight and all its items?')) return
    await fetch(`/api/insights/${id}`, { method: 'DELETE' })
    router.push('/')
  }

  const mergeInsight = async () => {
    if (!mergeTargetId.trim()) return
    await fetch('/api/insights/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: id, targetId: mergeTargetId }),
    })
    router.push(`/insight/${mergeTargetId}`)
  }

  const setHeroImage = async (imageUrl: string) => {
    await fetch(`/api/insights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImageUrl: imageUrl }),
    })
    setInsight((prev) => prev ? { ...prev, hero_image_url: imageUrl } : prev)
    setHeroPickerOpen(false)
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-4 border-[#EEEEEE] border-t-[#FF0066] animate-spin" />
        </div>
      </>
    )
  }

  if (!insight) {
    return (
      <>
        <Nav />
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <h1 className="font-dm-sans font-bold text-[28px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Insight not found
          </h1>
          <Link href="/" className="text-[#FF0066] text-[14px] mt-4 inline-block">
            ← Back to library
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[13px] text-[#999999] hover:text-[#111111] transition-colors"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Library
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMerge(!showMerge)}
              className="text-[13px] text-[#999999] hover:text-[#111111] transition-colors border border-[#EEEEEE] px-4 py-2 rounded-full"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Merge
            </button>
            <button
              onClick={() => { setEditingTitle(true); setTitleDraft(insight.title) }}
              className="text-[13px] text-[#999999] hover:text-[#111111] transition-colors border border-[#EEEEEE] px-4 py-2 rounded-full"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Edit title
            </button>
            <button
              onClick={() => setAddingItem(true)}
              className="bg-[#FF0066] text-white font-semibold text-[13px] px-5 py-2 rounded-full hover:bg-[#e6005c] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              + Add item
            </button>
          </div>
        </div>

        {/* Merge form */}
        {showMerge && (
          <div className="mb-6 p-4 border border-[#EEEEEE] rounded-xl flex items-center gap-3">
            <span className="text-[13px] text-[#999999]" style={{ fontFamily: 'Geist, sans-serif' }}>
              Merge into insight ID:
            </span>
            <input
              type="text"
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              placeholder="Target insight ID"
              className="flex-1 text-[13px] border border-[#EEEEEE] rounded-lg px-3 py-2 outline-none"
              style={{ fontFamily: 'Geist, sans-serif' }}
            />
            <button
              onClick={mergeInsight}
              className="bg-[#111111] text-white text-[13px] px-4 py-2 rounded-full"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Merge
            </button>
            <button
              onClick={() => setShowMerge(false)}
              className="text-[#999999] text-[13px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Hero image */}
        <div
          className="w-full mb-8 overflow-hidden bg-[#F5F5F5] cursor-pointer"
          style={{ aspectRatio: '16/6' }}
          onClick={() => setHeroPickerOpen(!heroPickerOpen)}
        >
          {insight.hero_image_url ? (
            <img
              src={insight.hero_image_url}
              alt={insight.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#CCCCCC] text-[13px]">
              Click to set hero image
            </div>
          )}
        </div>

        {/* Hero picker */}
        {heroPickerOpen && insight.sources.length > 0 && (
          <div className="mb-8 p-4 border border-[#EEEEEE] rounded-xl">
            <p className="text-[12px] text-[#999999] mb-3" style={{ fontFamily: 'Geist, sans-serif' }}>
              Choose a source screenshot as hero:
            </p>
            <div className="flex flex-wrap gap-3">
              {insight.sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setHeroImage(s.image_url)}
                  className="w-24 h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#FF0066] transition-colors"
                >
                  <img src={s.thumbnail_url || s.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category + Title */}
        {insight.category && (
          <p
            className="text-[11px] uppercase tracking-[0.1em] text-[#FF0066] font-semibold mb-3"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            {insight.category}
          </p>
        )}

        {editingTitle ? (
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTitle() }}
              className="flex-1 font-dm-sans font-bold text-[40px] tracking-tight border-b-2 border-[#FF0066] outline-none bg-transparent"
              style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}
              autoFocus
            />
            <button onClick={saveTitle} className="bg-[#FF0066] text-white text-[13px] px-4 py-2 rounded-full">Save</button>
            <button onClick={() => setEditingTitle(false)} className="text-[#999999] text-[13px]">Cancel</button>
          </div>
        ) : (
          <h1
            className="font-dm-sans font-bold text-[40px] mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}
          >
            {insight.title}
          </h1>
        )}

        {/* Meta strip */}
        <div className="flex items-center gap-0 mb-10 border-t border-b border-[#EEEEEE] py-4">
          <span className="text-[13px] text-[#999999] pr-6" style={{ fontFamily: 'Geist, sans-serif' }}>
            {insight.screenshot_count} screenshot{insight.screenshot_count !== 1 ? 's' : ''}
          </span>
          <div className="w-px h-4 bg-[#EEEEEE] mr-6" />
          <span className="text-[13px] text-[#999999] pr-6" style={{ fontFamily: 'Geist, sans-serif' }}>
            {insight.item_count} item{insight.item_count !== 1 ? 's' : ''}
          </span>
          <div className="w-px h-4 bg-[#EEEEEE] mr-6" />
          <span className="text-[13px] text-[#999999]" style={{ fontFamily: 'Geist, sans-serif' }}>
            Updated {new Date(insight.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left: summary + items */}
          <div className="md:col-span-2">
            {insight.summary && (
              <p
                className="italic text-[#999999] text-[15px] leading-relaxed mb-8"
                style={{ fontFamily: 'Geist, sans-serif', fontWeight: 300 }}
              >
                {insight.summary}
              </p>
            )}

            {/* Items */}
            <div className="space-y-6">
              {insight.items.map((item, idx) => (
                <div key={item.id} className="flex gap-4">
                  <span
                    className="text-[#FF0066] font-bold text-[16px] flex-shrink-0 w-6 text-right"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={itemDraft.title}
                          onChange={(e) => setItemDraft((d) => ({ ...d, title: e.target.value }))}
                          className="w-full border border-[#EEEEEE] rounded-lg px-3 py-2 text-[14px] outline-none"
                          style={{ fontFamily: 'Geist, sans-serif' }}
                        />
                        <textarea
                          value={itemDraft.detail}
                          onChange={(e) => setItemDraft((d) => ({ ...d, detail: e.target.value }))}
                          rows={2}
                          className="w-full border border-[#EEEEEE] rounded-lg px-3 py-2 text-[13px] outline-none resize-none"
                          style={{ fontFamily: 'Geist, sans-serif' }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveItem(item.id)} className="bg-[#FF0066] text-white text-[12px] px-3 py-1.5 rounded-full">Save</button>
                          <button onClick={() => setEditingItem(null)} className="text-[#999999] text-[12px]">Cancel</button>
                          <button onClick={() => deleteItem(item.id)} className="text-red-400 text-[12px] ml-auto">Delete</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className="font-semibold text-[15px] leading-snug mb-1"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {item.title}
                        </p>
                        {item.detail && (
                          <p className="text-[13px] text-[#999999] leading-relaxed" style={{ fontFamily: 'Geist, sans-serif' }}>
                            {item.detail}
                          </p>
                        )}
                        <button
                          onClick={() => { setEditingItem(item.id); setItemDraft({ title: item.title, detail: item.detail || '' }) }}
                          className="text-[11px] text-[#CCCCCC] hover:text-[#999999] mt-1 transition-colors"
                          style={{ fontFamily: 'Geist, sans-serif' }}
                        >
                          edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add item form */}
            {addingItem ? (
              <div className="mt-8 space-y-3 p-4 border border-[#EEEEEE] rounded-xl">
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
                  placeholder="Item title"
                  className="w-full border border-[#EEEEEE] rounded-lg px-3 py-2 text-[14px] outline-none"
                  style={{ fontFamily: 'Geist, sans-serif' }}
                  autoFocus
                />
                <textarea
                  value={newItem.detail}
                  onChange={(e) => setNewItem((n) => ({ ...n, detail: e.target.value }))}
                  placeholder="Detail (optional)"
                  rows={2}
                  className="w-full border border-[#EEEEEE] rounded-lg px-3 py-2 text-[13px] outline-none resize-none"
                  style={{ fontFamily: 'Geist, sans-serif' }}
                />
                <div className="flex gap-2">
                  <button onClick={addItem} className="bg-[#FF0066] text-white text-[13px] px-4 py-2 rounded-full">Add item</button>
                  <button onClick={() => setAddingItem(false)} className="text-[#999999] text-[13px]">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingItem(true)}
                className="mt-8 text-[13px] text-[#999999] hover:text-[#111111] transition-colors border-b border-dashed border-[#CCCCCC]"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                + Add item manually
              </button>
            )}
          </div>

          {/* Right: sources + actions */}
          <div className="md:col-span-1">
            {/* Source screenshots */}
            <div className="mb-8">
              <h3
                className="font-semibold text-[13px] uppercase tracking-[0.08em] text-[#999999] mb-4"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                Source screenshots
              </h3>
              <div className="space-y-3">
                {insight.sources.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                      <img
                        src={s.thumbnail_url || s.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#999999] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <Link
                        href={s.image_url}
                        target="_blank"
                        className="text-[12px] text-[#FF0066] hover:underline"
                        style={{ fontFamily: 'Geist, sans-serif' }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
                {insight.sources.length === 0 && (
                  <p className="text-[12px] text-[#CCCCCC]" style={{ fontFamily: 'Geist, sans-serif' }}>
                    No screenshots yet
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-[#EEEEEE] pt-6 space-y-3">
              <button
                onClick={() => setShowMerge(true)}
                className="w-full text-left text-[13px] text-[#999999] hover:text-[#111111] transition-colors"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                Merge insight
              </button>
              <button
                onClick={deleteInsight}
                className="w-full text-left text-[13px] text-red-400 hover:text-red-600 transition-colors"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                Delete insight
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
