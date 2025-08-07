'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProductsByImage } from '@/components/services/ScanProduct.service';
import ProductCart from '@/components/domain/ProductCart';

// SVG Icons (no changes needed here)
const MagnifyingGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const ArrowPathIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default function ResultScanClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imgSrc = searchParams.get('imgSrc');
  const [scanResults, setScanResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSimilarProducts = useCallback(async () => {
    // ... (logic is unchanged, safe to keep as is)
    if (!imgSrc) {
      setIsLoading(false);
      setError({
        title: "No Image Provided",
        message: "It looks like you reached this page without scanning an image. Please go back and try again.",
        icon: <MagnifyingGlassIcon />
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(imgSrc);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const file = new File([blob], 'search-image.jpg', { type: blob.type });

      const result = await searchProductsByImage(file);

      if (result.payload?.length > 0) {
        const formattedResults = result.payload.map((product, index) => ({
          id: product.productId || index,
          title: product.productName,
          description: product.description,
          productPrice: product.productPrice,
          discountPercent: product.discountPercent,
          imageUrl: product.fileUrls?.[0] || 'https://i0.wp.com/www.magetop.com/blog/wp-content/uploads/2021/06/How-To-Upload-Product-Image-Placeholder-In-Magento-2.png?resize=800%2C445&ssl=1',
          condition: product.condition,
          location: product.location,
        }));
        setScanResults(formattedResults);
      } else {
        setError({
          title: "No matches found",
          message: "We couldn't find similar products. Try with a different image or check back later.",
          icon: <MagnifyingGlassIcon />
        });
        setScanResults([]);
      }
    } catch (err) {
      setError({
        title: "Search failed",
        message: err.message || "Something went wrong. Please try again.",
        icon: <ArrowPathIcon />
      });
      setScanResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [imgSrc]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSimilarProducts();
  }, [fetchSimilarProducts]);

  const handleTryAgain = () => {
    fetchSimilarProducts();
  };

  const EmptyState = ({ error }) => (
    <div className="flex flex-col items-center justify-center text-center py-10 sm:py-16">
        <div className="mb-6 p-4 bg-gray-100 rounded-full">
            {error?.icon || <MagnifyingGlassIcon />}
        </div>
        <h2 className="font-semibold text-lg sm:text-xl mb-2">
            {error?.title || "No similar products found"}
        </h2>
        <p className="text-gray-600 max-w-md mb-6 px-4">
            {error?.message || "We couldn't find any matching products. Try with a different image."}
        </p>
        {/* Buttons stack on mobile and go side-by-side on larger screens */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
                Try Different Image
            </button>
            <button
                onClick={handleTryAgain}
                className="w-full sm:w-auto px-6 py-2 bg-[#ea580c] text-white rounded-lg hover:bg-[#d95f0e] flex items-center justify-center gap-2 text-sm font-medium"
            >
                <ArrowPathIcon className="w-5 h-5" />
                Search Again
            </button>
        </div>
    </div>
);


  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {imgSrc && (
        /* Responsive padding and margin */
        <div className="bg-[#f2edef] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow relative">
            <button
                onClick={() => router.back()}
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
                aria-label="Close"
            >
                &times;
            </button>
            <h2 className="text-center text-sm sm:text-base font-semibold text-gray-800 mb-4">
                Search any image with Lens
            </h2>
            <div className="flex justify-center">
                {/* Responsive image size */}
                <img
                    src={imgSrc}
                    alt="Scanned"
                    className="w-48 sm:w-60 md:w-72 h-auto rounded-xl border object-contain bg-white"
                />
            </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ea580c] mb-4"></div>
            {/* Responsive text size */}
          <p className="text-sm sm:text-base">Searching for similar products...</p>
        </div>
      ) : scanResults.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            {/* Responsive heading size */}
            <h2 className="text-lg md:text-xl font-semibold">Similar Products</h2>
            <button
                onClick={handleTryAgain}
                className="text-[#ea580c] hover:text-[#d95f0e] flex items-center gap-1 text-xs sm:text-sm"
            >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
            </button>
          </div>
          {/* Responsive grid with adjusted gaps and padding for better mobile view */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {scanResults.map((item) => (
                  <ProductCart
                      key={item.id}
                      id={item.id}
                      imageUrl={item.imageUrl}
                      title={item.title}
                      description={item.description}
                      price={(item.productPrice * (100 - (item.discountPercent || 0)) / 100).toFixed(2)}
                      originalPrice={item.discountPercent ? item.productPrice.toFixed(2) : null}
                      discountText={item.discountPercent ? `${item.discountPercent}% OFF` : null}
                  />
              ))}
          </div>
        </>
      ) : (
        <EmptyState error={error} />
      )}
    </div>
  );
}