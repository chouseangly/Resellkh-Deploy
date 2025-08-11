"use client";

import Image from "next/image";
import { FaRegBookmark, FaBookmark, FaShoppingCart } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useBookmark } from "@/context/BookmarkContext";
import { encryptId } from "@/utils/encryption";

export default function ProductCart({
    id,
    imageUrl,
    title,
    description,
    price,
    originalPrice = null,
    discountText = null,
}) {
    const { toggleBookmark, isBookmarked, removeBookmark } = useBookmark();
    const { data: session } = useSession();
    const bookmarked = isBookmarked(id);
    const router = useRouter();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const getDiscountPercent = () => {
        if (discountText) {
            const match = discountText.match(/\d+/);
            return match ? parseInt(match[0]) : null;
        }
        return null;
    };

    const handleToggle = (e) => {
        e.stopPropagation();

        if (!session) {
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        toggleBookmark({
            id,
            imageUrl,
            title,
            description,
            price,
            originalPrice,
            discountPercent: getDiscountPercent(),
        });

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
    };



    const encryptedProductId = encodeURIComponent(encryptId(id));
    const handleCardClick = () => {
        router.push(`/product/${encryptedProductId}`);
    };

    if (session === "loading") {
        return null; 
    }

    return (
        // Card container is now flexible and will fill the grid cell.
        // `h-full` ensures all cards in a row have equal height.
        <div
            className="flex flex-col cursor-pointer bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 w-full h-full group hover:shadow-lg hover:border-gray-300"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image container uses aspect-ratio to maintain shape without a fixed height. */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                {discountText && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-[2px] rounded-full z-10 shadow">
                        {discountText}
                    </div>
                )}
                <Image
                    src={imageUrl || "/images/product/product.png"}
                    alt={title}
                    fill
                    // The 'sizes' attribute is optimized for the responsive grid layout.
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/e2e8f0?text='; }}
                />

                
            </div>

            {/* Card content area */}
            <div className="flex flex-col justify-between p-3 sm:p-4 flex-grow">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 truncate" title={title}>{title}</h3>
                    <p className="mt-1 text-xs text-gray-600 leading-snug line-clamp-2 h-[32px]">
                        {description}
                    </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-orange-500 font-bold text-base">${price}</span>
                        {originalPrice && (
                            <span className="text-gray-400 line-through text-xs">${originalPrice}</span>
                        )}
                    </div>
                    <div
                        className={`cursor-pointer transition-all duration-300 ${
                            isAnimating ? "scale-125" : "scale-100"
                        } ${bookmarked ? "text-orange-500" : "text-gray-400 hover:text-orange-400"}`}
                        onClick={handleToggle}
                    >
                        {bookmarked ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
                    </div>
                </div>
            </div>
        </div>
    );
}