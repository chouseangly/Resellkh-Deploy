import { productService } from '@/components/services/allProduct.service';
import { encryptId } from "@/utils/encryption";

const URL = "https://www.resellkh.shop";

export default async function sitemap() {
  // Initialize productUrls as an empty array.
  let productUrls = [];

  // --- Start of Fix ---
  // Wrap the API call in a try...catch block to handle potential errors.
  try {
    const productsResponse = await productService.fetchRecommendedProducts(0, 1000);
    const products = productsResponse.content || [];

    // This code will only run if the fetch is successful.
    productUrls = products.map((product) => {
      const encryptedId = encodeURIComponent(encryptId(product.productId.toString()));
      return {
        url: `${URL}/product/${encryptedId}`,
        lastModified: new Date(product.createdAt).toISOString(),
      };
    });
  } catch (error) {
    // If the API call fails, log the error for debugging but don't crash the sitemap.
    console.error("Sitemap: Failed to fetch products, but continuing with static URLs.", error);
    // On failure, productUrls remains an empty array, and the sitemap will still be valid.
  }
  // --- End of Fix ---

  // Add your static pages. These will always be included.
  const staticUrls = [
    { url: URL, lastModified: new Date().toISOString() },
    { url: `${URL}/login`, lastModified: new Date().toISOString() },
    { url: `${URL}/register`, lastModified: new Date().toISOString() },
  ];

  // Return the combined list of URLs.
  return [...staticUrls, ...productUrls];
}