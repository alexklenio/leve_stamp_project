import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadBoxProps {
  onFileUpload: (content: string) => void;
  isLoading?: boolean;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onFileUpload, isLoading = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload(content);
    };

    reader.readAsText(file);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div>
          <p className="font-semibold text-gray-700">
            {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o arquivo TXT aqui'}
          </p>
          <p className="text-sm text-gray-500 mt-1">ou clique para selecionar</p>
        </div>
        <p className="text-xs text-gray-400 mt-2">Formatos: TXT, CSV</p>
      </div>
    </div>
  );
};
