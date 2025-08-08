// services/notification.service.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchAllNotifications = async (token, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/all/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to fetch'}`);
    }

    const data = await response.json();
    return data.payload || [];
  } catch (error) {
    console.error("Error in fetchAllNotifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (token, userId, notificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read/${userId}/${notificationId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to update'}`);
    }

    // ✅ FIX: The backend now returns JSON, so we can parse it directly.
    return await response.json();
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    throw error;
  }
};

// ✨ NEW FUNCTION ADDED ✨
export const markAllNotificationsAsRead = async (token, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to update all'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    throw error;
  }
};

export const getProductIdByNotificationId = async (notificationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/getproductidbynotid/${notificationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Failed to get product ID'}`);
    }

    const data = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Error fetching product ID by notification ID:", error);
    throw error;
  }
};

// --- UTILITY FUNCTIONS ---

export const parseJwt = (token) => {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
};

export const formatTimestamp = (timestamp) => {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInMs = now - notificationDate;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return "Just Now";
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return notificationDate.toLocaleDateString();
};