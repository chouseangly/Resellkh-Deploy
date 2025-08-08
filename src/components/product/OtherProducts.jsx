'use client';

import useSWRInfinite from 'swr/infinite';
import ProductCart from '../domain/ProductCart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  const isLoadingMore = isLoading && pages.length > 0;
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

      {isLoading && products.length === 0 ? (
        <p className="text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Failed to load products.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[26px] justify-items-center">
            {products.map((item) => {
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
          </div>

          {!isReachingEnd && (
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
        </>
      )}
    </section>
  );
};

export default OtherProducts;