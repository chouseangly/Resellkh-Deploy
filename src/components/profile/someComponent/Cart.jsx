"use client";

import { useState } from "react";
import Image from "next/image";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useBookmark } from "@/context/BookmarkContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { encryptId } from "@/utils/encryption";

export default function Cart({
  id,
  userId, // The ID of the user who owns the product
  imageUrl,
  title,
  description,
  price,
  originalPrice = null,
  discountText = null,
  showEditButton = false,
  onEdit = null,
}) {
  const { toggleBookmark, isBookmarked } = useBookmark();
  const bookmarked = isBookmarked(id);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // FIX: Ensure a reliable comparison by converting both the session user's ID
  // and the product's owner ID to strings. This prevents type mismatches
  // (e.g., number vs. string) from causing the check to fail.
  const isOwner = !!(session?.user?.id && userId && session.user.id.toString() === userId.toString());

  const getDiscountPercent = () => {
    if (discountText) {
      const match = discountText.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }
    return null;
  };

  const getEncrypted = (id) => {
    try {
      if (!id) return "";
      const encrypted = encryptId(id.toString());
      return encodeURIComponent(encrypted);
    } catch (error) {
      console.error("Product ID encryption failed:", error);
      return id; // Fallback to unencrypted ID on error
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card click event from firing
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

  const handleCardClick = () => {
    router.push(`/product/${getEncrypted(id)}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click event from firing
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/edit-product/${getEncrypted(id)}`);
    }
  };

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-md overflow-hidden transition-transform w-full max-w-sm relative cursor-pointer hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-square">
        {discountText && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-[2px] rounded-full z-10 shadow">
            {discountText}
          </div>
        )}

        {/* This button will now correctly show only for the product owner */}
        {showEditButton && isOwner && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105 z-10"
            title="Edit Product"
          >
            <svg
              className="w-4 h-4 text-gray-600 hover:text-orange-500 transition-colors"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}

        <Image
          src={imageUrl || "/images/product/product.png"}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          style={{ objectFit: "cover" }}
          className="rounded-t-2xl"
        />
      </div>
      <div className="flex flex-col justify-between px-3 py-2 flex-grow">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-600 leading-snug line-clamp-2 h-[30px]">
            {description}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-orange-500 font-bold text-sm">${price}</span>
            {originalPrice && (
              <span className="text-gray-400 line-through text-xs">
                ${originalPrice}
              </span>
            )}
          </div>
          <div
            className={`cursor-pointer transition-transform duration-300 ${
              isAnimating ? "scale-125" : "scale-100"
            } ${bookmarked ? "text-orange-500" : "text-gray-400"}`}
            onClick={handleToggle}
          >
            {bookmarked ? (
              <FaBookmark size={16} />
            ) : (
              <FaRegBookmark size={16} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}