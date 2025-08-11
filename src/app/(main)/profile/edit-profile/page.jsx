"use client";

import { useEffect, useState } from "react";
import EditProfilePage from "@/components/profile/EditProfilePage";

// 1. Create a Skeleton Component
// This component mimics the basic layout of your edit profile page.
const EditProfileSkeleton = () => {
  return (
    <div className="container mx-auto p-4 max-w-2xl animate-pulse">
      {/* Skeleton for Header/Avatar Section */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Skeleton for Form Fields */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-24 w-full bg-gray-300 rounded-md"></div>
        </div>
        <div className="h-12 w-1/3 bg-gray-300 rounded-md ml-auto"></div>
      </div>
    </div>
  );
};

// 2. Update the Wrapper to use the Skeleton
export default function EditProfileWrapper() {
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small delay for auth check to make skeleton visible
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        setSellerId(userId);
      }

      setLoading(false);
    }, 500); // 0.5 second delay

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  // Use the new skeleton component while loading
  if (loading) return <EditProfileSkeleton />;

  if (!sellerId) {
    return (
      <p className="text-center py-10 text-red-500">
        Please login to view this page
      </p>
    );
  }

  return <EditProfilePage sellerId={sellerId} />;
}