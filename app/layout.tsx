import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@components/Navbar";
import TopGradient from "@public/topGradient.svg";
import { inter, poppins } from "@app/fonts";
import ThemeProvider from "@app/contex/ThemeContex";
import dynamic from "next/dynamic";
import AuthProvider from "@components/AuthProvider";
import Button from "@components/Button";
import { GoogleTagManager } from "@next/third-parties/google";
import { Suspense } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL("https://me-gaurav.vercel.app"),
  alternates: {
    canonical: "/",
  },

  title: "Gaurav- Full Stack Developer",
  description:
    "As a full stack developer, I assist emerging businesses in achieving their digital aspirations. I specialize in developing modern web applications",
  keywords:
    "Gaurav , gaurav , gaurav Portfolio, web developer Portfolio",
  authors: [
    { name: "Gaurav Singh", url: "https://www.linkedin.com/in/gaurav-singh-3593aa25b/" },
  ],

  openGraph: {
    images: "/logo.webp",
  },
};

const Footer = dynamic(() => import("@components/Footer"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-NDD25RKN" />
      <ThemeProvider>
        <AuthProvider>
          <Suspense>
            <body className={`${inter.className} dark:bg-[#0D0D0D]`}>
              <main className="container relative">
                <div className="w-full h-[500px] absolute top-0 right-0 -z-10">
                  <TopGradient className="w-full object-cover blur-2xl" />
                </div>
                {/* show logo on mobile */}
                <div className="w-full relative text-center block mb-20 sm:hidden">
                  <Button
                    link="/"
                    variant="icon"
                    title="onam"
                    className={`!text-4xl dark:text-white !p-0 !font-bold ${poppins.className}`}
                  >
                    {"<Gaurav/>"}
                  </Button>
                </div>
                <Navbar />
                {children}
              </main>
              <Footer />
            </body>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
