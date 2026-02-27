'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocationDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          router.push(`/listing-near-me?lat=${latitude}&lng=${longitude}`);
          setDropdownOpen(false);
        },
        (error) => {
          alert('Location access denied. Please allow location permission.');
          console.error(error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full lg:w-auto">
      {/* Main Button */}
      <div
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center w-full rounded-full h-[39px] bg-[#f2edef] px-4 py-2 cursor-pointer"
      >
        <svg className="text-gray-500 mr-2" width="20" height="20" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.1521 22.5561C3.90887 13.5052 2.75 12.5763 2.75 9.25C2.75 4.69364 6.44364 1 11 1C15.5564 1 19.25 4.69364 19.25 9.25C19.25 12.5763 18.0911 13.5052 11.8479 22.5561C11.4382 23.148 10.5618 23.1479 10.1521 22.5561ZM11 12.6875C12.8985 12.6875 14.4375 11.1485 14.4375 9.25C14.4375 7.35151 12.8985 5.8125 11 5.8125C9.10151 5.8125 7.5625 7.35151 7.5625 9.25C7.5625 11.1485 9.10151 12.6875 11 12.6875Z" fill="#EBE6E8" stroke="black" strokeWidth="1.5" />
        </svg>

        <span className="text-sm text-gray-700">Listing near me</span>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <ul className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-md border border-gray-200 z-20 text-sm text-gray-700 overflow-hidden">
          <li
            onClick={handleLocationClick}
            className="flex items-center gap-2 px-4 py-3 hover:bg-[#f2edef] cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5Z" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 4V2" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 12H2" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 20V22" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 12H22" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            Listing near me
         </li>
              <li
            className="flex items-center gap-2 px-4 py-3 hover:bg-[#f2edef] cursor-default"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.1926 21 19.7156 18.1332 20.7157 14.2529M12 21C7.80742 21 4.28442 18.1332 3.2843 14.2529M12 21C14.4853 21 16.5 16.9706 16.5 12C16.5 7.02944 14.4853 3 12 3M12 21C9.51472 21 7.5 16.9706 7.5 12C7.5 7.02944 9.51472 3 12 3M12 3C15.3652 3 18.299 4.84694 19.8431 7.58245M12 3C8.63481 3 5.70099 4.84694 4.15692 7.58245M19.8431 7.58245C17.7397 9.40039 14.9983 10.5 12 10.5C9.00172 10.5 6.26027 9.40039 4.15692 7.58245M19.8431 7.58245C20.5797 8.88743 21 10.3946 21 12C21 12.778 20.9013 13.5329 20.7157 14.2529M20.7157 14.2529C18.1334 15.6847 15.1619 16.5 12 16.5C8.8381 16.5 5.86662 15.6847 3.2843 14.2529M3.2843 14.2529C3.09871 13.5329 3 12.778 3 12C3 10.3946 3.42032 8.88743 4.15692 7.58245" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            All of Cambodia
          </li>   
        </ul>
      )}
    </div>
  );
}





