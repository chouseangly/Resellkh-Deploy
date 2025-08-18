// src/components/services/getProductIdByNotId.service.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getProductIdByNotificationId = async (notificationId, token) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/getproductidbynotid/${notificationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorJson.message || "Unknown error"
          }`
        );
      } catch {
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorText || "Unknown error"
          }`
        );
      }
    }

    const data = await response.json();
    // FIX: Extract the product ID from the 'payload' property
    return data.payload;
  } catch (error) {
    console.error("Error fetching product ID by notification ID:", error);
    throw error;
  }
};