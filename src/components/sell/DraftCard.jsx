'use client';

import { useState } from 'react'; // Import useState
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DraftCard({ draft, onDelete, token }) {
  // State to control the visibility of the confirmation popup
  const [showPopup, setShowPopup] = useState(false);

  const imageUrl = draft.fileUrls?.[0] || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';
  const draftId = draft.draftId ?? null;
  const userId = draft.userId ?? null;

  const handleImageError = (e) => {
    e.target.src = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';
    console.error('Failed to load image:', imageUrl, e);
  };

  // This function now just opens the confirmation dialog
  const handleDeleteClick = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  // This function contains the actual deletion logic
  const confirmDeleteHandler = async () => {
    if (!draftId || !userId) return;

    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      setShowPopup(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/${draftId}/user/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        console.warn('Invalid JSON response from server:', text);
        data = { message: "An unexpected response was received from the server." };
      }

      if (res.ok && data?.payload === true) {
        toast.success('Draft deleted successfully');
        if (typeof onDelete === 'function') onDelete(draftId);
      } else {
        toast.error(data?.message || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong while trying to delete the draft.');
    } finally {
      // Close the popup regardless of outcome
      setShowPopup(false);
    }
  };

  const cancelDelete = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white flex flex-col">
        {/* Delete Button - now opens the popup */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow"
          title="Delete draft"
        >
          <FiX className="w-5 h-5 text-gray-600" />
        </button>

        {/* Draft Thumbnail Link */}
        {draftId ? (
          <Link
            href={`/sell/new?draftId=${draftId}`}
            className="relative w-full aspect-[4/5] h-[230px] rounded-t-2xl overflow-hidden"
          >
            <Image
              src={imageUrl || "/images/product/product.png"}
              alt={draft.productName || 'Draft Image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 260px"
              priority
              unoptimized
              onError={handleImageError}
            />
          </Link>
        ) : (
          <div className="relative w-full aspect-[4/5] h-[230px] rounded-t-2xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
            No draft link
          </div>
        )}

        {/* Draft Title */}
        <div className="px-4 py-2 text-center text-gray-700 font-medium truncate">
          {draft.productName || 'Draft'}
        </div>
      </div>

      {/* Confirmation Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={cancelDelete} // Close popup if background is clicked
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center"
            onClick={(e) => e.stopPropagation()} // Prevent click inside from closing popup
          >
            <p className="text-lg font-medium mb-4">
              Are you sure you want to delete this draft?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDeleteHandler}
                className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Yes
              </button>
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}