import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({
  size = 'md',
  text = 'Loading...',
  overlay = false,
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const LoadingSpinner = () => (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Loader2 className={`animate-spin text-blue-500 ${sizes[size]}`} />
      {/* {text && <p className="text-gray-600 text-sm font-medium">{text}</p>} */}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default Loading;
