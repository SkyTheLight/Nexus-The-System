import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/QueryProvider'
import { SearchWrapper } from '@/components/SearchWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nexus: The System | Personal Command Center',
  description: 'Your personal command center',
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
          </SearchWrapper>
        </QueryProvider>
      </body>
    </html>
  )
}
