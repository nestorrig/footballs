import type { Metadata, Viewport } from "next";
import { Notable, Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const notable = Notable({ weight: "400", variable: "--font-notable" });

// Configuración de Viewport para respuesta táctil y escalado en móviles
export const viewport: Viewport = {
  themeColor: "#004bff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "3D Football Physics Experience",
    template: "%s | 3D Football Experience", // Para que páginas secundarias hereden el formato (ej. Demo 1 | 3D Football Experience)
  },
  description:
    "Experiencia interactiva 3D con animaciones y físicas de gravedad planetaria, shaders procedurales de balones de fútbol e iluminación PBR utilizando React Three Fiber y Rapier.",
  keywords: [
    "Three.js",
    "React Three Fiber",
    "Rapier Physics",
    "Next.js",
    "WebGL",
    "3D Interactive",
    "Custom Shader Material",
    "Shaders",
  ],
  authors: [{ name: "Nestor Rios Garcia" }],
  creator: "Nestor Rios Garcia",

  // Iconos y Favicons
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },

  // Open Graph (Vista previa para redes sociales como Twitter, WhatsApp, LinkedIn, etc.)
  // openGraph: {
  //   type: "website",
  //   locale: "es_ES",
  //   url: "https://midominio.com", // Cambia esto por tu dominio real
  //   title: "3D Football Physics Experience",
  //   description:
  //     "Simulación tridimensional interactiva con físicas en tiempo real y shaders avanzados en WebGL.",
  //   siteName: "Football 3D Experience",
  //   images: [
  //     {
  //       url: "/og-image.jpg", // Agrega una captura de pantalla de tu app en la carpeta public/
  //       width: 1200,
  //       height: 630,
  //       alt: "Simulación 3D de balones de fútbol interactivos",
  //     },
  //   ],
  // },

  // // Configuración para Twitter / X
  // twitter: {
  //   card: "summary_large_image",
  //   title: "3D Football Physics Experience",
  //   description:
  //     "Simulación tridimensional interactiva con físicas en tiempo real y shaders avanzados.",
  //   images: ["/og-image.jpg"],
  // },

  // // Indexación para buscadores
  // robots: {
  //   index: true,
  //   follow: true,
  // },
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
      <head>
        <title>Footballs</title>
      </head>
      <body className="min-h-full flex flex-col">
        <header className="font-urban w-full text-sm md:text-base fixed z-50 top-4 px-4 md:top-12 md:px-12 flex flex-col md:flex-row-reverse md:justify-between  gap-4 md:gap-8 pointer-events-none">
          <div className="text-[10px] md:text-sm">
            <ul className="flex gap-4 md:gap-8">
              <p>Made for @nestorrig</p>
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
              Footballs in Motion
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
