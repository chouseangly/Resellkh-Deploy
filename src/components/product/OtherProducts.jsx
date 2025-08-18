'use client';

import useSWRInfinite from 'swr/infinite';
import ProductCart from '../domain/ProductCart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✨ Skeleton Card for loading state
const SkeletonCard = () => (
  <div className="w-full">
    <div className="w-full animate-pulse bg-white p-2 rounded-2xl border border-gray-200/80">
      <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-300 rounded w-1/3"></div>
        <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  </div>
);

// getKey for SWRInfinite
const getKey = (pageIndex, previousPageData) => {
  if (previousPageData && previousPageData.last) return null;
  return `/products?page=${pageIndex}&size=20`;
};

// Fetcher function
const fetcher = async (url) => {
  const res = await fetch(`${API_BASE_URL}${url}`);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  const data = await res.json();
  return data.payload; // payload contains content + pagination info
};

const OtherProducts = () => {
  const {
    data: pages = [],
    error,
    size,
    setSize,
    isLoading,
    isValidating
  } = useSWRInfinite(getKey, fetcher);

  // Flatten the product list
  const products = pages ? pages.flatMap(page => page.content) : [];

  // Loading states
  const isLoadingInitialData = isLoading && products.length === 0;
  const isLoadingMore = isValidating && products.length > 0;
  const isReachingEnd = !pages || pages[pages.length - 1]?.last;

  const handleLoadMore = () => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  };

  return (
    <section className="mb-12 md:mt-12 lg:mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Other products you may like
      </h2>

      <div className="grid grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 justify-items-center">
        {/* Initial loading skeletons */}
        {isLoadingInitialData &&
          Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={`skeleton-initial-${i}`} />
          ))}

        {error && (
          <p className="text-red-500 text-center col-span-full">
            Failed to load products.
          </p>
        )}

        {/* Product cards */}
        {!isLoadingInitialData &&
          !error &&
          products.map((item) => {
            const price =
              typeof item.productPrice === 'number'
                ? item.discountPercent
                  ? (item.productPrice * (100 - item.discountPercent)) / 100
                  : item.productPrice
                : 0;

            const imageUrl = item.media?.[0]?.fileUrl || '/placeholder.png';

            return (
              <ProductCart
                key={item.productId}
                id={item.productId}
                imageUrl={imageUrl}
                title={item.productName}
                description={item.description}
                price={price.toFixed(2)}
                originalPrice={
                  item.discountPercent ? item.productPrice.toFixed(2) : null
                }
                discountText={
                  item.discountPercent ? `${item.discountPercent}% OFF` : null
                }
              />
            );
          })}

        {/* Loading skeletons when fetching more */}
        {isLoadingMore &&
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`skeleton-more-${i}`} />
          ))}
      </div>

      {/* Load more button */}
      {!isReachingEnd && !isLoadingInitialData && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 md:px-8 md:py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
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
    </section>
  );
};

export default OtherProducts;
