"use client";

import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import Image from "next/image";

const ReviewsSection = ({ setActiveTab, sellerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false); // --- 1. Add loadingMore state ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/ratings/${sellerId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch reviews");

        const data = await response.json();
        setReviews(data.payload || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [sellerId]);

  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
  });

  // --- 2. Update the handleViewMore function ---
  const handleViewMore = () => {
    setLoadingMore(true);
    // Simulate a delay for fetching more reviews
    setTimeout(() => {
      setVisibleCount((prev) => prev + 3);
      setLoadingMore(false);
    }, 500); // 500ms delay
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
        ).toFixed(2)
      : 0;

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white p-4 rounded-[24px] border border-gray-200 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4 pb-6">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white p-4 rounded-[24px] border border-gray-200">
          <div className="text-red-500 text-center py-6">
            Error loading reviews: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 md:p-6">
      <div className="bg-white p-4 rounded-[24px] border border-gray-200">
        <div
          className={`${
            sortOrder === "Newest" ? "flex-row" : "flex-col"
          } flex sm:flex-row md:flex-row justify-between items-start md:items-center mb-6 pb-4 ${
            reviews.length > 0 ? "border-b border-gray-300" : ""
          }`}
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex flex-col items-start gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(averageRating)
                          ? "text-orange-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {reviews.length} reviews
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="relative mt-4 md:mt-0">
              <span className="absolute -top-2 right-7 bg-white px-1 text-[10px] text-gray-500 font-medium">
                Sort by
              </span>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-between w-[100px] px-3 py-2 border border-gray-300 rounded-full bg-white shadow-sm text-sm text-gray-800"
              >
                {sortOrder}
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.7267 8.18335C18.0298 8.55495 18.0082 9.10243 17.6617 9.44929L12.3062 14.8044C12.1267 14.984 11.8866 15.0811 11.6374 15.0811C11.3882 15.0811 11.1485 14.9841 10.9683 14.8044L5.61305 9.44918C5.24357 9.07926 5.24357 8.48048 5.61305 8.11153C5.98265 7.74149 6.58159 7.74149 6.951 8.11142L11.6374 12.7975L16.3238 8.11153C16.6703 7.76463 17.2183 7.74293 17.5899 8.04645L17.6618 8.11149L17.7267 8.18335Z"
                    fill="#343A40"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-[100px] rounded-xl border border-gray-200 bg-white shadow-md z-10 overflow-hidden">
                  <ul className="py-1">
                    {["Newest", "Oldest"].map((option) => (
                      <li
                        key={option}
                        onClick={() => {
                          setSortOrder(option);
                          setIsOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                          sortOrder === option
                            ? "font-medium text-black"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <img
              src="/images/story set/amico.jpg"
              alt="No reviews"
              className="w-[300px] h-auto mb-4"
            />
            <p className="text-sm font-medium text-gray-800 mb-1">
              <span className="font-semibold">@leackhena12_Q</span> has no
              reviews yet.
            </p>
            <p className="text-sm text-gray-500 max-w-xs">
              Reviews are given when a buyer or seller completes a deal. Contact{" "}
              <span className="font-medium text-gray-700">
                @leackhena12_Q
              </span>{" "}
              to find out more!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {sortedReviews.slice(0, visibleCount).map((review) => (
                <div key={review.ratingId} className="flex space-x-4 pb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {review.reviewerAvatar ? (
                      <Image
                        src={review.reviewerAvatar}
                        alt={review.reviewerName || "Anonymous"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-white bg-gray-400">
                        {(review.reviewerName || "A").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {review.reviewerName || "Anonymous"}
                      </h4>
                      <div className="flex items-center space-x-5 mt-1">
                        <div className="flex text-sm">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.score
                                  ? "text-orange-500"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* --- 3. Update the button's JSX --- */}
            {visibleCount < sortedReviews.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleViewMore}
                  disabled={loadingMore} // Disable button when loading
                  className="bg-orange-500 hover:bg-orange-600 text-white text-md font-medium px-4 py-2 rounded-full transition-colors duration-200 flex items-center justify-center w-32"
                >
                  {loadingMore ? (
                     <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Loading...
                    </>
                  ) : (
                    "View more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;