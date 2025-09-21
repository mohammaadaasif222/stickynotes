import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button', // Changed default from 'submit' to 'button'
  onClick,
  className = '',
  fullWidth = false, // Added fullWidth prop that was used in your Login component
  preventDefault = false, // Changed default to false - only prevent when explicitly needed
  stopPropagation = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
 const variants = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
  success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
  ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
  amber: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white shadow-lg hover:shadow-xl focus:ring-amber-500',
  teal: 'bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white shadow-lg hover:shadow-xl focus:ring-teal-500',
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500',
  golden: 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
  sky: 'bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white shadow-lg hover:shadow-xl focus:ring-sky-500',
};

  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const handleClick = (e) => {
    // Only prevent default if explicitly requested AND it's not a submit button
    // Submit buttons should naturally submit forms, so we don't prevent that
    if (preventDefault && type !== 'submit') {
      e.preventDefault();
    }
    
    // Stop event propagation if requested
    if (stopPropagation) {
      e.stopPropagation();
    }
    
    // Call the provided onClick handler if it exists and button is not disabled/loading
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      type={type}
      onClick={handleClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};