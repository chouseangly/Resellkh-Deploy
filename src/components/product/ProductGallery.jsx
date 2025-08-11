'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * NOTE: To hide the scrollbar, add the following CSS to your global stylesheet (e.g., globals.css):
 *
 * .no-scrollbar::-webkit-scrollbar {
 * display: none;
 * }
 * .no-scrollbar {
 * -ms-overflow-style: none;
 * scrollbar-width: none;
 * }
 */

const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ProductGallery = ({ product }) => {
  // SIMPLIFIED: We now get media items directly from product.media
  // Each item is an object: { fileUrl: '...', contentType: '...' }
  const mediaItems = product?.media ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  // REMOVED: No more need for mediaTypes or isLoadingTypes state
  // REMOVED: The entire useEffect for fetching headers is gone, making the component faster.

  // Skeleton for when the product data itself is not yet loaded.
  if (!product) {
    return (
      <div className="flex flex-row gap-3 w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="w-[84px] h-[64px] sm:w-[94px] sm:h-[94px] rounded-lg" />
          ))}
        </div>
        <div className="flex-grow w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
          <SkeletonBox className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-3 w-full max-w-full overflow-hidden">
      {/* Thumbnails - vertical layout */}
      <div className="flex flex-col ps-[1px] pt-[1px] gap-[5px] max-h-[390px] sm:max-h-[550px] no-scrollbar ">
        {mediaItems.map((item, index) => {
          // SIMPLIFIED: We check the contentType string directly.
          const isVideo = item.contentType.startsWith('video');

          return (
            <button
              key={item.fileUrl} // The URL is a great unique key
              onClick={() => setSelectedIndex(index)}
              aria-current={selectedIndex === index ? 'true' : undefined}
              className={`relative w-[74px] h-[64px] sm:w-[94px] sm:h-[94px] rounded-lg overflow-hidden border transition-all flex-shrink-0 ${
                selectedIndex === index
                  ? 'border-orange-500 ring-1 ring-orange-500'
                  : 'border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500'
              }`}
            >
              {isVideo ? (
                <video
                  src={item.fileUrl} // Use the fileUrl from the item object
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={item.fileUrl} // Use the fileUrl from the item object
                  alt={`Thumbnail ${index + 1}`}
                  width={94}
                  height={94}
                  className="w-full h-full object-cover"
                  priority={index < 5}
                  quality={75}
                />
              )}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Media Display */}
      <div className="flex-grow w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
        {mediaItems.length > 0 ? (
          (() => {
            const selectedItem = mediaItems[selectedIndex];
            const isVideo = selectedItem.contentType.startsWith('video');
            
            return isVideo ? (
              <video
                key={selectedItem.fileUrl}
                src={selectedItem.fileUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="block w-full h-full relative">
                <Image
                  src={selectedItem.fileUrl}
                  alt="Main product image"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                  quality={85}
                />
              </div>
            );
          })()
        ) : (
          // Placeholder for products with no media
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {/* You can put a placeholder image component here if you want */}
            <span className="text-gray-500">No media available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;