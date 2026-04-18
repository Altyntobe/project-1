import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Analytical Dashboard",
  description: "Sales analytics platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-[calc(100vh-64px)] bg-background">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
