import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "Fantastic Hook",
  description: "LLM-driven short-video product hook script generator.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
