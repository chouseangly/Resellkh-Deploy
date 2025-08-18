'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetails from '@/components/product/ProductDetails';
import SellerInfo from '@/components/product/SellerInfo';
import Reviews from '@/components/product/Reviews';
import MoreFromSeller from '@/components/product/MoreFromSeller';
import OtherProducts from '@/components/product/OtherProducts';
import ContactSellerHeader from '@/components/product/ContactSellerHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProductPageClient({ productData }) {
  const [ratingData, setRatingData] = useState(null);

  const fetchRatingData = async () => {
    if (!productData?.userId) return;
    try {
      const tokenFromStorage = localStorage.getItem("token");
      const headers = {
        Accept: '*/*',
        ...(tokenFromStorage ? { Authorization: `Bearer ${tokenFromStorage}` } : {}),
      };
      const ratingRes = await fetch(`${API_BASE_URL}/ratings/summary/${productData.userId}`, {
        method: 'GET',
        headers
      });
      if (ratingRes.ok) {
        const ratingSummary = await ratingRes.json();
        setRatingData(ratingSummary.payload || null);
      }
    } catch (err) {
      console.error('Fetch rating error:', err);
    }
  };

  useEffect(() => {
    fetchRatingData();
  }, [productData?.userId]);

  if (!productData) {
    return <div className="text-center py-20 text-gray-500">Product data is not available.</div>;
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-20 py-6 bg-white text-black max-w-screen-2xl">
      <div className="flex items-center text-gray-500 mb-6 text-sm sm:text-base">
        <Link href="/" className="hover:text-black">Home</Link>
        <svg className="mx-2" width="16" height="16" viewBox="0 0 20 21" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.98558 5.06864C7.32339 4.7931 7.8211 4.8128 8.13643 5.12775L13.0048 9.99638C13.1679 10.1596 13.2563 10.3779 13.2563 10.6044C13.2563 10.8309 13.1681 11.0488 13.0048 11.2127L8.13633 16.0811C7.80004 16.417 7.2557 16.417 6.92029 16.0811C6.58388 15.7451 6.58388 15.2006 6.92019 14.8648L11.1802 10.6044L6.92029 6.34407C6.60492 6.02908 6.5852 5.53088 6.86112 5.19302L6.92025 5.12769L6.98558 5.06864Z"
            fill="#343A40"
          />
        </svg>
        <span className="text-orange-500">Detail</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-10">
        <ProductGallery product={productData} />
        <ProductDetails product={productData} />
      </div>

      <ContactSellerHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-1">
          <SellerInfo sellerId={productData.userId} ratingData={ratingData} />
        </div>
        <div className="lg:col-span-2">
          <Reviews
            sellerId={productData.userId}
            onReviewSubmitted={fetchRatingData}
          />
        </div>
      </div>

      <MoreFromSeller sellerId={productData.userId} />
      <OtherProducts categoryId={productData.mainCategoryId} />
    </div>
  );
}