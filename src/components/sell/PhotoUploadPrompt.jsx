'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { deleteProductMedia } from '@/components/services/deleteProductMedia.service';

// A small component for the image/video preview
const FilePreview = ({ file, onRemove }) => {
  const url = file.isExisting ? file.url : URL.createObjectURL(file);
  const isVideo = (file.isExisting && file.url.includes('.mp4')) || file.type?.startsWith('video/');

  return (
    <div className="relative w-28 h-28 rounded-lg overflow-hidden border">
      {isVideo ? (
        <video src={url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={() => onRemove(file)}
        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
      >
        &times;
      </button>
    </div>
  );
};

export default function EditPhotoUploader({ initialFiles = [], onFilesChange, productId }) {
  const { data: session } = useSession();
  const [displayedFiles, setDisplayedFiles] = useState(initialFiles);
  const [isLoading, setIsLoading] = useState(false);

  // Notify the parent component whenever the files change
  useEffect(() => {
    // We only pass up the files that are NOT existing (i.e., new File objects)
    const newFiles = displayedFiles.filter(f => !f.isExisting);
    onFilesChange(newFiles);
  }, [displayedFiles, onFilesChange]);

  const handleAddFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    // Simple validation (can be expanded)
    const validFiles = newFiles.filter(f => f.size < 20 * 1024 * 1024); // max 20MB
    if (validFiles.length < newFiles.length) {
      toast.error('Some files were too large and were ignored.');
    }
    
    setDisplayedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Limit to 5 total
  };

  const handleRemove = useCallback(async (fileToRemove) => {
    if (isLoading) return;

    // ✨ FIX: This is the core logic to fix your error.
    // If the file is an existing one, we must call the API to delete it.
    if (fileToRemove.isExisting) {
      setIsLoading(true);
      try {
        const token = session?.accessToken || localStorage.getItem('token');
        if (!token) throw new Error("Authentication token not found.");
        
        // Call the deletion service with the media ID
        await deleteProductMedia(fileToRemove.id, token);
        toast.success("Image deleted from server.");

      } catch (error) {
        // If the API call fails, show an error and DON'T remove it from the UI.
        toast.error(error.message);
        setIsLoading(false);
        return; 
      }
      setIsLoading(false);
    }
    
    // If it's a new file OR if the API deletion was successful, remove it from the UI.
    setDisplayedFiles(prev => prev.filter(f => f !== fileToRemove));

  }, [session, isLoading]);

  return (
    <div className="bg-white p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold text-gray-700">Product Photos & Videos</h3>
      <div className="flex flex-wrap gap-4">
        {displayedFiles.map((file, index) => (
          <FilePreview key={file.id || index} file={file} onRemove={handleRemove} />
        ))}
        {displayedFiles.length < 5 && (
          <label className="w-28 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:bg-gray-50 hover:border-orange-400">
            <span className="text-3xl">+</span>
            <span className="text-xs mt-1">Add More</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleAddFiles}
            />
          </label>
        )}
      </div>
      {isLoading && <p className="text-sm text-gray-500">Deleting image...</p>}
    </div>
  );
}