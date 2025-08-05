"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import PhotoUploader from "@/components/sell/PhotoUploader";
import CategorySelector from "@/components/sell/CategorySelector";
import ConditionSelector from "@/components/sell/ConditionSelector";
import ItemDetailForm from "@/components/sell/ItemDetailForm";
import DealMethod from "@/components/sell/DealMethod";
import PricingInput from "@/components/sell/PricingInput";
import { postProduct } from "@/components/services/postProduct.service";
import { toast } from "react-hot-toast";
import { encryptId } from "@/utils/encryption";
import axios from "axios";
import { getUploadedFiles } from "@/utils/fileStore";
// --- ⭐️ 1. IMPORT THE EVENT SERVICE ---
import { eventService } from "@/components/services/even.service";


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

export const SellNewClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: session, status } = useSession();

  const dealMethodRef = useRef();
  const [files, setFiles] = useState([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [productStatus, setProductStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const isNavigatingRef = useRef(false);
  const [userDrafts, setUserDrafts] = useState([]);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    if (!draftId) {
      const initialFiles = getUploadedFiles();
      if (initialFiles.length > 0) {
        setFiles(initialFiles);
      }
    }
  }, [draftId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/sell");
    }
  }, [status, router]);

  useEffect(() => {
    if (!draftId || !session?.accessToken) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Missing authentication token. Please login again.");
      router.push("/login");
      return;
    }

    const fetchSpecificDraft = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/products/drafts/${draftId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const draft = response.data.payload;
        if (!draft || draft.productStatus !== "DRAFT") {
          toast.error("Draft not found or is not a draft.");
          router.replace("/sell");
          return;
        }
        setTitle(draft.productName || "");
        const catName =
          staticCategories.find((c) => c.id === draft.mainCategoryId)?.name ||
          "";
        setCategory(catName);
        setCondition(draft.condition || "");
        setDescription(draft.description || "");
        setLocation(draft.location || "");
        setTelegram(draft.telegramUrl || "");
        setPrice(draft.productPrice?.toString() || "");
        setDiscount(draft.discountPercent?.toString() || "");
        setProductStatus(draft.productStatus || "");
        setLatitude(draft.latitude || null);
        setLongitude(draft.longitude || null);

        if (draft.fileUrls && draft.fileUrls.length > 0) {
          const existingFiles = draft.fileUrls.map((url, index) => ({
            id: `draft-url-${index}`,
            url,
          }));
          setFiles(existingFiles);
        }
      } catch (error) {
        console.error("Failed to load specific draft:", error);
        toast.error("Failed to load draft. Please try again.");
        router.replace("/sell");
      }
    };
    fetchSpecificDraft();
  }, [draftId, session?.accessToken, router]);

  const handleListNow = async () => {
    if (!files.length) return toast.error("Please upload at least one image");
    if (!title.trim()) return toast.error("Product name is required");
    if (!condition) return toast.error("Please select product condition");
    if (!price || isNaN(parseFloat(price)))
      return toast.error("Please enter a valid price");
    if (!category) return toast.error("Please select a category");
    if (!location.trim()) return toast.error("Location is required");

    const telegramUrl = dealMethodRef.current?.validateTelegram?.();
    if (telegramUrl === null) return;

    setIsLoading(true);

    try {
      const token = session?.accessToken || localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to list an item.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      const selectedCategory = staticCategories.find(
        (cat) => cat.name === category
      );
      const mainCategoryId = selectedCategory ? selectedCategory.id : 0;

      const productData = {
        productName: title,
        userId: session.user.id,
        mainCategoryId,
        productPrice: parseFloat(price),
        discountPercent: parseFloat(discount) || 0,
        productStatus: "ON SALE",
        description,
        location,
        latitude,
        longitude,
        condition,
        telegramUrl: telegramUrl || "",
        files,
      };

      if (draftId) {
        const formData = new FormData();
        Object.keys(productData).forEach((key) => {
          if (key !== "files") {
            formData.append(key, productData[key]);
          }
        });
        productData.files.forEach((file) => {
          if (file instanceof File) {
            formData.append("files", file);
          }
        });

        await axios.put(
          `${API_BASE_URL}/products/update-draft/${draftId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Item published successfully!");
      } else {
        await postProduct(productData);
        toast.success("Item listed successfully!");
      }

      // --- ⭐️ 2. DISPATCH EVENT ON SUCCESS ---
      // This tells other components to refresh their data.
      eventService.dispatch('productAdded');

      const encryptedId = encodeURIComponent(encryptId(session.user.id));
      router.push(`/profile/${encryptedId}`);
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to list item. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // The rest of your functions (handleSaveDraft, etc.) and JSX remain unchanged.
  // I am including them below for completeness.
  
  useEffect(() => {
    const fetchAllUserDrafts = async () => {
      if (
        status === "authenticated" &&
        session?.user?.id &&
        session?.accessToken
      ) {
        const token = session.accessToken;
        const userId = session.user.id;
        try {
          const response = await axios.get(
            `${API_BASE_URL}/products/drafts/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200 && response.data?.payload) {
            setUserDrafts(response.data.payload);
          } else {
            setUserDrafts([]);
          }
        } catch (error) {
          console.error("Failed to fetch all user drafts (background):", error);
          setUserDrafts([]);
        }
      } else {
        setUserDrafts([]);
      }
    };
    fetchAllUserDrafts();
  }, [status, session]);

  useEffect(() => {
    const handleClick = (e) => {
      if (showPopup) {
        const insidePopup = e.target.closest(".draft-popup");
        if (!insidePopup) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      const anchor = e.target.closest("a");
      if (!anchor || !anchor.href || anchor.href === window.location.href)
        return;
      const isInternal = anchor.href.startsWith(window.location.origin);
      const isSamePath = anchor.pathname === window.location.pathname;
      if (
        files.length > 0 &&
        !isLoading &&
        isInternal &&
        !isSamePath &&
        !isNavigatingRef.current
      ) {
        e.preventDefault();
        setNavigationTarget(anchor.href);
        setShowPopup(true);
      }
    };
    const handlePopState = () => {
      if (files.length > 0 && !isLoading && !isNavigatingRef.current) {
        history.pushState(null, "", window.location.href);
        setNavigationTarget(null);
        setShowPopup(true);
      }
    };
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [files, isLoading, showPopup]);

  useEffect(() => {
    if (showPopup) {
      const beforeUnloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };
      window.addEventListener("beforeunload", beforeUnloadHandler);
      return () => {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
      };
    }
  }, [showPopup]);

  const handleSaveDraft = async () => {
    const token = session?.accessToken || localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to save a draft.");
      return;
    }
    setIsLoading(true);
    try {
      const selectedCategory = staticCategories.find(
        (cat) => cat.name === category
      );
      const mainCategoryId = selectedCategory ? selectedCategory.id : 0;
      const params = new URLSearchParams();
      params.append("productName", title || "");
      params.append(
        "userId",
        String(
          session?.user?.id || JSON.parse(localStorage.getItem("cachedUser")).id
        )
      );
      params.append("mainCategoryId", String(mainCategoryId || ""));
      params.append("productPrice", String(price || ""));
      params.append("discountPercent", String(discount || ""));
      params.append("description", description || "");
      params.append("location", location || "");
      params.append("latitude", String(latitude || ""));
      params.append("longitude", String(longitude || ""));
      params.append("condition", condition || "");
      params.append("telegramUrl", telegram || "");
      const formData = new FormData();
      files.forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file);
        }
      });
      let response;
      const baseUrl =
        `${API_BASE_URL}/products/`;
      if (draftId) {
        response = await axios.put(
          `${baseUrl}drafts/${draftId}?${params.toString()}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${baseUrl}save-draft?${params.toString()}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      if (response.status === 200) {
        toast.success("Draft saved successfully!");
        localStorage.removeItem("unsavedDraft");
        if (!draftId && response.data?.payload?.draftId) {
          router.replace(`/sell?draftId=${response.data.payload.draftId}`);
        }
        if (session?.user?.id) {
          const userId = session.user.id;
          const updatedDraftsResponse = await axios.get(
            `${API_BASE_URL}/products/drafts/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (
            updatedDraftsResponse.status === 200 &&
            updatedDraftsResponse.data?.payload
          ) {
            setUserDrafts(updatedDraftsResponse.data.payload);
          }
        }
      } else {
        toast.error("Unexpected server response when saving draft.");
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save draft. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
      proceedNavigation();
    }
  };

  const proceedNavigation = () => {
    setShowPopup(false);
    isNavigatingRef.current = true;
    if (navigationTarget) {
      router.push(navigationTarget);
    } else {
      router.back();
    }
  };

  const discardAndLeave = () => {
    setShowPopup(false);
    isNavigatingRef.current = true;
    if (navigationTarget) {
      router.push(navigationTarget);
    } else {
      router.back();
    }
  };

  return (
    <div className="relative">
      <div className="mx-auto px-[7%] py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">
          List an item
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <PhotoUploader files={files} setFiles={setFiles} />
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <CategorySelector
              selected={category}
              onSelect={setCategory}
              categories={staticCategories}
            />
            {category && (
              <>
                <ConditionSelector
                  selected={condition}
                  onSelect={setCondition}
                />
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
        <div className="text-end mt-8 space-x-4">
          <button
            disabled={isLoading}
            onClick={handleListNow}
            className={`px-6 py-2 mt-2 rounded-full text-white transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isLoading ? "Uploading..." : "List now"}
          </button>
        </div>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center draft-popup">
            <p className="text-lg font-medium mb-4">
              Do you want to save this as a draft?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveDraft();
                }}
                className="px-4 py-2 rounded-full bg-orange-500 text-white"
              >
                Yes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  discardAndLeave();
                }}
                className="px-4 py-2 rounded-full bg-gray-400 text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellNewClient;