'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin } from 'react-icons/fi';
import { BiCategoryAlt } from 'react-icons/bi';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from './navbar/SearchBar';
import LocationDropdown from './navbar/LocationDropdown';
import ImageScanModal from './navbar/ImageScanModal';

export default function GuestNavbar() {
  const [scanOpen, setScanOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="w-full bg-white px-14 py-4">
      <div className="max-w-screen-full mx-auto flex flex-col gap-3">
        {/* Top Navigation */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="ResellKH Logo"
            onClick={() => router.push('/')}
            className="cursor-pointer h-[40px]"
          />

          {/* Category Links */}
          <nav className="hidden md:flex gap-6 text-sm text-gray-800">
            <Link href="#" className="hover:text-orange-500">Fashion</Link>
            <Link href="#" className="hover:text-orange-500">Accessories</Link>
            <Link href="#" className="hover:text-orange-500">Sport</Link>
            <Link href="#" className="hover:text-orange-500">Beauty</Link>
            <Link href="#" className="hover:text-orange-500">Book</Link>
            <Link href="#" className="hover:text-orange-500 flex items-center gap-1">
              <BiCategoryAlt className="text-[17px]" /> All Categories
            </Link>
          </nav>

          {/* Auth Links */}
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <Link href="/register" className="hover:underline">Register</Link>
            <Link href="/login" className="hover:underline">Log in</Link>
            <button
              onClick={() => router.push('/sell')}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-orange-600"
            >
              Sell
            </button>
          </div>
        </div>

        {/* Search + Location */}
        <div className="flex flex-col lg:flex-row gap-3 mt-2">
          <SearchBar />
          <LocationDropdown />
        </div>
      </div>

      {/* Image Scan Modal */}
      <ImageScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </header>
  );
}
