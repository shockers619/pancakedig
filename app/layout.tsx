import './globals.css'

export const metadata = {
  title: 'Pancake Dig — National Grassroots Volleyball Directory',
  description: 'Find real club volleyball programs, tryouts, training, and officiating across the JVA, USAV, and AAU ecosystem — one directory, every route into the sport.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#10263B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
