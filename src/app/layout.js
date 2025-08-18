// src/app/layout.js
import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: {
    default: "ResellKH - Buy & Sell Second-Hand Products in Cambodia",
    template: "%s | ResellKH",
  },
  description: "Your one-stop marketplace for buying and selling new and used goods in Cambodia. Discover great deals on fashion, electronics, and more.",
  // Add the icons section here
  icons: {
    icon: '/images/auth/logo1.png',
  },
  openGraph: {
    title: "ResellKH - Second-Hand Marketplace",
    description: "The easiest way to buy and sell second-hand in Cambodia.",
    url: "https://www.resellkh.shop",
    siteName: "ResellKH",
    images: [
      {
        url: 'https://www.resellkh.store/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}