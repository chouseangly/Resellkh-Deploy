'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { ReviewFormModal } from "@/components/product/ReviewFormModal";
import { useRouter } from "next/navigation";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const SkeletonCard = () => (
  <div className="flex space-x-4 pb-6 animate-pulse">
    <div className="w-12 h-12 bg-gray-300 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-full" />
    </div>
  </div>
);

export default function Reviews({ sellerId }) {
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    if (!sellerId) {
      setError("No sellerId provided");
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/ratings/${sellerId}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (data?.payload) {
          const mappedReviews = data.payload.map((r) => ({
            name: r.reviewerName || "User",
            date: new Date(r.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            rating: r.score || 0,
            comment: r.comment || "",
            userAvatar: r.reviewerAvatar,
          }));

          setReviews(mappedReviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sellerId, token]);

  const handleReviewSubmit = async ({ score, comment }) => {
    try {
      if (!token || !userId) {
        alert("You must be logged in to submit a review.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ratedUserId: parseInt(sellerId),
          ratingUserId: parseInt(userId),
          score,
          comment,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      const result = await res.json();

      const newReview = {
        name: result.payload.reviewerName || "User",
        date: new Date(result.payload.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        rating: result.payload.score || 0,
        comment: result.payload.comment || "",
        userAvatar: result.payload.reviewerAvatar || "/images/profile/profile.png",
      };

      setReviews((prev) => [newReview, ...prev]);
      setShowAll(true);
    } catch (error) {
      console.error(error);
      alert("Error submitting review");
    }
  };

  const onWriteReviewClick = () => {
    if (token && userId) {
      setIsModalOpen(true);
    } else {
      router.push("/login");
    }
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm w-full">
      {/* Header */}
      <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-12 mb-6">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mt-2">Reviews for Seller</h3>
        <button
          onClick={onWriteReviewClick}
          className="bg-orange-500 text-white px-4 py-2 sm:px-5 rounded-full text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
        >
          comment
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path
              d="M3.94 12.036C3.707 12.66 3.51 13.236 3.334 13.819C4.294 13.122 5.435 12.68 6.752 12.515C9.265 12.201 11.498 10.542 12.628 8.457L11.172 7.002L12.585 5.587L13.585 4.586C14.015 4.156 14.5 3.362 15.013 2.218C9.42 3.085 5.996 6.51 3.94 12.036ZM14 7.001L15 8C14 11 11 14 7 14.5C4.331 14.834 2.664 16.667 1.998 20H0C1 14 3 0 18 0C17 2.997 16.002 4.996 15.003 5.997L14 7.001Z"
              fill="white"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, idx) => <SkeletonCard key={idx} />)}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : !reviews.length ? (
        <div className="p-4 text-center text-gray-500">No reviews yet.</div>
      ) : (
        <>
          <div className="space-y-6">
            {visibleReviews.map((review, index) => (
              <div key={index} className="flex space-x-4 pb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={review.userAvatar}
                    alt={review.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex text-sm">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < Math.round(review.rating)
                                ? "text-orange-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toggle button */}
          {reviews.length > 3 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-gray-900 hover:text-orange-500 transition text-sm font-medium"
              >
                {showAll ? "Show less reviews" : "Read all reviews >"}
              </button>
            </div>
          )}
        </>
      )}

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
        userId={userId}
        token={token}
      />
    </div>
  );
}
