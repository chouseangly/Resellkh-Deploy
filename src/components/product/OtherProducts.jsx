'use client';

import { useState } from 'react';
import useSWR from 'swr';
import ProductCart from '../domain/ProductCart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PRODUCTS_PER_LOAD = 20;

// Generic fetcher function for useSWR
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  const data = await res.json();
  return data.payload || [];
};


const OtherProducts = () => {
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);
  const [loadingMore, setLoadingMore] = useState(false);

  // Use SWR to fetch, cache, and revalidate data
  const { data: products = [], error, isLoading } = useSWR(`${API_BASE_URL}/products`, fetcher);

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading time for UX
    setTimeout(() => {
      setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD);
      setLoadingMore(false);
    }, 600); // Adjust this delay if needed
  };

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <section className="mb-12 md:mt-12 lg:mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Other products you may like
      </h2>

      {isLoading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : error ? (
         <p className="text-red-500 text-center">Failed to load products.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[26px] justify-items-center">
            {visibleProducts.map((item) => {
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
                <ProductCart
                  key={item.productId}
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
              );
            })}
          </div>

          {visibleCount < products.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={`px-6 py-2 md:px-8 md:py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'View more'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default OtherProducts;
