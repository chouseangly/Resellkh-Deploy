'use client';

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCart from "@/components/domain/ProductCart";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-40 w-full rounded-lg"></div>
    <div className="bg-gray-200 h-4 w-3/4 mt-2 rounded"></div>
    <div className="bg-gray-200 h-6 w-1/2 mt-1 rounded"></div>
  </div>
);

export default function ResultSearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/products/all`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
       const allProducts = Array.isArray(data.payload) ? data.payload : [];

        const filtered = allProducts.filter((product) =>
          product.productName.toLowerCase().includes(query.toLowerCase())
        );

        setProducts(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const itemsToShow = products.slice(0, visibleCount);

  return (
    <>
      <div className="flex ps-[7%] mt-3 items-center">
        <p className="text-gray-500 flex items-center">
          <Link href="/">Home</Link>
        </p>
        <svg className="mx-1" width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M6.98558 5.06864C7.32339 4.7931 7.8211 4.8128 8.13643 5.12775L13.0048 9.99638C13.1679 10.1596 13.2563 10.3779 13.2563 10.6044C13.2563 10.8309 13.1681 11.0488 13.0048 11.2127L8.13633 16.0811C7.80004 16.417 7.2557 16.417 6.92029 16.0811C6.58388 15.7451 6.58388 15.2006 6.92019 14.8648L11.1802 10.6044L6.92029 6.34407C6.60492 6.02908 6.5852 5.53088 6.86112 5.19302L6.92025 5.12769L6.98558 5.06864Z" fill="#343A40" />
        </svg>
        <span className="pointer-events-none text-orange-500">
          Search results for "{query}"
        </span>
      </div>

      <div className="px-[7%]">
        <div className="p-4 md:p-6">
          <div className="p-4 rounded-[24px] border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm md:text-lg lg:text-lg font-semibold text-gray-800">
                {loading ? 'Searching...' : `${products.length} results for '${query}' in Cambodia`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <h2 className="font-semibold text-xl mb-2">Something went wrong</h2>
                <span className="text-sm text-gray-600">{error}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <img src="/images/story set/no listings.jpg" alt="No Results" className="w-[350px] h-auto mb-6" />
                <h2 className="font-semibold text-xl mb-2">No results found for "{query}"</h2>
                <span className="text-sm text-gray-600">Try checking your spelling or using different keywords.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
                {itemsToShow.map((product) => {
                  let price = product.productPrice || 0;
                  if (product.discountPercent > 0) {
                    price = (price * (100 - product.discountPercent)) / 100;
                  }

                  return (
                    <ProductCart
                      key={product.productId}
                      id={product.productId}
                      imageUrl={product.fileUrls?.[0] || '/images/placeholder.jpg'}
                      title={product.productName}
                      description={product.description}
                      price={price.toFixed(2)}
                      originalPrice={product.discountPercent ? product.productPrice.toFixed(2) : null}
                      discountText={product.discountPercent ? `${product.discountPercent}% OFF` : null}
                    />
                  );
                })}
              </div>
            )}

            {!loading && visibleCount < products.length && (
              <div className="w-full text-center mt-6 mb-1">
                <button
                  onClick={handleViewMore}
                  className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                >
                  View more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
