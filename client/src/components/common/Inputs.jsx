import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
export const Input = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 text-white flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-white/20 placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            icon ? "pl-10" : ""
          } ${type === "password" ? "pr-10" : ""} ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-300" />
            ) : (
              <Eye className="h-4 w-4 text-gray-300" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border  border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`space-y-1 ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border  border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:border-gray-400"
          }`}
        >
          <span className={selectedOption ? "text-gray-200" : "text-gray-100"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border  border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                  value === option.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder = "Search and select...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={`space-y-1 ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border  border-white/20 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-colors cursor-pointer ${
            error ? "border-red-500 focus-within:ring-red-500" : ""
          } ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:border-gray-400"
          }`}
        >
          {isOpen ? (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <span
              className={selectedOption ? "text-gray-300" : "text-gray-300"}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border  border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                    value === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FileUpload = ({
  label,
  accept,
  multiple = false,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onChange(multiple ? files : files[0]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onChange(multiple ? files : files[0]);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : " border-white/20"
        } ${
          disabled ? "cursor-not-allowed bg-gray-100" : "hover:border-gray-400"
        } ${error ? "border-red-500" : ""}`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Drop files here or <span className="text-blue-500">browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center space-x-2 cursor-pointer ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600  border-white/20 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
};

export const Radio = ({
  name,
  options = [],
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center space-x-2 cursor-pointer ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600  border-white/20 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};
