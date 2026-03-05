import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from '@/contexts/session-context'
import { NotesProvider } from '@/contexts/notes-context'
import { ReactQueryProvider } from '@/components/query-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'My Patient',
  description: 'Plataforma de gestão de pacientes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <SessionProvider>
            <NotesProvider>{children}</NotesProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
