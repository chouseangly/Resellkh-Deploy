import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/components/services/getProduct.service';
import { decryptId } from '@/utils/encryption';
import ProductPageClient from './ProductPageClient';


export async function generateMetadata({ params }) {
  const encryptedProductId = params?.productId;
  if (!encryptedProductId) {
    return { title: "Invalid Product" };
  }

  let productId;
  try {
    productId = decryptId(decodeURIComponent(encryptedProductId));
  } catch (err) {
    return { title: "Invalid Product" };
  }

  const product = await getProductById(productId);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // Dynamically create metadata based on the product
  return {
    title: product.productName,
    description: product.description,
    openGraph: {
      title: `${product.productName} on ResellKH`,
      description: product.description,
      images: [
        {
          url: product.fileUrls?.[0] || '/og-image.jpg', // Use the first product image
          width: 800,
          height: 600,
          alt: product.productName,
        },
      ],
      type: 'article',
    },
  };
}
// A skeleton loader to show while the page is being generated on the server.
const LoadingSkeleton = () => (
  <div className="mx-auto px-4 sm:px-6 lg:px-20 py-6 bg-white max-w-screen-2xl animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-10">
      <div className="bg-gray-200 rounded-lg h-96"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default async function ProductPage({ params }) {
  const encryptedProductId = params?.productId;

  if (!encryptedProductId) {
    notFound(); // Use Next.js notFound for invalid routes
  }

  let productId;
  try {
    const decoded = decodeURIComponent(encryptedProductId);
    productId = decryptId(decoded);
  } catch (err) {
    console.error("Failed to decrypt product ID:", err);
    notFound();
  }

  if (!productId || isNaN(Number(productId))) {
    notFound();
  }

  let productData;
  try {
    // Fetch the product data on the server
    productData = await getProductById(productId);
    if (!productData) {
      // If the service returns null/undefined for a valid ID
      notFound();
    }
  } catch (error) {
    console.error("API error fetching product:", error);
    // You could render a specific error page here if desired
    return <div className="text-center py-20 text-red-500">Could not load the product. Please try again later.</div>;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {/* Pass the server-fetched data as a prop to the client component */}
      <ProductPageClient productData={productData} />
    </Suspense>
  );
}
