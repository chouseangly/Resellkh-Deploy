import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// Expanded Metadata
export const metadata = {
  title: {
    default: "ResellKH - Buy & Sell Second-Hand Products in Cambodia",
    template: "%s | ResellKH", // Used by child pages to create titles like "Product Name | ResellKH"
  },
  description: "Your one-stop marketplace for buying and selling new and used goods in Cambodia. Discover great deals on fashion, electronics, and more.",
  openGraph: {
    title: "ResellKH - Second-Hand Marketplace",
    description: "The easiest way to buy and sell second-hand in Cambodia.",
    url: "https://www.resellkh.shop", // Replace with your actual domain
    siteName: "ResellKH",
    images: [
      {
        url: 'https://www.resellkh.store/og-image.jpg', // Create a default sharing image
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