'use client'

import { useState, useRef, useCallback } from 'react'
import { Nav } from '@/components/nav'
import Link from 'next/link'

type Stage = 'upload' | 'processing' | 'done'

interface ProcessingStep {
  label: string
  done: boolean
}

interface InsightResult {
  id: string
  title: string
  category: string
  item_count: number
  is_new: boolean
}

export default function SavePage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [isDragging, setIsDragging] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_screenshotId, setScreenshotId] = useState<string | null>(null)
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Screenshot uploaded', done: false },
    { label: 'Text and image extracted', done: false },
    { label: 'Identifying insights', done: false },
    { label: 'Organising into library', done: false },
  ])
  const [insights, setInsights] = useState<InsightResult[]>([])
  const [insightCount, setInsightCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|heic|webp)/i)) {
      alert('Please upload a PNG, JPG, HEIC, or WebP image.')
      return
    }

    setStage('processing')

    // Mark step 1 done
    setSteps((s) => s.map((st, i) => (i === 0 ? { ...st, done: true } : st)))

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/screenshots', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      alert('Upload failed: ' + (data.error || 'Unknown error'))
      setStage('upload')
      return
    }

    setScreenshotId(data.id)

    // Simulate step progression while polling
    setTimeout(() => setSteps((s) => s.map((st, i) => (i <= 1 ? { ...st, done: true } : st))), 2000)
    setTimeout(() => setSteps((s) => s.map((st, i) => (i <= 2 ? { ...st, done: true } : st))), 6000)

    // Poll for completion
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/screenshots/${data.id}`)
        const s = await r.json()

        if (s.is_processed) {
          clearInterval(pollRef.current!)
          setSteps((prev) => prev.map((st) => ({ ...st, done: true })))

          const insightList: InsightResult[] = Array.isArray(s.insights)
            ? s.insights.map((ins: InsightResult) => ({
                ...ins,
                is_new: true,
              }))
            : []

          setInsights(insightList)
          setInsightCount(insightList.length)
          setStage('done')
        }
      } catch {
        // ignore poll errors
      }
    }, 2000)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (stage === 'processing') {
    return (
      <>
        <Nav />
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="w-full max-w-md text-center">
            {/* Spinner */}
            <div className="mb-8 flex justify-center">
              <div
                className="w-12 h-12 rounded-full border-4 border-[#EEEEEE] border-t-[#FF0066] animate-spin"
              />
            </div>

            <h1
              className="font-dm-sans font-bold text-[28px] tracking-tight mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Reading your screenshot
            </h1>
            <p className="text-[#999999] text-[14px] mb-10" style={{ fontFamily: 'Geist, sans-serif' }}>
              Takes about 10 seconds
            </p>

            {/* Steps */}
            <div className="text-left space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors duration-500 ${
                      step.done
                        ? 'bg-[#FF0066] text-white'
                        : 'border-2 border-[#EEEEEE] text-[#CCCCCC]'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[14px] transition-colors duration-500 ${
                      step.done ? 'text-[#111111]' : 'text-[#CCCCCC]'
                    }`}
                    style={{ fontFamily: 'Geist, sans-serif' }}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  if (stage === 'done') {
    return (
      <>
        <Nav />
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="w-full max-w-md">
            {/* Done badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#FF0066]" />
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF0066]"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                Done
              </span>
            </div>

            <h1
              className="font-dm-sans font-bold text-[32px] tracking-tight mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Screenshot saved
            </h1>
            <p className="text-[#999999] text-[15px] mb-8" style={{ fontFamily: 'Geist, sans-serif' }}>
              The AI found{' '}
              <span className="font-semibold text-[#111111]">{insightCount} insight{insightCount !== 1 ? 's' : ''}</span>{' '}
              and added them to your library.
            </p>

            {/* Insight chips */}
            {insights.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-10">
                {insights.map((ins) => (
                  <Link
                    key={ins.id}
                    href={`/insight/${ins.id}`}
                    className="flex items-center gap-2 border border-[#EEEEEE] rounded-full px-4 py-2 hover:border-[#111111] transition-colors"
                  >
                    <span
                      className="text-[10px] uppercase tracking-[0.08em] text-[#FF0066] font-semibold"
                      style={{ fontFamily: 'Geist, sans-serif' }}
                    >
                      {ins.category}
                    </span>
                    <span
                      className="text-[13px] font-semibold text-[#111111]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {ins.title}
                    </span>
                    <span className="text-[11px] text-[#CCCCCC]" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {ins.item_count} items
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.06em] font-semibold rounded-full px-2 py-0.5 bg-[#FF0066] text-white"
                      style={{ fontFamily: 'Geist, sans-serif' }}
                    >
                      New
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStage('upload')
                  setInsights([])
                  setInsightCount(0)
                  setScreenshotId(null)
                  setSteps((s) => s.map((st) => ({ ...st, done: false })))
                }}
                className="border border-[#EEEEEE] text-[#111111] font-dm-sans font-semibold text-[14px] px-6 py-3 rounded-full hover:border-[#111111] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Save another
              </button>
              <Link
                href="/"
                className="bg-[#FF0066] text-white font-dm-sans font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-[#e6005c] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Go to library
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          <h1
            className="font-dm-sans font-bold text-[36px] tracking-tight mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Save a screenshot
          </h1>
          <p className="text-[#999999] text-[15px] mb-10 leading-relaxed" style={{ fontFamily: 'Geist, sans-serif' }}>
            Drop any screenshot — Instagram, Twitter, articles, anywhere. The AI reads it and organises it into your library automatically.
          </p>

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging ? 'border-[#FF0066] bg-[#fff0f5]' : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
            }`}
          >
            {/* Upload icon */}
            <div className="w-12 h-12 mb-4 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 26V14M20 14L14 20M20 14L26 20"
                  stroke="#CCCCCC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 30C5.8 30 4 28.2 4 26C4 24.1 5.4 22.5 7.2 22.1C7.1 21.7 7 21.4 7 21C7 18.2 9.2 16 12 16C12.1 16 12.2 16 12.3 16C13.4 13.6 15.9 12 18.8 12C23.2 12 26.7 15.5 26.7 20C26.7 20.1 26.7 20.2 26.7 20.3C29.1 21 31 23.2 31 26C31 28.2 29.2 30 27 30H8Z"
                  stroke="#CCCCCC"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p
              className="font-dm-sans font-semibold text-[16px] text-[#111111] mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Upload screenshot
            </p>
            <p className="text-[#CCCCCC] text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
              PNG, JPG, HEIC · or drag and drop
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/heic,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#EEEEEE]" />
            <span className="text-[#CCCCCC] text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
              or
            </span>
            <div className="flex-1 h-px bg-[#EEEEEE]" />
          </div>

          {/* Camera roll */}
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*'
                fileInputRef.current.click()
              }
            }}
            className="w-full border border-[#EEEEEE] text-[#111111] font-dm-sans font-semibold text-[15px] py-3 rounded-full hover:border-[#111111] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Choose from camera roll
          </button>
        </div>
      </main>
    </>
  )
}
