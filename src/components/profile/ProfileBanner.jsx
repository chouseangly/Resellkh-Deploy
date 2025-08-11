"use client";

import { FaStar } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { encryptId } from "@/utils/encryption";

export default function ProfileBanner({ isOwner, user, rating = 0, reviewsCount = 0 }) {
  const { name, avatar, cover, id } = user || {};

  const getProfileUrl = (userId) => {
    try {
      if (!userId) return '/profile';
      const encryptedId = encryptId(userId.toString());
      return `/profile/${encodeURIComponent(encryptedId)}`;
    } catch (error) {
      console.error("Encryption failed:", error);
      return `/profile/${userId}`;
    }
  };

  return (
    <div className="relative w-full mb-12">
      {/* Cover Image */}
      <div
        className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-gray-100
                   md:h-[220px] lg:h-[280px]"
      >
     
          <Image
            src={cover || "/cover1.jpg"}
            alt="Cover"
            fill
            className="object-cover w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
          />
  
      </div>

      {/* Info Card */}
      <div
        className="absolute left-4 right-4 -bottom-5 h-[100px] bg-white rounded-xl shadow-md 
                   px-4 py-3 flex flex-row md:items-center md:justify-between 
                   gap-4 md:gap-0 z-10
                   sm:left-6 sm:right-6
                   md:h-[110px] lg:h-[120px]"
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div
            className="relative rounded-full overflow-hidden border-2 border-white
                       w-12 h-12 min-w-[48px] min-h-[48px] aspect-square
                       md:w-14 md:h-14"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt="User Avatar"
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600 md:text-xl">
                  {name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-black line-clamp-1 md:text-lg">
              {name || "User"}
            </h2>
            <Link
              href={getProfileUrl(id)}
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors md:text-base line-clamp-1"
            >
              Profile Detail &gt;
            </Link>
          </div>
        </div>

        {/* Rating + Edit Button */}
        <div className="flex flex-row items-center gap-4 md:gap-6 justify-end min-w-[80px] md:min-w-[140px]">
          {/* Rating block hidden on small screens */}
          <div className="hidden md:block text-right">
            {reviewsCount > 0 ? (
              <>
                <p className="text-sm font-medium text-gray-800 flex items-center justify-end gap-1 md:text-base">
                  {rating.toFixed(1)}
                  <FaStar className="w-3.5 h-3.5 text-orange-500 md:w-4 md:h-4" />
                </p>
                <p className="text-xs text-gray-500 md:text-sm">
                  {reviewsCount} review{reviewsCount !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-800 md:text-base">No ratings</p>
                <p className="text-xs text-gray-500 md:text-sm">Not rated yet</p>
              </>
            )}
          </div>

          {isOwner && (
            <Link
              href="/profile/edit-profile"
              className="border border-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-100 
                         transition-colors whitespace-nowrap md:px-4 md:py-1.5 md:text-base"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
