import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manasistemas.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maná Sistemas — Gestão Financeira para Igrejas",
    template: "%s | Maná Sistemas",
  },
  description:
    "Sistema completo de gestão financeira e administrativa para igrejas. Controle dízimos, ofertas, despesas, membros e eventos com check-in por QR Code. Comece grátis por 7 dias.",
  keywords: [
    "gestão financeira para igrejas",
    "sistema para igrejas",
    "prestação de contas igreja",
    "controle de dízimos",
    "controle de ofertas",
    "software igreja",
    "sistema administrativo igreja",
    "check-in igreja",
    "QR code igreja",
    "gestão de membros igreja",
    "relatório financeiro igreja",
    "Maná Sistemas",
  ],
  authors: [{ name: "MRS Tecnologia", url: "https://manasistemas.com.br" }],
  creator: "MRS Tecnologia",
  publisher: "MRS Tecnologia",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Maná Sistemas",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Maná Sistemas",
    title: "Maná Sistemas — Gestão Financeira para Igrejas",
    description:
      "Controle dízimos, ofertas, despesas, membros e eventos com check-in por QR Code. Sistema completo para igrejas. Teste grátis por 7 dias.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Maná Sistemas — Gestão Financeira para Igrejas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maná Sistemas — Gestão Financeira para Igrejas",
    description:
      "Controle dízimos, ofertas, despesas, membros e eventos com check-in por QR Code. Teste grátis por 7 dias.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Adicione o código do Google Search Console em:
    // https://search.google.com/search-console → Verificação por tag HTML
    // google: "seu-codigo-de-verificacao",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(location.pathname.indexOf('/dashboard')!==0)return;" +
              "var t=localStorage.getItem('prestacontas.theme')||'system';" +
              "var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);" +
              "document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
