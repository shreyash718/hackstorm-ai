import './globals.css'

export const metadata = {
  title: 'Interview Blitz | Wizarding Trials',
  description: 'A magical AI-powered technical interview simulator',
}

import { ThemeProvider } from '@/components/ThemeProvider'
import { ChunkReloadGuard } from '@/components/ChunkReloadGuard'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ChunkReloadGuard />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
