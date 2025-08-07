'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

// Simple skeleton box component for loading states
const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ProductGallery = ({ product }) => {
  const mediaItems = product?.fileUrls ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  // FIX: Get media type directly from the content_type provided by the backend
  const getMediaType = (url, contentType) => {
    if (contentType) {
      return contentType.startsWith('video') ? 'video' : 'image';
    }
    // Fallback for older data that might not have contentType
    return /\.(mp4|mov|webm|avi|mkv)$/i.test(url) ? 'video' : 'image';
  };

  // The mediaTypes can now be determined without fetching
  const mediaTypes = mediaItems.map((item) =>
    getMediaType(item.url, item.contentType)
  );

  // No need for a loading skeleton for media types anymore, but we'll keep one for initial product load.
  if (!product) {
    return (
      <div className="flex flex-row gap-3 w-full max-w-full overflow-hidden">
        {/* Thumbnails skeleton (vertical column) */}
        <div className="flex flex-col gap-2">
          {[...Array(1)].map((_, i) => (
            <SkeletonBox
              key={i}
              className="w-[84px] h-[64px] sm:w-[94px] sm:h-[94px] rounded-lg"
            />
          ))}
        </div>

        {/* Main media skeleton */}
        <div className="flex-grow w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
          <SkeletonBox className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-3 w-full max-w-full overflow-hidden">
      {/* Thumbnails - vertical layout with hidden scrollbar */}
     <div className="flex flex-col ps-[1px] pt-[1px] gap-[5px] max-h-[390px] sm:max-h-[550px] no-scrollbar">
        {mediaItems.map((src, index) => {
          const isVideo = getMediaType(src, product.contentTypes?.[index]) === 'video';

          return (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              aria-current={selectedIndex === index ? 'true' : undefined}
              className={`relative w-[84px] h-[64px] sm:w-[94px] sm:h-[94px] rounded-lg overflow-hidden border transition-all flex-shrink-0 ${
                selectedIndex === index
                  ? 'border-orange-500 ring-1 ring-orange-500'
                  :'border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500'
              }`}
            >
              {isVideo ? (
                <video
                  src={src}
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  width={94}
                  height={94}
                  className="w-full h-full object-cover"
                  priority={index < 5} // Prioritize loading for the first few images
                  quality={75} // Lower quality for thumbnails
                />
              )}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          getMediaType(mediaItems[selectedIndex], product.contentTypes?.[selectedIndex]) === 'video' ? (
            <video
              key={mediaItems[selectedIndex]} // Add key to force re-render on source change
              src={mediaItems[selectedIndex]}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div
             
              className="block w-full h-full relative"
            >
              <Image
                src={mediaItems[selectedIndex]}
                alt="Main product image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
                quality={85} // Slightly higher quality for the main image
              />
            </div>
          )
        ) : (
          // Placeholder for when there are no images
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Image
              src={'/images/placeholder.jpg'}
              alt="Placeholder image"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
