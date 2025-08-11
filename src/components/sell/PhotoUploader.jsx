'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function PhotoUploader({ files, setFiles }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    processFiles(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const hasExistingImage = () => {
    return files.some(file => {
      if (file.url) return !/\.(mp4|mov|avi|webm)$/i.test(file.url);
      if (file instanceof File) return file.type.startsWith('image/');
      return false;
    });
  };

  const processFiles = async (newFiles) => {
    // First validate all files before processing
    const validatedFiles = [];
    let hasInvalidVideoFirst = false;
    
    // Check if any videos are being uploaded without existing image
    if (!hasExistingImage()) {
      const hasVideo = newFiles.some(file => {
        if (file instanceof File) return file.type.startsWith('video/');
        if (file.url) return /\.(mp4|mov|avi|webm)$/i.test(file.url);
        return false;
      });

      if (hasVideo) {
        toast.error('Please upload at least one image first before adding videos');
        hasInvalidVideoFirst = true;
      }
    }

    // If invalid video upload attempt, stop processing
    if (hasInvalidVideoFirst) return;

    for (const file of newFiles) {
      // Check file type
      const isImage = file.type?.startsWith('image/') || 
                     (file.url && !/\.(mp4|mov|avi|webm)$/i.test(file.url));
      const isVideo = file.type?.startsWith('video/') || 
                      (file.url && /\.(mp4|mov|avi|webm)$/i.test(file.url));
      
      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} is not an image or video`);
        continue;
      }
      
      // Check file size
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 20MB)`);
        continue;
      }
      
      // Additional validation for videos
      if (isVideo && !isImage) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > 10) {
            toast.error(`Video is too long (max 10 seconds)`);
            continue;
          }
        } catch (error) {
          toast.error(`Could not validate video ${file.name}`);
          continue;
        }
      }
      
      validatedFiles.push(file);
    }
    
    if (validatedFiles.length === 0) return;

    setFiles(prevFiles => {
      const combined = [...prevFiles, ...validatedFiles];
      const uniqueFiles = combined.reduce((acc, current) => {
        const identifier = current instanceof File ? current.name : current.url;
        if (!acc.some(item => {
          const itemIdentifier = item instanceof File ? item.name : item.url;
          return itemIdentifier === identifier;
        })) {
          acc.push(current);
        }
        return acc;
      }, []);
      return uniqueFiles.slice(0, 5);
    });
  };

  const handleRemove = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const renderMediaPreview = (file) => {
    if (file.url) {
      const isVideo = /\.(mp4|mov|avi|webm)$/i.test(file.url);
      return isVideo ? (
        <video controls className="w-full h-48 object-cover rounded-lg" src={file.url} />
      ) : (
        <img src={file.url} alt="Draft preview" className="w-full h-48 object-cover rounded-lg" />
      );
    }

    if (file instanceof File) {
      const src = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      return isVideo ? (
        <video controls className="w-full h-48 object-cover rounded-lg" src={src} />
      ) : (
        <img src={src} alt="Upload preview" className="w-full h-48 object-cover rounded-lg" />
      );
    }
    return null;
  };

  useEffect(() => {
    const objectUrls = files
      .filter(file => file instanceof File)
      .map(file => URL.createObjectURL(file));

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`bg-orange-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center h-80 p-6 text-center transition ${
          isDragging ? 'border-orange-500 bg-orange-100' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-100'
        }`}
      >
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={files.length >= 5}
          />
          <div className="mb-4">
            <img src="/images/story set/image.jpg" alt="Upload Icon" className="w-10" />
          </div>
          <div className="mb-4">
            <span className={`px-6 py-2 bg-orange-500 text-white rounded-full transition ${
                files.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-orange-600'
            }`}>
              Select files
            </span>
          </div>
          <p className="text-gray-700 text-sm">
            Drag & drop photos/videos here<br />
            (Max {5 - files.length} remaining, 20MB each)
          </p>
          {files.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Note: First upload must be an image<br />
              Videos must be under 10 seconds
            </p>
          )}
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={file.id || file.name || index} className="relative group bg-gray-100 rounded-lg">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleRemove(index)}
                    className="bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                    aria-label="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {renderMediaPreview(file)}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-right text-sm text-gray-500">
            {files.length}/5 files selected
          </p>
        </div>
      )}
    </div>
  );
}