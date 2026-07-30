import type { Metadata, Viewport } from "next";
import { Notable, Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const notable = Notable({ weight: "400", variable: "--font-notable" });

export const viewport: Viewport = {
  themeColor: "#004bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://footballs.nestorrig.com"),
  title: {
    default: "Footballs in Motion",
    template: "%s | Footballs in Motion", // Para que páginas secundarias hereden el formato (ej. Demo 1 | 3D Football Experience)
  },
  description:
    "Interactive 3D experience with planetary gravity physics, procedural PBR shaders, and real-time lighting using React Three Fiber and Rapier.",
  keywords: [
    "Three.js",
    "React Three Fiber",
    "Rapier Physics",
    "Next.js",
    "WebGL",
    "3D Interactive",
    "Custom Shader Material",
    "Shaders",
    "GSAP",
  ],
  authors: [{ name: "Nestor Rios Garcia" }],
  creator: "Nestor Rios Garcia",

  // Iconos y Favicons
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },

  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://footballs.nestorrig.com/",
    title: "3D Football Physics Experience",
    description:
      "Interactive 3D experience with physics, procedural PBR shaders, and real-time lighting using Three.js and Rapier.",
    siteName: "Footballs in Motion",
    images: [
      {
        url: "/cover.jpg",
        width: 1200,
        height: 630,
        alt: "PBR 3D Scene with footballs in motion",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Footballs in Motion",
    description:
      "Interactive 3D experience with physics, procedural PBR shaders, and real-time lighting using Three.js and Rapier.",
    images: ["/cover.jpg"],
  },

  // Indexación para buscadores
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notable.variable} ${urbanist.variable}  h-full antialiased`}
    >
      <body className="min-h-full max-h-svh flex flex-col text-white">
        <header className="font-urban w-full text-sm md:text-base fixed z-50 top-4 px-4 md:top-12 md:px-12 flex flex-col lg:flex-row-reverse md:justify-between  gap-4 md:gap-8 pointer-events-none">
          <div className="text-[10px] md:text-sm">
            <ul className="flex gap-4 md:gap-8">
              <p>Made by @nestorrig</p>
              <li>
                <a
                  href="https://x.com/nestorrig"
                  target="_blank"
                  className="underline pointer-events-auto"
                >
                  Twitter/X
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/nestorrig/"
                  target="_blank"
                  className="underline pointer-events-auto"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/nestorrig/"
                  target="_blank"
                  className="underline pointer-events-auto"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/nestorrig"
                  target="_blank"
                  className="underline pointer-events-auto"
                >
                  Behance
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="font-urban tracking-widest text-[clamp(1.5rem,6vw,2rem)] leading-tight mb-2">
              <a className="pointer-events-auto" href="/">
                Footballs in Motion
              </a>
            </h1>
            <nav className="flex  gap-4 md:gap-8">
              <a className="underline pointer-events-auto" href="/1">
                Demo 1
              </a>
              <a className="underline pointer-events-auto" href="/2">
                Demo 2
              </a>
              <a className="underline pointer-events-auto" href="/3">
                Demo 3
              </a>
              <a className="underline pointer-events-auto" href="/4">
                Demo 4
              </a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
