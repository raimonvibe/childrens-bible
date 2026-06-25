import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import ViewportInsetsProvider from '@/components/ViewportInsetsProvider'
import ReadAloudToolbar from '@/components/ReadAloudToolbar'

const themeInitScript = `(function(){try{var t=localStorage.getItem('bible-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`
// import PrayerChatWidget from '../components/PrayerChatWidget'

export const metadata: Metadata = {
  title: 'Bible Stories for Children - Old & New Testament',
  description: 'Read classic Old and New Testament Bible stories for children from Project Gutenberg. Child\'s Story of the Bible by Mary A. Lathbury and Mother Stories from the New Testament.',
  keywords: ['Bible', 'Old Testament', 'New Testament', 'Bible stories', 'Children', 'Project Gutenberg', 'Mary A. Lathbury', 'Christian'],
  authors: [{ name: 'Bible Stories Reader' }],
  creator: 'Bible Stories Reader',
  publisher: 'Bible Stories Reader',
  metadataBase: new URL('https://bible-new-testament.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bible Stories for Children - Old & New Testament',
    description: 'Read classic Old and New Testament Bible stories for children from Project Gutenberg in a beautiful, modern interface.',
    url: 'https://bible-new-testament.vercel.app',
    siteName: 'Bible Stories for Children',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bible Stories for Children - Read classic Bible stories online',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bible Stories for Children - Old & New Testament',
    description: 'Read classic Old and New Testament Bible stories for children from Project Gutenberg in a beautiful, modern interface.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bible Stories',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1e8' },
    { media: '(prefers-color-scheme: dark)', color: '#2c1f14' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <ViewportInsetsProvider />
        <main id="main-content">
          <ThemeProvider>{children}</ThemeProvider>
        </main>
        <ReadAloudToolbar />
        {/* <PrayerChatWidget /> */}
      </body>
    </html>
  )
}
