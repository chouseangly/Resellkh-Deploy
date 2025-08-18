'use client';

import { useEffect } from "react";
import useSWRInfinite from 'swr/infinite';
import ProductCart from "../domain/ProductCart";
import { productService } from "../services/allProduct.service";
import { eventService } from "../services/even.service";

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

const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && previousPageData.last) return null;
    return `/products?page=${pageIndex}&size=15`;
};

const fetcher = url => {
    const params = new URLSearchParams(url.split('?')[1]);
    const page = parseInt(params.get('page')) || 0;
    const size = parseInt(params.get('size')) || 15;
    return productService.fetchRecommendedProducts(page, size);
};

export default function RecommendedList() {
    const {
        data: pages = [],
        error,
        size,
        setSize,
        mutate,
        isLoading,
        isValidating
    } = useSWRInfinite(getKey, fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
    });

    const items = pages ? pages.flatMap(page => page.content) : [];

    const isLoadingInitialData = isLoading && items.length === 0;
    const isLoadingMore = isValidating && size > 0 && !pages[pages.length - 1]?.last;
    const isReachingEnd = !pages || pages[pages.length - 1]?.last;

    useEffect(() => {
        const handleProductAdded = () => {
            console.log("New product added event received, revalidating list...");
            mutate();
        };

        eventService.on('productAdded', handleProductAdded);
        return () => {
            eventService.remove('productAdded', handleProductAdded);
        };
    }, [mutate]);

    const handleViewMore = () => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize(size + 1);
        }
    };

    return (
        <section className="w-full pt-5 md:pt-10 mb-10">
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                    Recommended For You
                </h2>

                {error && (
                    <p className="text-red-500 mb-4 text-center">
                        Failed to load recommended products. Please try again later.
                    </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {items.map((item) => {
                        const originalPrice = Number(item.productPrice) || 0;
                        const discountPercent = Number(item.discountPercent) || 0;
                        const hasDiscount = discountPercent > 0;
                        let finalPrice = hasDiscount
                            ? (originalPrice * (100 - discountPercent)) / 100
                            : originalPrice;

                        if (isNaN(finalPrice)) finalPrice = 0;

                        return (
                            <ProductCart
                                key={item.productId}
                                id={item.productId}
                                imageUrl={item.media?.[0]?.fileUrl || "/images/product/product.png"}
                                title={item.productName}
                                description={item.description}
                                price={finalPrice.toFixed(2)}
                                originalPrice={hasDiscount ? originalPrice.toFixed(2) : null}
                                discountText={hasDiscount ? `${discountPercent}% OFF` : null}
                            />
                        );
                    })}

                    {(isLoadingInitialData || isLoadingMore) &&
                        Array.from({ length: isLoadingInitialData ? 10 : 5 }).map((_, i) => (
                            <SkeletonCard key={`skeleton-${i}`} />
                        ))}
                </div>

                {!isLoading && items.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No recommended products found at the moment.</p>
                    </div>
                )}

                {!isReachingEnd && !isLoadingInitialData && (
                    <div className="text-center mt-8 md:mt-10">
                        <button
                            onClick={handleViewMore}
                            disabled={isLoadingMore}
                            className="px-6 py-2 md:px-8 md:py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors flex items-center justify-center mx-auto disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                    Loading...
                                </>
                            ) : (
                                "View more"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
