import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import { meta } from "@/content";
import "./globals.css";

// Anek Latin, by Ek Type (Mumbai). One family with a width axis: expanded bold for
// headings, normal width for text. The same family exists for Devanagari and Kannada,
// so Hindi and state-language pages can keep this voice later.
// next/font self-hosts it at build time: no request to Google at runtime.
const anek = Anek_Latin({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-anek",
});

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#15370d",
};

// Runs before first paint. It marks that scripts work, so CSS may hold a few things
// back for their entrance. Without it everything simply shows in its final state.
const markScripted = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={anek.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: markScripted }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
