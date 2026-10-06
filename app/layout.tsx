import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

/**
 * Brand typography
 * - Display (headlines, key stats, empty states, logo wordmark): Poppins 700–800
 *   Matches the wordmark in the supplied logo SVGs (font-family: Poppins).
 * - Body / UI: Inter, highly legible at small sizes, regular + medium.
 * No fallback to system bold for display — Poppins is the headline face.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Craneta — Your Portable AI Context',
  description: 'Own your context. Carry it anywhere. Craneta is your personal AI passport — a portable profile of preferences and context you control.',
  keywords: ['AI context', 'personal AI', 'AI preferences', 'portable profile', 'AI passport'],
  openGraph: {
    title: 'Craneta',
    description: 'Your portable AI context — owned by you, not the chat box.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/craneta-icon-green.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/craneta-icon-green.svg'],
    apple: ['/craneta-icon-green.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
