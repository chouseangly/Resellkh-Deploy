

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DraftCard({ draft, onDelete, token }) {
  const router = useRouter();

  const imageUrl = draft.fileUrls?.[0] || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'; 
  const draftId = draft.draftId ?? null;
  const userId = draft.userId ?? null;

  const handleImageError = (e) => {
    e.target.src = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'; 
    console.error('Failed to load image:', imageUrl, e);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!draftId || !userId) return;

    if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this draft?');
    if (!confirmDelete) return;

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
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white flex flex-col">
      {/* Delete Button */}
      <button
        onClick={handleDelete}
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
            src={imageUrl}
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
  );
}