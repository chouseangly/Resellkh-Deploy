const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const productService = {
  fetchRecommendedProducts: async (page = 0, size = 15) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}&size=${size}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `Failed to fetch: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      // The backend response for paginated products is in `data.payload`
      // The backend already sorts by newest first. No client-side sorting is needed.
      return data.payload;

    } catch (error) {
      console.error("Error fetching products:", error.message);
      // Re-throw the error so SWR can handle it
      throw error;
    }
  },
};