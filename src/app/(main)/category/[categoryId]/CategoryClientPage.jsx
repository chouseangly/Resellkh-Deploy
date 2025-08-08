// src/app/(main)/category/[categoryId]/CategoryClientPage.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { getProductsByCategoryId } from "@/components/services/productCategory.service";
import ProductCart from "@/components/domain/ProductCart";

const categoryDisplayNames = {
  1: "Accessories",
  2: "Beauty",
  3: "Equipment, Bag & Shoes",
  4: "Book",
  5: "Fashion",
  6: "Home",
  7: "Sports & Kids",
  8: "Electronic",
  9: "Vehicle",
  10: "Other"
};

// This new, safer component handles product data transformation.
const ProductData = ({ item }) => {
  // 1. Safely get the original price, defaulting to 0 if invalid.
  const originalPrice = typeof item.productPrice === 'number' ? item.productPrice : 0;
  const discountPercent = typeof item.discountPercent === 'number' ? item.discountPercent : 0;
  const hasDiscount = discountPercent > 0;

  // 2. Calculate the final price.
  const finalPrice = hasDiscount
    ? (originalPrice * (100 - discountPercent)) / 100
    : originalPrice;

  return (
    <ProductCart
      key={item.productId}
      id={item.productId}
      imageUrl={item.fileUrls?.[0] || "/images/default-product.png"}
      title={item.productName}
      description={item.description}
      // 3. It's now always safe to call .toFixed()
      price={finalPrice.toFixed(2)}
      originalPrice={hasDiscount ? originalPrice.toFixed(2) : null}
      discountText={hasDiscount ? `${discountPercent}% OFF` : null}
      location={item.location}
      condition={item.condition}
    />
  );
};

const fetcher = (categoryId) => getProductsByCategoryId(categoryId);

export default function CategoryClientPage({ categoryId, initialProducts }) {
  const parsedCategoryId = parseInt(categoryId);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isViewingMore, setIsViewingMore] = useState(false);

  const {
    data: products,
    error,
    isLoading
  } = useSWR(parsedCategoryId, fetcher, {
    fallbackData: initialProducts,
    revalidateOnFocus: false,
  });

  if (error && error.message.includes('401')) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const itemsToShow = products ? products.slice(0, visibleCount) : [];

  const handleViewMore = () => {
    setIsViewingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsViewingMore(false);
    }, 500);
  };

  const categoryName = categoryDisplayNames[parsedCategoryId] || "All Items";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="font-semibold text-xl mb-2">Error loading products</h2>
        <span className="text-sm text-gray-600">{error.message}</span>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex ps-[5%] lg:ps-[7%] mt-3 items-center">
        <p className="text-gray-500 flex items-center">
          <Link href="/" className="text-sm md:text-base">Home</Link>
        </p>
        <svg
          className="mx-1 w-4 h-4 md:w-5 md:h-5"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.98558 5.06864C7.32339 4.7931 7.8211 4.8128 8.13643 5.12775L13.0048 9.99638C13.1679 10.1596 13.2563 10.3779 13.2563 10.6044C13.2563 10.8309 13.1681 11.0488 13.0048 11.2127L8.13633 16.0811C7.80004 16.417 7.2557 16.417 6.92029 16.0811C6.58388 15.7451 6.58388 15.2006 6.92019 14.8648L11.1802 10.6044L6.92029 6.34407C6.60492 6.02908 6.5852 5.53088 6.86112 5.19302L6.92025 5.12769L6.98558 5.06864Z"
            fill="#343A40"
          />
        </svg>
        <span className="pointer-events-none text-orange-500 text-sm md:text-base">
          {categoryName}
        </span>
      </div>

      {/* Main Content */}
      <div className="px-[5%] sm:px-[7%]">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                {products.length}+ items found for '{categoryName}' in Cambodia
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center">
                <img
                  src="/images/story set/no listings.jpg"
                  alt="No Listings"
                  className="w-[250px] sm:w-[300px] md:w-[350px] h-auto mb-4 sm:mb-6"
                />
                <h2 className="font-semibold text-lg sm:text-xl mb-2">
                  Nothing to see here yet
                </h2>
                <span className="text-xs sm:text-sm text-gray-600">
                  Try another category.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 justify-items-center">
                {itemsToShow.map((item) => (
                    <ProductData item={item} key={item.productId} />
                ))}
              </div>
            )}

            {visibleCount < products.length && (
              // This div now uses flexbox to center the button
              <div className="w-full flex justify-center mt-4 sm:mt-6 mb-1">
                <button
                  onClick={handleViewMore}
                  disabled={isViewingMore}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition text-sm sm:text-base disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isViewingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'View more'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}