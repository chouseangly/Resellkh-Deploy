'use client'
import { useState, useEffect, useRef } from "react";
import LocationDropdown from "./navbar/LocationDropdown";
import SearchBar from "./navbar/SearchBar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import ImageScanModal from "./navbar/ImageScanModal";
import ConfirmLogout from "./navbar/Confirmlogout";
import { encryptId } from "@/utils/encryption";
import { Heart, Bell, Menu, X, ChevronDown, Search } from "lucide-react";
// Make sure this path is correct for your project structure
import {fetchAllNotifications} from "../services/notification.service"
import { fetchUserProfile } from "../services/userprofile.service";

export default function AuthNavbar() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);
  const desktopCategoryRef = useRef(null);
  const mobileCategoryRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const isSigningOut = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const DEFAULT_AVATAR_URL = "/images/profile/profile.png";


  const categoryMap = {
    accessories: 1, beauty: 2, equipment_bag_shoes: 3, book: 4, fashion: 5,
    home: 6, sports_kids: 7, electronic: 8, vehicle: 9, other: 10,
  };

  const topCategories = [
    { name: "Fashion", key: "fashion" },
    { name: "Accessories", key: "accessories" },
    { name: "Equipment", key: "equipment_bag_shoes" },
    { name: "Beauty", key: "beauty", showOn: "lg" },
    { name: "Book", key: "book", showOn: "lg" },
  ];

  const dropdownCategories = [
    { name: "Home", key: "home" },
    { name: "Sports & Kids", key: "sports_kids" },
    { name: "Electronic", key: "electronic" },
    { name: "Vehicle", key: "vehicle" },
    { name: "Other", key: "other" },
  ];
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const loadUser = async () => {
      if (status === "authenticated" && session?.user?.id && session?.accessToken) {
        try {
          const userId = session.user.id;
          const token = session.accessToken;
          const profileData = await fetchUserProfile(userId, token);
          
          setUser({
            id: profileData.userId,
            name: `${profileData.firstName || ""} ${profileData.lastName || ""}`,
            avatar: profileData.profileImage,
          });
          
          localStorage.setItem("token", token);
          localStorage.setItem("userId", String(session.user.id));
        } catch (err) {
          console.error("Failed to load user profile:", err);
          signOut();
        }
      } else if (status === "unauthenticated") {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    };

    loadUser();
  }, [session, status]);
  
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      setUser(updatedUser);
    };
  
    window.addEventListener('profile-updated', handleProfileUpdate);
  
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);
  
  const handleAuthError = () => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    console.warn("Session expired. Signing out.");
    localStorage.clear();
    signOut({ callbackUrl: "/login?session_expired=true" });
  };
  
  const checkUnread = async () => {
    // Prevent check if session or user is not ready
    if (!session?.accessToken || !user?.id) return;

    try {
      const allNotifications = await fetchAllNotifications(session.accessToken, user.id);
      if (allNotifications) {
        const unreadExists = allNotifications.some(n => !n.isRead);
        setHasUnread(unreadExists);
      }
    } catch (err) {
      console.error('Error checking unread notifications:', err);
      if (err.status === 401) {
        handleAuthError();
      }
    }
  };

  // Run the check when the user/session first loads
  useEffect(() => {
    if (user && session) {
        isSigningOut.current = false;
        checkUnread();
    } else {
        setHasUnread(false);
    }
  }, [user, session]);


  // ✨ THIS IS THE MISSING PIECE ✨
  // This effect listens for the update event from the notifications page.
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      console.log("Navbar heard that notifications were updated. Re-checking status...");
      checkUnread();
    };

    // Listen for the custom event
    window.addEventListener('notifications-updated', handleNotificationsUpdate);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdate);
    };
  }, [user, session]); // Dependencies ensure `checkUnread` has the latest data
  // ✨ END OF THE FIX ✨


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (
        desktopCategoryRef.current && !desktopCategoryRef.current.contains(event.target) &&
        mobileCategoryRef.current && !mobileCategoryRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target) &&
          !event.target.closest('.search-toggle-button')) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    setProfileOpen(false);
    setCategoryOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    signOut({ callbackUrl: "/" });
  };

  const handleSellClick = () => {
    if (user) {
      router.push("/sell");
    } else {
      router.push("/login");
    }
  };

  const getEncryptedProfileId = (id) => {
    try {
      if (!id) return "";
      return encodeURIComponent(encryptId(id.toString()));
    } catch (error) {
      console.error("Profile ID encryption failed:", error);
      return "";
    }
  };

  return (
    <div className="w-full sticky top-0 z-[200] bg-white shadow-sm">
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Image
                  src="/images/auth/logo1.png"
                  alt="ResellKH Logo"
                  className="h-12 w-auto"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center mt-2 space-x-1 lg:space-x-2 ">
            {topCategories.map((cat) => (
              <Link
                key={cat.key}
                href={`/category/${categoryMap[cat.key]}`}
                className={`px-3  rounded-lg text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors ${
                  cat.showOn === "lg" ? "hidden lg:block" : ""
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <div className="relative" ref={desktopCategoryRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center px-3  rounded-lg text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  categoryOpen ? "rotate-180" : ""
                }`} />
              </button>
              {categoryOpen && (
                <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  {dropdownCategories.map((cat) => (
                    <Link
                      key={cat.key}
                      href={`/category/${categoryMap[cat.key]}`}
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2 mt-2 ">
            {!user ? (
              <>
                <Link href="/register" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                  Register
                </Link>
                <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                  Login
                </Link>
                <button
                  onClick={handleSellClick}
                  className="ml-2 px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
                >
                  Sell
                </button>
              </>
            ) : (
              <>
                <Link href="/favourites" className="p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-orange-500 transition-colors">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-0"><path d="M3 3C3 2.20435 3.31607 1.44129 3.87868 0.87868C4.44129 0.316071 5.20435 0 6 0L18 0C18.7956 0 19.5587 0.316071 20.1213 0.87868C20.6839 1.44129 21 2.20435 21 3V23.25C20.9999 23.3857 20.9631 23.5188 20.8933 23.6351C20.8236 23.7515 20.7236 23.8468 20.604 23.9108C20.4844 23.9748 20.3497 24.0052 20.2142 23.9988C20.0787 23.9923 19.9474 23.9492 19.8345 23.874L12 19.6515L4.1655 23.874C4.05256 23.9492 3.92135 23.9923 3.78584 23.9988C3.65033 24.0052 3.5156 23.9748 3.396 23.9108C3.2764 23.8468 3.17641 23.7515 3.10667 23.6351C3.03694 23.5188 3.00007 23.3857 3 23.25V3ZM6 1.5C5.60218 1.5 5.22064 1.65804 4.93934 1.93934C4.65804 2.22064 4.5 2.60218 4.5 3V21.849L11.5845 18.126C11.7076 18.0441 11.8521 18.0004 12 18.0004C12.1479 18.0004 12.2924 18.0441 12.4155 18.126L19.5 21.849V3C19.5 2.60218 19.342 2.22064 19.0607 1.93934C18.7794 1.65804 18.3978 1.5 18 1.5H6Z" fill="black" /></svg>
                </Link>

                <Link href="/notifications" className="p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-orange-500 transition-colors relative">
                  <svg className="w-6 h-6 stroke-[1.5] stroke-gray-900 mr-0" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0243 3.63745C10.8868 3.63745 7.52426 6.99995 7.52426 11.1375V14.75C7.52426 15.5125 7.19926 16.6749 6.81176 17.3249L5.37426 19.7125C4.48676 21.1875 5.09926 22.825 6.72426 23.375C12.1118 25.175 17.9243 25.175 23.3118 23.375C24.8243 22.875 25.4868 21.0875 24.6618 19.7125L23.2243 17.3249C22.8493 16.6749 22.5243 15.5125 22.5243 14.75V11.1375C22.5243 7.01245 19.1493 3.63745 15.0243 3.63745Z" /><path d="M17.3379 4.00005C16.9504 3.88755 16.5504 3.80005 16.1379 3.75005C14.9379 3.60005 13.7879 3.68755 12.7129 4.00005C13.0754 3.07505 13.9754 2.42505 15.0254 2.42505C16.0754 2.42505 16.9754 3.07505 17.3379 4.00005Z" /><path d="M18.7754 23.825C18.7754 25.8875 17.0879 27.575 15.0254 27.575C14.0004 27.575 13.0504 27.15 12.3754 26.475C11.7004 25.8 11.2754 24.85 11.2754 23.825" /></svg>
                  {hasUnread && (
                    <span className="absolute top-1 left-6 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>

                <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-1 p-1 rounded-full w-full h-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full border-2 border-gray-200 hover:border-orange-300 transition-colors bg-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={user.avatar || DEFAULT_AVATAR_URL}
                      alt="User Avatar"
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                      }}
                    />
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                    <Link href={`/profile/${getEncryptedProfileId(user.id)}`} className="cursor-pointer">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full border bg-gray-100 overflow-hidden">
                          <Image
                            src={user.avatar}
                            alt="User Avatar"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_AVATAR_URL;
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">View profile</p>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full px-4 py-3 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-[1.5] stroke-gray-900"
                      >
                        <path d="M8.89844 7.56023C9.20844 3.96023 11.0584 2.49023 15.1084 2.49023H15.2384C19.7084 2.49023 21.4984 4.28023 21.4984 8.75023V15.2702C21.4984 19.7402 19.7084 21.5302 15.2384 21.5302H15.1084C11.0884 21.5302 9.23844 20.0802 8.90844 16.5402" />
                        <path d="M15.0011 12H3.62109" />
                        <path d="M5.85 8.65039L2.5 12.0004L5.85 15.3504" />
                      </svg>
                      <span className="ps-2">Log out</span>
                    </button>
                  </div>
                )}
              </div>
                <button
                  onClick={handleSellClick}
                  className="ml-2 px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
                >
                  Sell
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu & Search Buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => {
                setMobileSearchOpen(prev => !prev);
                setMobileMenuOpen(false);
              }}
              className="search-toggle-button p-2 rounded-md text-gray-700 hover:text-orange-500 focus:outline-none"
            >
              <Search className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(prev => !prev);
                setMobileSearchOpen(false);
              }}
              className="p-2 rounded-md text-gray-700 hover:text-orange-500 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef} 
          className="md:hidden bg-white border-b border-gray-200 shadow-lg"
        >
          <div className="px-4 py-3 space-y-4">
            {user ? (
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                {/* ✨ FIX IS HERE ✨ */}
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                    }}
                  />
                </div>
                {/* ✨ END OF FIX ✨ */}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <Link 
                    href={`/profile/${getEncryptedProfileId(user.id)}`} 
                    className="text-xs text-orange-500 hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {[...topCategories, ...dropdownCategories].map((cat) => (
                <Link
                  key={cat.key}
                  href={`/category/${categoryMap[cat.key]}`}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {user && (
              <div className="space-y-1">
                <Link
                  href="/favourites"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M3 3C3 2.20435 3.31607 1.44129 3.87868 0.87868C4.44129 0.316071 5.20435 0 6 0L18 0C18.7956 0 19.5587 0.316071 20.1213 0.87868C20.6839 1.44129 21 2.20435 21 3V23.25C20.9999 23.3857 20.9631 23.5188 20.8933 23.6351C20.8236 23.7515 20.7236 23.8468 20.604 23.9108C20.4844 23.9748 20.3497 24.0052 20.2142 23.9988C20.0787 23.9923 19.9474 23.9492 19.8345 23.874L12 19.6515L4.1655 23.874C4.05256 23.9492 3.92135 23.9923 3.78584 23.9988C3.65033 24.0052 3.5156 23.9748 3.396 23.9108C3.2764 23.8468 3.17641 23.7515 3.10667 23.6351C3.03694 23.5188 3.00007 23.3857 3 23.25V3ZM6 1.5C5.60218 1.5 5.22064 1.65804 4.93934 1.93934C4.65804 2.22064 4.5 2.60218 4.5 3V21.849L11.5845 18.126C11.7076 18.0441 11.8521 18.0004 12 18.0004C12.1479 18.0004 12.2924 18.0441 12.4155 18.126L19.5 21.849V3C19.5 2.60218 19.342 2.22064 19.0607 1.93934C18.7794 1.65804 18.3978 1.5 18 1.5H6Z" fill="black" /></svg>
                  Favorites
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-6 h-6 stroke-[1.5] stroke-gray-900 mr-2" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0243 3.63745C10.8868 3.63745 7.52426 6.99995 7.52426 11.1375V14.75C7.52426 15.5125 7.19926 16.6749 6.81176 17.3249L5.37426 19.7125C4.48676 21.1875 5.09926 22.825 6.72426 23.375C12.1118 25.175 17.9243 25.175 23.3118 23.375C24.8243 22.875 25.4868 21.0875 24.6618 19.7125L23.2243 17.3249C22.8493 16.6749 22.5243 15.5125 22.5243 14.75V11.1375C22.5243 7.01245 19.1493 3.63745 15.0243 3.63745Z" /><path d="M17.3379 4.00005C16.9504 3.88755 16.5504 3.80005 16.1379 3.75005C14.9379 3.60005 13.7879 3.68755 12.7129 4.00005C13.0754 3.07505 13.9754 2.42505 15.0254 2.42505C16.0754 2.42505 16.9754 3.07505 17.3379 4.00005Z" /><path d="M18.7754 23.825C18.7754 25.8875 17.0879 27.575 15.0254 27.575C14.0004 27.575 13.0504 27.15 12.3754 26.475C11.7004 25.8 11.2754 24.85 11.2754 23.825" /></svg>
                  Notifications
                  {hasUnread && <span className="ml-auto  h-2 w-2 bg-red-500 rounded-full"></span>}
                </Link>
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[1.5] stroke-gray-900 mr-2"><path d="M8.89844 7.56023C9.20844 3.96023 11.0584 2.49023 15.1084 2.49023H15.2384C19.7084 2.49023 21.4984 4.28023 21.4984 8.75023V15.2702C21.4984 19.7402 19.7084 21.5302 15.2384 21.5302H15.1084C11.0884 21.5302 9.23844 20.0802 8.90844 16.5402" /><path d="M15.0011 12H3.62109" /><path d="M5.85 8.65039L2.5 12.0004L5.85 15.3504" /></svg>
                  Log out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                handleSellClick();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Sell
            </button>
          </div>
        </div>
      )}

      {/* Search and Location Row */}
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        {/* Desktop Search and Location */}
        <div className="hidden md:flex gap-3 w-full">
          <div className="w-[70%]">
            <SearchBar />
          </div>
          <div className="w-[30%]">
            <LocationDropdown />
          </div>
        </div>
      </div>
      
      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div 
          ref={mobileSearchRef} 
          className="md:hidden px-4 sm:px-6 pb-4 bg-white border-t border-gray-100 w-full shadow-lg"
          style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50 }}
        >
          <div className="space-y-12 pt-3">
            <div className="relative z-20">
              <SearchBar />
            </div>
            <div className="relative z-10">
              <LocationDropdown />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Category Dropdown */}
      {categoryOpen && (
        <div className="absolute z-40 w-full left-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
          <div className="grid grid-cols-2 gap-1 p-2">
            {[...topCategories, ...dropdownCategories].map((cat) => (
              <Link 
                key={cat.key} 
                href={`/category/${categoryMap[cat.key]}`} 
                className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                onClick={() => setCategoryOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ImageScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
      <ConfirmLogout
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Are you sure that you want to log out?"
      />
    </div>
  );
}