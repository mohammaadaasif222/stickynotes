// components/common/Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  X,
  Info
} from "lucide-react";
import { Button } from "./Button";

export const Modal = ({
  isOpen = false,
  onClose,
  variant = "warning", 
  title,
  message,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = "md", // 'sm', 'md', 'lg', 'xl', 'full'
  actions = null, // Custom action buttons
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = null,
  onCancel = null,
  showConfirm = false,
  showCancel = false,
  loading = false,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Variant configurations
  const variants = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-red-500",
      iconBg: "bg-red-100",
      borderColor: "border-white/20",
      headerBg: "bg-red-500",
      primaryButton: "primary",
    },
    error: {
      icon: XCircle,
      iconColor: "text-red-500",
      iconBg: "bg-red-100",
      borderColor: "border-red-200",
      headerBg: "bg-red-50",
      primaryButton: "danger",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
      borderColor: "border-green-200",
      headerBg: "bg-green-50",
      primaryButton: "primary",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200",
      headerBg: "bg-blue-50",
      primaryButton: "primary",
    },
  };

  // Size configurations
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  const variantConfig = variants[variant];
  const IconComponent = variantConfig.icon;

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} transform transition-all ${className}`}
        {...props}
      >
        <div
          className={`bg-[#1e1e1e] rounded-md shadow-xl border ${variantConfig.borderColor} ${contentClassName}`}
        >
          {/* Header */}
          <div className={`px-6 py-4 ${variantConfig.headerBg} rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${variantConfig.iconBg}`}>
                  <IconComponent className={`w-5 h-5 ${variantConfig.iconColor}`} />
                </div>
                {title && (
                  <h3 className="text-lg font-semibold text-[var(--subtitle-color)]">
                    {title}
                  </h3>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-[var(--subtitle-color)] hover:text-gray-300 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {message && (
              <p className="text-[var(--subtitle-color)] text-sm leading-relaxed mb-4">
                {message}
              </p>
            )}
            {children}
          </div>

          {/* Actions */}
          {(actions || showConfirm || showCancel) && (
            <div className="px-6 py-4 bg-gray-900 text-[var(--subtitle-color)] rounded-b-lg">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
                {actions ? (
                  actions
                ) : (
                  <>
                    {showCancel && (
                      <Button
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        {cancelText}
                      </Button>
                    )}
                    {showConfirm && (
                      <Button
                        variant={variantConfig.primaryButton}
                        onClick={handleConfirm}
                        loading={loading}
                        disabled={loading}
                        className="w-full sm:w-auto"
                      >
                        {confirmText}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};