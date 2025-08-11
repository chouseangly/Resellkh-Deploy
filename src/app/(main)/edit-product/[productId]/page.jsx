'use client';

import { useState, useEffect, useMemo, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EditPhotoUploader from "@/components/sell/editPhotoUpload";
import CategorySelector from "@/components/sell/CategorySelector";
import ConditionSelector from "@/components/sell/ConditionSelector";
import ItemDetailForm from "@/components/sell/ItemDetailForm";
import DealMethod from "@/components/sell/DealMethod";
import PricingInput from "@/components/sell/PricingInput";
import { encryptId, decryptId } from "@/utils/encryption";
import { deleteProduct } from "@/components/services/deleteProduct.service";
import { updateProduct } from "@/components/services/updateProduct.service";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const staticCategories = [
    { id: 1, name: "Accessories" },
    { id: 2, name: "Beauty" },
    { id: 3, name: "Equipment Bag & Shoes" },
    { id: 4, name: "Book" },
    { id: 5, name: "Fashion" },
    { id: 6, name: "Home" },
    { id: 7, name: "Sports & Kids" },
    { id: 8, name: "Electronic" },
    { id: 9, name: "Vehicle" },
    { id: 10, name: "Other" },
];

const EditPageSkeleton = () => (
    <div className="mx-auto px-[7%] py-8 animate-pulse">
        <div className="h-7 w-48 bg-gray-300 rounded-md mb-4"></div>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
                <div className="h-80 w-full bg-gray-300 rounded-lg"></div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
                <div className="space-y-2"><div className="h-4 w-24 bg-gray-300 rounded"></div><div className="h-10 w-full bg-gray-300 rounded-md"></div></div>
                <div className="space-y-2"><div className="h-4 w-24 bg-gray-300 rounded"></div><div className="h-10 w-full bg-gray-300 rounded-md"></div></div>
                <div className="space-y-2"><div className="h-4 w-20 bg-gray-300 rounded"></div><div className="h-10 w-full bg-gray-300 rounded-md"></div></div>
                <div className="space-y-2"><div className="h-4 w-20 bg-gray-300 rounded"></div><div className="h-24 w-full bg-gray-300 rounded-md"></div></div>
            </div>
        </div>
        <div className="flex justify-between mt-8">
            <div className="h-10 w-24 bg-gray-300 rounded-full"></div>
            <div className="h-10 w-36 bg-gray-300 rounded-full"></div>
        </div>
    </div>
);


export default function EditProductPage({ params }) {
    const { productId: encryptedId } = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();
    const dealMethodRef = useRef(null);

    // Form state
    const [filesToSave, setFilesToSave] = useState([]);
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [telegram, setTelegram] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [originalProduct, setOriginalProduct] = useState(null);

    // Control state
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const [error, setError] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    
    const decryptedId = useMemo(() => {
        try {
            return decryptId(decodeURIComponent(encryptedId));
        } catch (e) {
            console.error("Decryption failed:", e);
            return null;
        }
    }, [encryptedId]);


    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?redirect=/edit-product/" + encryptedId);
        }
    }, [status, router, encryptedId]);
    
    const getEncrypted = (id) => {
      try {
        if (!id) return "";
        return encodeURIComponent(encryptId(id.toString()));
      } catch (error) {
        console.error("Profile ID encryption failed:", error);
        return "";
      }
    };

    useEffect(() => {
        if (decryptedId && status === "authenticated") {
            const fetchProductData = async () => {
                setIsLoadingProduct(true);
                setError(null);
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                        `${API_BASE_URL}/products/${decryptedId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    const product = data.payload.content && Array.isArray(data.payload.content) 
                        ? data.payload.content[0] 
                        : data.payload;
                    
                    if (!product || Object.keys(product).length === 0) {
                        toast.error("Product not found.");
                        router.push("/");
                        return;
                    }

                    if (product.userId !== session.user.id) {
                        toast.error("You are not authorized to edit this product.");
                        router.push("/");
                        return;
                    }

                    setOriginalProduct(product);
                    setTitle(product.productName || "");
                    setDescription(product.description || "");
                    setLocation(product.location || "");
                    setTelegram(product.telegramUrl || "");
                    setPrice(product.productPrice?.toString() || "");
                    setDiscount(product.discountPercent?.toString() || "");
                    setCondition(product.condition || "");
                    setLatitude(product.latitude);
                    setLongitude(product.longitude);
                    
                    const cat = staticCategories.find((c) => c.id === product.mainCategoryId);
                    if (cat) setCategory(cat.name);

                } catch (err) {
                    console.error("Fetch error:", err);
                    setError(err.message);
                    toast.error("Failed to load product data.");
                } finally {
                    setIsLoadingProduct(false);
                }
            };
            fetchProductData();
        } else if (status === "authenticated" && !decryptedId) {
            toast.error("Invalid product ID.");
            router.push("/");
        }
    }, [decryptedId, status, session, router]);
    
    const initialFiles = useMemo(() => {
        if (originalProduct?.media?.length > 0) {
            return originalProduct.media.map((mediaItem, index) => ({
                id: `existing-${originalProduct.productId}-${index}`,
                url: mediaItem.fileUrl,
            }));
        }
        return [];
    }, [originalProduct]);

    const handleFilesChange = useCallback((newFiles) => {
        setFilesToSave(newFiles.filter(file => file instanceof File));
    }, []);

    const handleConfirmDelete = async () => {
        setShowDeletePopup(false);
        setIsLoading(true);
        try {
            await deleteProduct(decryptedId, session.accessToken);
            toast.success("Product deleted successfully!");
            router.push(`/profile/${getEncrypted(session.user.id)}`);
        } catch (error) {
            toast.error(`Delete failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) return toast.error("Product name is required");
        if (!condition) return toast.error("Please select product condition");
        if (!price || isNaN(parseFloat(price))) return toast.error("Please enter a valid price");

        const telegramUrl = dealMethodRef.current?.validateTelegram?.();
        if (telegramUrl === null) return;

        setIsLoading(true);
        const cat = staticCategories.find((c) => c.name === category);
        
        const productData = {
            productName: title,
            userId: session.user.id,
            mainCategoryId: cat ? cat.id : null,
            productPrice: parseFloat(price),
            discountPercent: parseFloat(discount) || 0,
            description: description,
            location: location,
            condition: condition,
            telegramUrl: telegramUrl || '',
            latitude: latitude,
            longitude: longitude,
            productStatus: originalProduct?.productStatus || "ON SALE",
        };

        try {
            const result = await updateProduct(
                decryptedId, 
                productData, 
                filesToSave, 
                session.accessToken
            );
            
            if (result) {
                toast.success("Product updated successfully!");
                router.push(`/profile/${getEncrypted(session.user.id)}`);
            } else {
                throw new Error('Update may have failed; no confirmation received.');
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.message || "Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingProduct) {
        return <EditPageSkeleton />;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error loading product: {error}</div>;
    }

    return (
        <div className="mx-auto px-[7%] py-8">
            {showDeletePopup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={() => setShowDeletePopup(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-lg font-medium mb-4">
                            Are you sure you want to delete this product?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-full bg-orange-500 text-white"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                className="px-4 py-2 rounded-full bg-gray-400 text-white"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <h1 className="text-xl font-semibold text-gray-800 mb-4">Edit Product</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <EditPhotoUploader
                        key={decryptedId}
                        initialFiles={initialFiles}
                        onFilesChange={handleFilesChange}
                        productId={decryptedId}
                    />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                    <CategorySelector selected={category} onSelect={setCategory} categories={staticCategories} />
                    {category && (
                        <>
                            <ConditionSelector selected={condition} onSelect={setCondition} />
                            <ItemDetailForm 
                                title={title} 
                                setTitle={setTitle} 
                                description={description} 
                                setDescription={setDescription} 
                            />
                            <DealMethod 
                                ref={dealMethodRef}
                                location={location} 
                                setLocation={setLocation} 
                                telegram={telegram} 
                                setTelegram={setTelegram}
                                setLatitude={setLatitude} 
                                setLongitude={setLongitude} 
                            />
                            <PricingInput 
                                price={price} 
                                setPrice={setPrice} 
                                discount={discount} 
                                setDiscount={setDiscount} 
                            />
                        </>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <button 
                    disabled={isLoading} 
                    onClick={() => setShowDeletePopup(true)}
                    className="px-6 py-2 rounded-full text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
                >
                    {isLoading ? "Please wait..." : "Delete"}
                </button>
                <button 
                    disabled={isLoading} 
                    onClick={handleSaveEdit} 
                    className="px-6 py-2 rounded-full text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}