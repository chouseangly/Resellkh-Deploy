'use server';

import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Deletes a product image and revalidates the product detail page cache.
 * @param {object} params - The parameters for the action.
 * @param {string} params.productId - The ID of the product.
 * @param {string} params.fileUrl - The URL of the file to delete.
 * @param {string} params.productName - The URL-friendly name (slug) of the product.
 * @param {string} params.token - The user's authentication token.
 * @returns {Promise<{success: boolean, message: string}>} - The result of the operation.
 */
export async function deleteProductImageAction({ productId, fileUrl, productName, token }) {
    if (!productId || !fileUrl || !productName || !token) {
        return { success: false, message: 'Invalid arguments provided for deletion.' };
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/products/${productId}/files?fileUrl=${encodeURIComponent(fileUrl)}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete file from the backend.");
        }

        // After a successful backend deletion, revalidate the cached product page.
        // This ensures the gallery shows the updated media list.
        revalidatePath(`/(main)/product-detail/${productName}`, 'page');

        return { success: true, message: 'Media deleted successfully!' };

    } catch (error) {
        console.error("Delete product image action error:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}