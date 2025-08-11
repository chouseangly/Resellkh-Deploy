'use client';

import useSWRInfinite from 'swr/infinite';
import ProductCart from '../domain/ProductCart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✨ ENHANCEMENT: A skeleton card for better loading UX.
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


// The getKey function tells SWRInfinite how to fetch the data for each page.
const getKey = (pageIndex, previousPageData) => {
  // If the previous page was the last one, we don't need to fetch more.
  if (previousPageData && previousPageData.last) {
    return null;
  }
  // This is the first page to be fetched.
  if (pageIndex === 0) {
    return `/products?page=0&size=20`;
  }
  // This is for subsequent pages.
  return `/products?page=${pageIndex}&size=20`;
};

// The fetcher function now correctly parses the paginated response from the API.
const fetcher = async (url) => {
  const res = await fetch(`${API_BASE_URL}${url}`);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  const data = await res.json();
  // We return the entire payload, which includes the content and pagination info.
  return data.payload;
};

const OtherProducts = () => {
  // useSWRInfinite handles all the pagination logic for us.
  const {
    data: pages = [],
    error,
    size,
    setSize,
    isLoading
  } = useSWRInfinite(getKey, fetcher);

  // We flatten the pages array to get a single list of products.
  const products = pages ? pages.flatMap(page => page.content) : [];
  const isLoadingInitialData = isLoading && products.length === 0;
  const isLoadingMore = isLoading && products.length > 0;
  const isReachingEnd = !pages || pages[pages.length - 1]?.last;

  const handleLoadMore = () => {
    // We just need to tell SWRInfinite to fetch the next page.
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
            {/* ✨ ENHANCEMENT: Show skeletons on initial load */}
            {isLoadingInitialData && (
                Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`skeleton-initial-${i}`} />)
            )}

            {error && (
                <p className="text-red-500 text-center col-span-full">Failed to load products.</p>
            )}

            {!isLoadingInitialData && !error && products.map((item) => {
              const price =
                typeof item.productPrice === 'number'
                  ? item.discountPercent
                    ? (item.productPrice * (100 - item.discountPercent)) / 100
                    : item.productPrice
                  : 0;

              // ✨ FIX: Correctly access the image URL from the 'media' array.
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
                    item.discountPercent
                      ? `${item.discountPercent}% OFF`
                      : null
                  }
                />
              );
            })}

            {/* ✨ ENHANCEMENT: Show skeletons when loading more */}
            {isLoadingMore && (
                 Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skeleton-more-${i}`} />)
            )}
        </div>

        {!isReachingEnd && !isLoadingInitialData && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={`px-6 py-2 md:px-8 md:py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto disabled:opacity-75 disabled:cursor-not-allowed`}
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