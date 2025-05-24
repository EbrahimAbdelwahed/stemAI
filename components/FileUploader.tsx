import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

// File type constants
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const DOCUMENT_TYPES = ['.pdf', '.txt', '.doc', '.docx'];
const ALL_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES];

export default function FileUploader({ onUpload, isUploading = false, disabled = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File type detection helper
  const isImageFile = (fileName: string): boolean => {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    return IMAGE_TYPES.includes(extension);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      setSelectedFiles(filesArray);
      onUpload(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      setSelectedFiles(filesArray);
      onUpload(filesArray);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Image file icons
    if (isImageFile(fileName)) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Document file icons
    switch(extension) {
      case 'pdf':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        disabled={isUploading || disabled}
        className={`group relative flex items-center rounded-md text-sm px-3 py-2 text-gray-600 dark:text-gray-300 transition-all duration-200 ${
          isUploading || disabled 
            ? 'bg-gray-100 dark:bg-gray-800 opacity-70 cursor-not-allowed' 
            : isDragging || isHovering
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
              : 'bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-300'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <>
            <svg 
              className="animate-spin w-5 h-5 mr-2 text-blue-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <svg
              className={`w-5 h-5 mr-2 transition-colors duration-200 ${
                isDragging || isHovering ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <span>
              {isDragging ? 'Drop files here' : 'Upload files'}
              <span className="hidden sm:inline"> or drag and drop</span>
            </span>
            <span className="text-xs ml-2 text-gray-400">
              (Images: JPG, PNG, GIF | Documents: PDF, TXT, DOC, DOCX)
            </span>
          </>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
        accept={ALL_TYPES.join(',')}
        disabled={isUploading || disabled}
      />
      
      {/* File list */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              {getFileIcon(file.name)}
              <span className="ml-2 truncate">{file.name}</span>
              <span className="ml-1 text-xs text-gray-400">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              {isImageFile(file.name) && (
                <span className="ml-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  OCR
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 