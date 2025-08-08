'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
async function getMediaTypeFromUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('Content-Type');
        return contentType?.startsWith('video') ? 'video' : 'image';
    } catch (err) {
        console.error('Error fetching content type:', err);
        if (/\.(mp4|mov|webm|avi|mkv)$/i.test(url)) return 'video';
        return 'image';
    }
}

const getVideoDuration = (file) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        
        video.onerror = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(0);
        };
        
        video.src = URL.createObjectURL(file);
    });
};

const processFile = async (file, index, existingItems = []) => {
    if (existingItems.length === 0) {
        const isVideo = file instanceof File 
            ? file.type.startsWith('video/') || file.name?.match(/\.(mp4|mov|webm|avi|mkv)$/i)
            : /\.(mp4|mov|webm|avi|mkv)$/i.test(file.url);
        
        if (isVideo) {
            throw new Error('FIRST_IMAGE_REQUIRED');
        }
    }

    if ((file instanceof File && (file.type.startsWith('video/') || file.name?.match(/\.(mp4|mov|webm|avi|mkv)$/i)))) {
        try {
            const duration = await getVideoDuration(file);
            if (duration > 10) { 
                throw new Error('VIDEO_TOO_LONG');
            }
        } catch (error) {
            console.error('Video validation error:', error);
            throw new Error('VIDEO_VALIDATION_FAILED');
        }
    
    }

    if (file instanceof File) {
        const isVideo = file.type.startsWith('video/') || file.name?.match(/\.(mp4|mov|webm|avi|mkv)$/i);
        return {
            id: `${file.name}-${file.lastModified}-${Date.now()}`,
            name: file.name,
            type: isVideo ? 'video' : 'image',
            previewUrl: URL.createObjectURL(file),
            fileObject: file,
        };
    }
    
    if (file?.url) {
        const mediaType = await getMediaTypeFromUrl(file.url);
        return {
            id: file.id || `loaded-url-${index}-${Date.now()}`,
            name: file.name || `Media ${index + 1}`,
            type: mediaType,
            previewUrl: file.url,
            fileObject: file,
        };
    }
    
    return null;
};

