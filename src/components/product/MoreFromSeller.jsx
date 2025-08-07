'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import ProductCart from '../domain/ProductCart';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// A generic fetcher function for useSWR
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.payload || [];
};

// A skeleton loader component that matches the responsive card layout
const SkeletonCard = () => (
    <div className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 p-2 snap-start">
        <div className="w-full h-full animate-pulse bg-gray-200 rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-gray-300"></div>
            <div className="p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-400 rounded w-1/3"></div>
                    <div className="h-5 w-5 bg-gray-400 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);


const MoreFromSeller = ({ sellerId }) => {
  const scrollRef = useRef(null);

  // Use SWR for data fetching. The key is an array, so SWR will only fetch if sellerId is truthy.
  const { data: products, error, isLoading } = useSWR(
    sellerId ? `${API_BASE_URL}/products/getproductbyuserid/${sellerId}` : null,
    fetcher
  );

  // This scroll function is now responsive, scrolling by the container's width.
  const scroll = (direction) => {
    if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' 
            ? scrollLeft - clientWidth 
            : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-8 md:py-12">
      <div className="w-full mx-auto px-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            More from this seller
          </h2>
          {/* Scroll arrows are only shown if there are products to scroll */}
          {!isLoading && products && products.length > 0 && (
            <div className="flex gap-2 self-end sm:self-auto">
                <button
                    onClick={() => scroll('left')}
                    className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Scroll left"
                >
                    <FiChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Scroll right"
                >
                    <FiChevronRight className="w-5 h-5 text-gray-700" />
                </button>
            </div>
          )}
        </div>

        {/* Scrollable Cards Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-2"
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)
          ) : error ? (
            <div className="w-full text-center py-10 text-red-500">
                <p>Could not load products. Please try again later.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="w-full text-center py-10 text-gray-500">
                <p>This seller has no other products for sale.</p>
            </div>
          ) : (
            products.map((item) => {
              const price =
                typeof item.productPrice === 'number'
                  ? item.discountPercent
                    ? (item.productPrice * (100 - item.discountPercent)) / 100
                    : item.productPrice
                  : 0;

              const imageUrl =
                Array.isArray(item.fileUrls) && item.fileUrls.length > 0
                  ? item.fileUrls[0]
                  : '/placeholder.png';

              return (
                // This wrapper div is now responsive, using percentage-based widths.
                <div
                  key={item.productId}
                  className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 p-2 snap-start"
                >
                  <ProductCart
                    id={item.productId}
                    imageUrl={imageUrl}
                    title={item.productName}
                    description={item.description}
                    price={price.toFixed(2)}
                    originalPrice={
                      item.discountPercent ? item.productPrice : null
                    }
                    discountText={
                      item.discountPercent
                        ? `${item.discountPercent}% OFF`
                        : null
                    }
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default MoreFromSeller;
