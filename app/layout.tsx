import type React from "react"
import { Providers } from "./providers"
import "./globals.css"
import { Inter, Poppins, Roboto } from "next/font/google"

// Google Fonts configuration
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'HDIMS - Healthcare Data Management System',
  description: 'Comprehensive healthcare data management and reporting system',
  generator: 'v0.app',
  keywords: ['healthcare', 'data management', 'reporting', 'HDIMS'],
  authors: [{ name: 'HDIMS Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'HDIMS - Healthcare Data Management System',
    description: 'Comprehensive healthcare data management and reporting system',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
