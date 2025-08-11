const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Deletes a specific media item associated with a product.
 * @param {number} mediaId - The ID of the media file to delete.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<boolean>} - True if successful.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const deleteProductMedia = async (mediaId, token) => {
  // ✨ NOTE: The API endpoint might be different. 
  // A common pattern is /products/media/{mediaId}. Adjust if needed.
  const response = await fetch(`${API_BASE_URL}/products/media/${mediaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON responses
    throw new Error(errorData.message || 'File not found or could not be deleted');
  }

  return true; // Indicate success
};