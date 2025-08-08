'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { setUploadedFiles } from '@/utils/fileStore';
import { toast } from 'react-hot-toast';


export default function PhotoUploadPrompt() {
  const fileInputRef = useRef(null);
  const router = useRouter();

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

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    // Check if first file is a video
    if (fileArray.length > 0) {
      const firstFile = fileArray[0];
      const isFirstVideo = firstFile.type.startsWith('video/');
      
      if (isFirstVideo) {
        toast.error('Please upload at least one image first before adding videos');
        return;
      }
    }

    const validFiles = [];
    
    for (const file of fileArray) {
      // Validate file type
      if (!(file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        continue;
      }
      
      // Validate file size
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 20MB)`);
        continue;
      }
      
      // Additional validation for videos
      if (file.type.startsWith('video/')) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > 10) {
            toast.error(`Video ${file.name} is too long (max 10 seconds)`);
            continue;
          }
        } catch (error) {
          toast.error(`Could not validate video ${file.name}`);
          continue;
        }
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      toast.error("No valid files selected. Please choose images or videos under 20MB.");
      return;
    }

    if (validFiles.length < fileArray.length) {
      toast.error("Some files were invalid and were ignored.");
    }
    
    // Limit to 5 files
    const finalFiles = validFiles.slice(0, 5);

    // Store the files
    setUploadedFiles(finalFiles);
    
    // Redirect to the new sell page
    router.push('/sell/new');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      className="bg-orange-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center h-80 p-6 text-center group hover:border-orange-400 hover:bg-orange-100 transition-colors duration-300 cursor-pointer"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mb-4">
        <img src="/images/story set/image.jpg" alt="Upload Icon" className='w-[40px]' />
      </div>
      <div className="mb-4">
        <span className="px-6 py-2 mt-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
          Select photos
        </span>
      </div>
      <p className="text-gray-700 text-[15px]">
        or drag photo here <br /> (up to 5 photos/videos)
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Note: First upload must be an image<br />
        Videos must be under 10 seconds
      </p>
    </div>
  );
}