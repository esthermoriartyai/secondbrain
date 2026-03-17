'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#111111]">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-dm-sans font-bold text-[18px] tracking-tight text-[#111111]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Secondbrain
        </Link>

        {/* Centre nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`font-dm-sans text-[14px] transition-colors ${
              pathname === '/' ? 'text-[#111111] font-semibold' : 'text-[#999999] hover:text-[#111111]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Library
          </Link>
          <Link
            href="/screenshots"
            className={`font-dm-sans text-[14px] transition-colors ${
              pathname === '/screenshots' ? 'text-[#111111] font-semibold' : 'text-[#999999] hover:text-[#111111]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Screenshots
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/save"
            className="bg-[#FF0066] text-white font-dm-sans font-semibold text-[14px] px-5 py-2 rounded-full hover:bg-[#e6005c] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            + Save
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
