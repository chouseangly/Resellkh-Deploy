'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// ReviewFormModal component
export const ReviewFormModal = ({ isOpen, onClose, onSubmit, userId, token }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    avatar: '/default-avatar.png',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId || !token) return;

        const res = await fetch(`${API_BASE_URL}/profile/${userId}`, {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data?.payload) {
          const { firstName, lastName, profileImage } = data.payload;
          const fullName = `${firstName} ${lastName}`;
          const avatar = profileImage || '/images/profile/profile.png';

          setUserProfile({ name: fullName, avatar });
        } else {
          console.error('Failed to fetch profile:', data.message);
          setUserProfile({ name: 'User', avatar: '/images/profile/profile.png' });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setUserProfile({ name: 'User', avatar: '/images/profile/profile.png' });
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, userId, token]);

  const handleStarClick = (star) => setRating(star);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ score: rating, comment: reviewText });
    setRating(0);
    setReviewText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 mt-14 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto relative p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
            <Image
              src={userProfile.avatar}
              alt={`User avatar: ${userProfile.name}`}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{userProfile.name}</h4>
        
          </div>
        </div>

        {/* Stars */}
        <div className="flex space-x-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className="text-gray-300 hover:text-orange-500"
              aria-label={`Rate ${star} stars`}
              type="button"
            >
              <svg
                className={`w-8 h-8 ${rating >= star ? 'text-orange-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L.001 9.306l8.332-1.151L12 .587z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 text-base"
            rows="6"
            placeholder="Share your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-800 rounded-full hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
              disabled={rating === 0 || reviewText.trim() === ''}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};