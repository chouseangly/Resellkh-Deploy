'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaStar } from 'react-icons/fa';
import { encryptId } from '@/utils/encryption';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SellerInfo({ sellerId, ratingData }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getEncryptedId = (id) => {
    try {
      if (!id) return '';
      const encrypted = encryptId(id.toString());
      return encodeURIComponent(encrypted);
    } catch (error) {
      console.error('Encryption failed, using fallback:', error);
      return id;
    }
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    const encryptedId = getEncryptedId(sellerId);
    
    if (token) {
      router.push(`/profile/${encryptedId}`);
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    if (!sellerId) return;

    const fetchProfile = async () => {
      try {
        const tokenFromStorage = localStorage.getItem("token");
        const headers = {
          Accept: '*/*',
          ...(tokenFromStorage ? { Authorization: `Bearer ${tokenFromStorage}` } : {}),
        };

        const profileRes = await fetch(`${API_BASE_URL}/profile/${sellerId}`, { 
          method: 'GET', 
          headers 
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.payload || null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setUser(null);
      }
    };

    fetchProfile();
  }, [sellerId]);

  if (!user) {
    return <div className="text-gray-500">Loading seller info...</div>;
  }

  const rating = ratingData?.rating || 0;
  const reviewsCount = ratingData?.reviewsCount || 0;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <div className="bg-[#EBE6E8] rounded-xl p-6 shadow-sm">
      <div
        className="flex items-center space-x-3 mb-4 cursor-pointer"
        onClick={handleProfileClick}
      >
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          <Image
            src={user.profileImage || '/images/profile/profile.png'}
            alt="Seller"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{user.userName || 'Unknown Seller'}</h4>
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(rating) ? 'text-orange-500' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ms-4 mt-[2px]">{reviewsCount} reviews</span>
          </div>
        </div>
      </div>

      <div className="text-md text-t-black mb-4">
        <p>Tel: {token ? (user.phoneNumber || 'N/A') : '********'}</p>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          if (!user?.telegramUrl) return;
          const token = localStorage.getItem('token');
          token 
            ? window.open(user.telegramUrl, '_blank') 
            : router.push('/login');
        }}
        className="w-full bg-orange-500 text-white py-2 rounded-[50px] font-medium hover:bg-orange-600 transition-colors"
        disabled={!user.telegramUrl}
      >
        Telegram
      </button>
    </div>
  );
}