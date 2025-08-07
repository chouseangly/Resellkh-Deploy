"use client";

import Image from "next/image";
import { FaFacebook, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  // Category IDs mapping - should match your backend
  const categoryMap = {
    fashion: 5,
    accessory: 1,
    sport: 3,
    beauty: 2,
    electronic: 8,
    furniture: 6, // Assuming furniture is under Home category
    kitchen: 6,   // Assuming kitchen is under Home category
    book: 4
  };

  return (
    <footer className="bg-[#f1edef] text-gray-800 py-8 sm:py-10 px-4 sm:px-6 md:px-8 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
        {/* Logo + Description */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Link href="/" className="focus:outline-none rounded">
              <Image
                src="/images/auth/logo1.png" 
                alt="ResellKH Logo" 
                width={120}
                height={60}
                className="w-24 sm:w-28 md:w-32 h-auto object-contain"
              />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We provide high-quality services and products to meet your needs.
            Thank you for supporting us!
          </p>
          {/* Social Icons */}
          <div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4 text-lg sm:text-xl text-gray-700">
            <a 
              href="#" 
              aria-label="Facebook" 
              className="hover:text-orange-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
            >
              <FaFacebook />
            </a>
            <a 
              href="#" 
              aria-label="TikTok" 
              className="hover:text-orange-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
            >
              <FaTiktok />
            </a>
            <a 
              href="#" 
              aria-label="Telegram" 
              className="hover:text-orange-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
            >
              <FaTelegramPlane />
            </a>
          </div>
        </div>

        {/* Category 1 */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-orange-500 mb-2 sm:mb-3">Categories</h2>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>
              <Link 
                href={`/category/${categoryMap.fashion}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Fashion
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.accessory}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Accessory
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.sport}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Sport
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.beauty}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Beauty
              </Link>
            </li>
          </ul>
        </div>

        {/* Category 2 */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-orange-500 mb-2 sm:mb-3">Categories</h2>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>
              <Link 
                href={`/category/${categoryMap.electronic}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Electronic
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.furniture}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Furniture
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.kitchen}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Kitchen
              </Link>
            </li>
            <li>
              <Link 
                href={`/category/${categoryMap.book}`} 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Book
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold text-orange-500 mb-2 sm:mb-3">Legal</h2>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>
              <Link 
                href="/privacy-policy" 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link 
                href="/fqa" 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link 
                href="/term-conditions" 
                className="hover:underline hover:text-orange-500 rounded px-1"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-300 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ResellKH. All rights reserved.
        </p>
      </div>
    </footer>
  );
}