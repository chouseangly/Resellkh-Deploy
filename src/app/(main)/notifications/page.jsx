"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, BellOff } from "lucide-react"; 

import { encryptId } from "@/utils/encryption";
import { getProductIdByNotificationId } from "@/components/services/getProductIdByNotId.service";
import {
  fetchAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead, // ✨ Import the new service
  parseJwt,
  formatTimestamp,
} from "@/components/services/notification.service";

// Categorize notifications by time
const categorizeByTime = (notifications) => {
  const now = new Date();
  const today = [], lastWeek = [], older = [];

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    const diffInDays = Math.floor((now - notificationDate) / (1000 * 60 * 60 * 24));
    if (diffInDays < 1) today.push(notification);
    else if (diffInDays < 7) lastWeek.push(notification);
    else older.push(notification);
  });
  return { today, lastWeek, older };
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");
        setToken(token);

        const userData = parseJwt(token);
        const userId = userData?.userId || userData?.id;
        if (!userId) throw new Error("User ID not found in token.");

        const fetchedNotifications = await fetchAllNotifications(token, userId);

        const mappedNotifications = fetchedNotifications.map(
          (notification) => ({
            id: notification.id,
            type: notification.title,
            content: notification.content,
            avatar: notification.iconUrl,
            timestamp: formatTimestamp(notification.createdAt),
            unread: !notification.isRead,
            createdAt: notification.createdAt,
          })
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first

        setNotifications(mappedNotifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  // ✨ Dispatches event to update the navbar icon
  const dispatchNavbarUpdate = () => {
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const handleNotificationClick = async (notificationId) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);

    if (notification.unread) {
      const originalNotifications = [...notifications];
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
      );
      
      try {
        const token = localStorage.getItem("token");
        const userData = parseJwt(token);
        const userId = userData?.userId || userData?.id;
        if (!token || !userId) throw new Error("Authentication details are missing.");
        
        await markNotificationAsRead(token, userId, notificationId);
        dispatchNavbarUpdate(); // ✨ Notify navbar after successful API call
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        setNotifications(originalNotifications); // Revert UI on error
      }
    }
  };

  // ✨ NEW: Function to mark all notifications as read
 

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "all" ? true : n.unread
  );

  const { today, lastWeek, older } = categorizeByTime(filteredNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <section className="bg-slate-100 w-full px-[7%] min-h-screen py-8 sm:py-12">
      <div className="w-full mx-auto px-2">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-8 shadow-lg shadow-slate-200/50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Notifications
            </h1>
        
        
          </div>

          <NotificationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allCount={notifications.length}
            unreadCount={unreadCount}
          />

          <div className="mt-8">
            {loading ? (
              <NotificationLoadingState />
            ) : error ? (
              <NotificationErrorState error={{ message: error }} />
            ) : filteredNotifications.length === 0 ? (
              <NoNotificationsMessage activeTab={activeTab} />
            ) : (
              <>
                <NotificationSection
                  title="Today"
                  data={today}
                  onNotificationClick={handleNotificationClick}
                  expandedNotifications={expandedNotifications}
                  token={token}
                />
                <NotificationSection
                  title="Last Week"
                  data={lastWeek}
                  onNotificationClick={handleNotificationClick}
                  expandedNotifications={expandedNotifications}
                  token={token}
                />
                <NotificationSection
                  title="Earlier"
                  data={older}
                  onNotificationClick={handleNotificationClick}
                  expandedNotifications={expandedNotifications}
                  token={token}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Subcomponents (No changes needed, but included for completeness) ---

function NotificationTabs({ activeTab, setActiveTab, allCount, unreadCount }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5">
      {["all", "unread"].map((tab) => {
        const isActive = activeTab === tab;
        const count = tab === "all" ? allCount : unreadCount;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive ? "text-white" : "text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="active_pill"
                className="absolute inset-0 z-0 rounded-full bg-orange-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {tab === "all" ? "All" : "Unread"}
              <span className={`min-w-[24px] rounded-full px-1.5 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const NotificationItemSkeleton = () => (
  <div className="flex animate-pulse items-start gap-4 py-4">
    <div className="h-11 w-11 rounded-full bg-slate-200"></div>
    <div className="flex-1 space-y-3">
      <div className="h-4 w-1/3 rounded bg-slate-200"></div>
      <div className="h-3 w-full rounded bg-slate-200"></div>
      <div className="h-3 w-3/4 rounded bg-slate-200"></div>
    </div>
  </div>
);

const NotificationLoadingState = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => <NotificationItemSkeleton key={i} />)}
  </div>
);

function NotificationSection({ title, data, ...props }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Clock className="h-4 w-4" />
        {title}
      </h2>
      <div className="space-y-2">
        {data.map((item) => (
          <NotificationItem key={item.id} item={item} {...props} />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ item, expandedNotifications, onNotificationClick, token }) {
    const router = useRouter();
    const [isFetchingFavorite, setIsFetchingFavorite] = useState(false);
    const isExpanded = expandedNotifications.has(item.id);
    const shouldTruncate = item.content.length > 100;

    const handleViewFavoriteClick = async (e) => {
        e.stopPropagation();
        if (!token) return alert("Please log in to view products.");
        setIsFetchingFavorite(true);
        try {
            const productId = await getProductIdByNotificationId(item.id, token);
            if (productId) {
                router.push(`/product/${encodeURIComponent(encryptId(String(productId)))}`);
            } else {
                alert("The associated product could not be found.");
            }
        } catch (error) {
            alert(`Failed to load product: ${error.message}`);
        } finally {
            setIsFetchingFavorite(false);
        }
    };
    
  return (
    <div
      onClick={() => onNotificationClick(item.id)}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl p-4 transition-all duration-200 ${
        item.unread ? "bg-orange-50/80 hover:bg-orange-100/60" : "bg-white hover:bg-slate-50"
      }`}
    >
      {item.unread && <div className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-orange-500"></div>}
      <Image src={item.avatar || "/image-notifications.png"} alt="icon" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
            <h3 className="pr-4 font-semibold text-slate-800">{item.type}</h3>
            <span className="flex-shrink-0 text-xs text-slate-400">{item.timestamp}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {isExpanded ? item.content : `${item.content.substring(0, 100)}${shouldTruncate ? "..." : ""}`}
          {shouldTruncate && (
            <span
              className="ml-1 cursor-pointer font-medium text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                onNotificationClick(item.id);
              }}
            >
              {isExpanded ? " Show Less" : " Read More"}
            </span>
          )}
        </p>
        {item.type === "Favourite" && (
            <div className="mt-3">
                <button
                    onClick={handleViewFavoriteClick}
                    disabled={isFetchingFavorite}
                    className="rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-300/70 disabled:opacity-60"
                >
                    {isFetchingFavorite ? "Loading..." : "View Favorite Product"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

function NoNotificationsMessage({ activeTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BellOff className="h-16 w-16 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800">No notifications yet</h3>
      <p className="mt-1 text-sm text-slate-500">
        You have no {activeTab === 'unread' && 'unread'} notifications at the moment.
      </p>
    </div>
  );
}

function NotificationErrorState({ error }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-8 text-center text-red-700">
        <h3 className="font-bold">Something went wrong</h3>
        <p className="mt-1 text-sm text-red-600">{error.message || "An unknown error occurred."}</p>
    </div>
  );
}