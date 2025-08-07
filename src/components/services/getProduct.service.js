const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getProductById = async (productId) => {
  try {
    // The 'fetch' call is now enhanced with Next.js caching options.
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // FIX: Add caching configuration.
      // This tells Next.js to cache the result of this fetch for 3600 seconds (1 hour).
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.payload; // directly return the product object
  } catch (error) {
    console.error('Error in getProduct service:', error);
    throw error;
  }
};