// This signature correctly accepts the 'productId' prop
export default function EditPhotoUploader({ initialFiles = [], onFilesChange, productId }) {
    const { data: session } = useSession();
    const [mediaItems, setMediaItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const isInitialized = useRef(false);
    const initialFilesProcessed = useRef(false);

    useEffect(() => {
        if (initialFilesProcessed.current || !Array.isArray(initialFiles) || initialFiles.length === 0) return;

        const loadInitialFiles = async () => {
            try {
                const processed = await Promise.all(
                    initialFiles.map((f, i) => processFile(f, i))
                );
                const validFiles = processed.filter(Boolean);
                setMediaItems(validFiles);
                initialFilesProcessed.current = true;
            } catch (error) {
                console.error('Error loading initial files:', error);
            }
        };
        
        loadInitialFiles();
    }, [initialFiles]);

    useEffect(() => {
        if (isInitialized.current) {
            const newFiles = mediaItems
                .filter(item => item.fileObject instanceof File)
                .map(item => item.fileObject);
            
            onFilesChange(newFiles);
        } else {
            isInitialized.current = true;
        }
    }, [mediaItems, onFilesChange]);

    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.previewUrl?.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [mediaItems]);

    const deduplicateById = (items) => {
        const seen = new Set();
        return items.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    };

    const addFiles = useCallback(async (newFiles) => {
        const filesArray = Array.from(newFiles);
        
        try {
            const processedNew = await Promise.all(
                filesArray.map((f, i) => 
                    processFile(f, mediaItems.length + i, mediaItems)
                        .catch(error => {
                            switch (error.message) {
                                case 'FIRST_IMAGE_REQUIRED':
                                    toast.error('Please upload at least one image first before adding videos');
                                    break;
                                case 'VIDEO_TOO_LONG':
                                    toast.error('Videos must be under 10 seconds');
                                    break;
                                case 'VIDEO_VALIDATION_FAILED':
                                    toast.error('Could not validate video duration');
                                    break;
                                default:
                                    toast.error('Invalid file type or format');
                            }
                            return null;
                        })
                )
            );
            
            const validNewFiles = processedNew.filter(Boolean);
            if (validNewFiles.length === 0) return;

            setMediaItems(prevItems => {
                const combined = [...prevItems, ...validNewFiles];
                const unique = deduplicateById(combined);
                const final = unique.slice(0, 5);
                return final;
            });
        } catch (error) {
            console.error('Error processing files:', error);
        }
    }, [mediaItems]);

    const handleRemove = useCallback(async (idToRemove) => {
        const itemToRemove = mediaItems.find(item => item.id === idToRemove);
        if (!itemToRemove) return;

        const isExistingFile = !itemToRemove.previewUrl.startsWith('blob:') && !(itemToRemove.fileObject instanceof File);

        if (isExistingFile) {
            if (!productId) {
                toast.error("Product ID is missing. Cannot delete file.");
                return;
            }
            try {
                const token = session?.accessToken || localStorage.getItem('token');
                if (!token) {
                    toast.error("You are not authenticated.");
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/products/${productId}/files?fileUrl=${encodeURIComponent(itemToRemove.previewUrl)}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete file.");
                }

                toast.success("Media deleted successfully!");

            } catch (error) {
                toast.error(`Deletion failed: ${error.message}`);
                console.error("Error deleting file:", error);
                return;
            }
        }
        
        setMediaItems(prevItems => {
            const updated = prevItems.filter(item => item.id !== idToRemove);
            if (itemToRemove.previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(itemToRemove.previewUrl);
            }
            return updated;
        });

    }, [mediaItems, session, productId]);

    const moveToFirst = useCallback((idToMove) => {
        setMediaItems(prevItems => {
            const item = prevItems.find(f => f.id === idToMove);
            if (!item) return prevItems;
            const rest = prevItems.filter(f => f.id !== idToMove);
            return [item, ...rest];
        });
    }, []);
    
    const handleFileInputChange = useCallback((e) => {
        if (e.target.files?.length) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    }, [addFiles]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    }, [addFiles]);

    return (
        <>
            {mediaItems.length < 5 && (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`bg-orange-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center h-80 p-6 text-center group transition cursor-pointer ${
                        isDragging ? 'border-orange-500 bg-orange-100' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-100'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                    <img src="/images/story set/image.jpg" alt="Upload" className="w-[40px] mb-4" />
                    <span className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition mb-4">
                        {mediaItems.length === 0 ? 'Select photos/videos' : 'Add more'}
                    </span>
                    <p className="text-gray-700 text-[15px]">
                        or drag media here<br />(up to 5 photos/videos)
                    </p>
                    {mediaItems.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            Note: First upload must be an image<br />
                            Videos must be under 10 seconds
                        </p>
                    )}
                </div>
            )}

            {mediaItems.length > 0 && (
                <>
                    <p className="text-[13px] text-gray-400 mt-2">
                        Tip: The first item is the cover image. Drag or use "Make Cover" to reorder.
                    </p>
                    <div className={`grid ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-3 gap-4 mt-4`}>
                        {mediaItems.map((item, index) => (
                            <div key={item.id} className="rounded-2xl overflow-hidden border bg-white shadow-sm relative group">
                                <div className="flex items-center justify-between px-3 py-2 border-b">
                                    <span className="text-sm font-medium text-black">{index === 0 ? 'Cover' : `Media ${index + 1}`}</span>
                                    <div className="flex gap-2">
                                        {index !== 0 && (
                                            <button onClick={() => moveToFirst(item.id)} className="text-gray-500 hover:text-orange-500 transition" title="Make Cover">▲</button>
                                        )}
                                        <button onClick={() => handleRemove(item.id)} className="text-gray-500 hover:text-red-500 transition" title="Remove">✕</button>
                                    </div>
                                </div>
                                <div className="w-full h-48 flex items-center justify-center bg-gray-100 relative">
                                    {item.type === 'video' ? (
                                        <video 
                                            src={item.previewUrl} 
                                            className="w-full h-full object-cover" 
                                            controls 
                                            playsInline
                                            muted
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={item.previewUrl} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover" 
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {item.type?.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 text-right mt-1">
                        {mediaItems.length}/5 {mediaItems.length === 5 && '(Maximum reached)'}
                    </p>
                </>
            )}
        </>
    );
}