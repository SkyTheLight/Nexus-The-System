import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/QueryProvider'
import { SearchWrapper } from '@/components/SearchWrapper'
import JarvisChat from '@/components/JarvisChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Adversity | Personal Command Center',
  description: 'A minimalist personal productivity system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SearchWrapper>
            {children}
            <JarvisChat />
          </SearchWrapper>
        </QueryProvider>
      </body>
    </html>
  )
}
