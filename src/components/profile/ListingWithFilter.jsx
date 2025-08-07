// src/components/profile/ListingWithFilter.jsx
"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import Cart from "./someComponent/Cart";
import Image from "next/image";

const SkeletonCard = () => (
  <div className="w-full animate-pulse bg-gray-100 p-4 rounded-lg">
    <div className="aspect-square bg-gray-300 rounded-lg mb-3" />
    <div className="h-4 bg-gray-300 rounded-full w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded-full w-1/2 mb-1" />
    <div className="h-4 bg-gray-300 rounded-full w-1/3" />
  </div>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetcher function for useSWR that includes the auth token
const fetcher = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("User is not authenticated.");
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return Array.isArray(data.payload)
    ? data.payload.map((product) => ({
        ...product,
        fileUrls: Array.isArray(product.fileUrls)
          ? product.fileUrls.map((url) =>
              url.startsWith("http") ? url : `https://${url}`
            )
          : [],
      }))
    : [];
};


export default function ListingsWithFilter({ userId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");

  // Use SWR for data fetching
  const { data: products = [], error, isLoading } = useSWR(
    userId ? `${API_BASE_URL}/products/getproductbyuserid/${userId}` : null,
    fetcher
  );

  // Memoize the filtered and sorted products to avoid re-calculation on every render
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch =
        (p.productName &&
          p.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description &&
          p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCondition =
        !condition ||
        (p.condition &&
          p.condition.toLowerCase().trim() === condition.toLowerCase().trim());
      const matchesStatus =
        !status ||
        (p.productStatus &&
          p.productStatus.toLowerCase() === status.toLowerCase());

      return matchesSearch && matchesCondition && matchesStatus;
    });

    if (sortBy === "price-high") {
      filtered.sort((a, b) => b.productPrice - a.productPrice);
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => a.productPrice - b.productPrice);
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return filtered;
  }, [products, searchTerm, condition, status, sortBy]);


  if (isLoading) {
    return (
      <div className="p-2 md:p-6">
        <div className="p-4 rounded-2xl border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="h-8 w-40 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="h-10 bg-gray-200 rounded-full animate-pulse w-full sm:w-64" />
              <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 text-sm">Error: {error.message}</div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <div className="p-4 rounded-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Listings</h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-xs">
              <svg
                className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 25"
              >
                <path d="M18.02 17.4L22.3 21.68l-1.41 1.41-4.28-4.28a9 9 0 11 1.41-1.41zM11 20a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
              <input
                type="text"
                placeholder="Search Listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Filters
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white border rounded-2xl shadow-lg p-4 mb-4 space-y-4 md:w-full md:max-w-sm">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sort</p>
              <div className="space-y-1 text-sm">
                {[
                  { label: "Recent", value: "recent" }, // Explicit value for 'recent'
                  { label: "Price - High to Low", value: "price-high" },
                  { label: "Price - Low to High", value: "price-low" },
                ].map(({ label, value }) => (
                  <label key={value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value={value}
                      checked={sortBy === value}
                      onChange={() => setSortBy(value)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Item Condition
              </p>
              <div className="space-y-1 text-sm">
                {["Brand New", "Like New", "Lightly Used", "Well Used", "Heavily Used"].map((c) => (
                  <label key={c} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value={c}
                      checked={condition === c}
                      onChange={() => setCondition(c)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Listings status
              </p>
              <div className="space-y-1 text-sm">
                {["draft", "sold out", "on sale"].map((s) => (
                  <label key={s} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={() => setStatus(s)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>


            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setSortBy("recent"); // Reset to default sort
                  setCondition("");
                  setStatus("");
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="bg-orange-500 text-white text-sm px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Image
              src="/images/story set/no listings.jpg"
              alt="No Listings"
              className="w-48 sm:w-64 md:w-80 h-auto mb-6"
            />
            <p className="text-sm text-gray-600">
              No listings match your current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((item) => {
              const price =
                typeof item.productPrice === "number"
                  ? item.discountPercent
                    ? (item.productPrice * (100 - item.discountPercent)) / 100
                    : item.productPrice
                  : 0;

              const firstImageUrl =
                item.fileUrls?.[0] || "/images/default-product.png";

              return (
                <Cart
                  key={item.productId}
                  id={item.productId}
                  userId={item.userId} 
                  imageUrl={firstImageUrl}
                  title={item.productName}
                  description={item.description}
                  price={price.toFixed(2)}
                  originalPrice={
                    item.discountPercent ? item.productPrice.toFixed(2) : null
                  }
                  discountText={
                    item.discountPercent ? `${item.discountPercent}% OFF` : null
                  }
                  showEditButton={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
