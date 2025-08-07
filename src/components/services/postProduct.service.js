const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const postProduct = async (productData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    // 1. Create a single FormData object for all data.
    const formData = new FormData();

    // 2. Append all text fields to the FormData object.
    // Your Spring Boot controller expects these as individual parts.
    formData.append("productName", productData.productName);
    formData.append("userId", productData.userId);
    formData.append("mainCategoryId", productData.mainCategoryId);
    formData.append("productPrice", productData.productPrice);
    formData.append("discountPercent", productData.discountPercent || 0);
    formData.append("productStatus", productData.productStatus || "ON SALE");
    formData.append("description", productData.description || "");
    formData.append("location", productData.location || "");
    formData.append("latitude", productData.latitude || 0);
    formData.append("longitude", productData.longitude || 0);
    formData.append("condition", productData.condition || "");
    formData.append("telegramUrl", productData.telegramUrl || "");

    // 3. Append the files. The key 'files' must match your @RequestPart("files") annotation in the backend.
    if (productData.files && productData.files.length > 0) {
      productData.files.forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file);
        }
      });
    }

    // 4. Make the POST request with the FormData as the body.
    // The browser will automatically set the correct 'Content-Type: multipart/form-data'.
    const response = await fetch(`${API_BASE_URL}/products/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // DO NOT set Content-Type here; the browser handles it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload Error:", error.message);
    throw error;
  }
};