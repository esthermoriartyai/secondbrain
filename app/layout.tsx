import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

export const metadata: Metadata = {
  title: 'Secondbrain',
  description: 'You save. It thinks. You find.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Secondbrain',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Secondbrain',
    title: 'Secondbrain',
    description: 'You save. It thinks. You find.',
  },
  twitter: {
    card: 'summary',
    title: 'Secondbrain',
    description: 'You save. It thinks. You find.',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF0066',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Geist:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body className="antialiased bg-white text-[#111111]">
          {children}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  )
}
