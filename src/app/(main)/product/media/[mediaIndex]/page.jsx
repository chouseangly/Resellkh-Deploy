'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/components/services/getProduct.service';

// Skeleton for the main media view
const MediaSkeleton = () => (
    <div className="relative w-[376px] h-[376px] md:w-[500px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-200 animate-pulse" />
);

// Skeleton for the thumbnail view
const ThumbnailSkeleton = () => (
    <div className="w-[94px] h-[94px] rounded-xl bg-gray-200 animate-pulse" />
);


export default function FullscreenMediaPage({ params }) {
  const router = useRouter();
  const { productId, mediaIndex } = params;
  const index = parseInt(mediaIndex, 10);

  // State for product data, loading, and error
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch product data when the component mounts or productId changes
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        if (!data) {
          throw new Error('Product not found');
        }
        setProductData(data);
      } catch (err) {
        console.error("Failed to fetch product media:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Derive media items from the fetched product data
  const mediaItems = productData?.fileUrls ?? [];
  const media = mediaItems[index];
  const isVideo = media?.endsWith('.mp4'); // Simple check, could be improved if needed

  const goTo = (i) => {
    if (i >= 0 && i < mediaItems.length) {
      router.push(`/product/${productId}/media/${i}`);
    }
  };

  const closePage = () => {
    router.push(`/product/${productId}`);
  };

  // Render loading state
  if (loading) {
      return (
          <>
            <div className="flex items-center justify-between ps-[7%] mt-3 pr-4">
                <div className="flex items-center text-gray-500">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <svg className='mx-1' width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.98558 5.06864C7.32339 4.7931 7.8211 4.8128 8.13643 5.12775L13.0048 9.99638C13.1679 10.1596 13.2563 10.3779 13.2563 10.6044C13.2563 10.8309 13.1681 11.0488 13.0048 11.2127L8.13633 16.0811C7.80004 16.417 7.2557 16.417 6.92029 16.0811C6.58388 15.7451 6.58388 15.2006 6.92019 14.8648L11.1802 10.6044L6.92029 6.34407C6.60492 6.02908 6.5852 5.53088 6.86112 5.19302L6.92025 5.12769L6.98558 5.06864Z" fill="#343A40" />
                    </svg>
                    <span className="text-orange-500 cursor-default">Detail</span>
                </div>
                <button onClick={closePage} className="text-gray-500 pe-[7%] hover:text-black text-2xl">✕</button>
            </div>
            <main className="bg-white min-h-screen px-4 sm:px-6 lg:px-[7%] py-6 text-black">
                <div className="relative flex flex-col items-center justify-center">
                    <MediaSkeleton />
                    <div className="flex gap-4 justify-center mt-8 flex-wrap">
                        {[...Array(4)].map((_, i) => <ThumbnailSkeleton key={i} />)}
                    </div>
                </div>
            </main>
          </>
      );
  }

  // Render error state
  if (error || !media) {
    return <div className="text-center text-red-600 py-10">Media not found or could not be loaded.</div>;
  }


  return (
    <>
      <div className="flex items-center justify-between ps-[7%] mt-3 pr-4">
        {/* Breadcrumb on the Right */}
        <div className="flex items-center text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <svg className='mx-1' width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.98558 5.06864C7.32339 4.7931 7.8211 4.8128 8.13643 5.12775L13.0048 9.99638C13.1679 10.1596 13.2563 10.3779 13.2563 10.6044C13.2563 10.8309 13.1681 11.0488 13.0048 11.2127L8.13633 16.0811C7.80004 16.417 7.2557 16.417 6.92029 16.0811C6.58388 15.7451 6.58388 15.2006 6.92019 14.8648L11.1802 10.6044L6.92029 6.34407C6.60492 6.02908 6.5852 5.53088 6.86112 5.19302L6.92025 5.12769L6.98558 5.06864Z" fill="#343A40" />
          </svg>

          <span className="text-orange-500 cursor-default">Detail</span>
        </div>
        {/* Close Button on the Left */}
        <button
          onClick={closePage}
          className="text-gray-500 pe-[7%] hover:text-black text-2xl"
        >
          ✕
        </button>
      </div>

      <main className="bg-white min-h-screen px-4 sm:px-6 lg:px-[7%] py-6 text-black">
        <div className="relative flex flex-col items-center justify-center">
          {/* Left arrow */}
          {index > 0 && (
            <button
              onClick={() => goTo(index - 1)}
              className="absolute left-0 top-[180px] bg-white text-black rounded-full p-2 shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main media */}
          <div className="relative w-[376px] h-[376px] md:w-[500px] md:h-[400px] rounded-2xl overflow-hidden">
            {isVideo ? (
              <video
                src={media}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Image
                src={media}
                alt={`media-${index}`}
                width={376}
                height={376}
                className="object-cover rounded-2xl w-full"
                priority
              />
            )}
          </div>

          {/* Right arrow */}
          {index < mediaItems.length - 1 && (
            <button
              onClick={() => goTo(index + 1)}
              className="absolute right-0 top-[180px] bg-white text-black rounded-full p-2 shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}


        </div>

        {/* Thumbnails */}
        <div className="flex gap-4 justify-center mt-8 flex-wrap">
          {mediaItems.map((item, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative w-[94px] h-[94px] rounded-xl overflow-hidden border-2 ${i === index ? 'border-orange-500' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              {item.endsWith('.mp4') ? (
                <>
                  <video muted className="w-full h-full object-cover">
                    <source src={item} />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </>
              ) : (
                <Image
                  src={item}
                  alt={`thumb-${i}`}
                  width={70}
                  height={70}
                  className="object-cover w-full h-full"
                />
              )}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
