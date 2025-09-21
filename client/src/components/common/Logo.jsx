import React from "react";

const Logo = ({
  variant = "header",
  className = "",
  alt = "Company Logo",
  onClick = null,
  href = null,
}) => {
  // Define logo sources for different variants
  const logoSources = {
    header: "/assets/logo-header.png",
    footer: "/assets/logo-footer.png",
    mobile: "/assets/logo-mobile.png",
  };

  // Define responsive classes for each variant
  const variantClasses = {
    header:
      "h-8 md:h-10 lg:h-12 w-auto max-w-[200px] md:max-w-[250px] lg:max-w-[300px]",
    footer:
      "h-6 md:h-8 w-auto max-w-[150px] md:max-w-[200px] opacity-80 hover:opacity-100 transition-opacity",
    mobile: "h-6 w-auto max-w-[120px]",
  };

  // Define container classes for each variant
  const containerClasses = {
    header: "flex items-center justify-start",
    footer: "flex items-center justify-center md:justify-start",
    mobile: "flex items-center justify-center",
  };

  const logoImage = (
    <img
      src={logoSources[variant]}
      alt={alt}
      className={`${variantClasses[variant]} object-contain transition-all duration-200 ${className}`}
      onError={(e) => {
        // Fallback to a placeholder or default logo if image fails to load
        e.target.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIiByeD0iNCIvPgo8dGV4dCB4PSI1MCIgeT0iMjQiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR088L3RleHQ+Cjwvc3ZnPg==";
      }}
    />
  );

  // If href is provided, wrap in anchor tag
  if (href) {
    return (
      <div className={containerClasses[variant]}>
        <a
          href={href}
          className="inline-block hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          onClick={onClick}
        >
          {logoImage}
        </a>
      </div>
    );
  }

  // If onClick is provided, make it clickable
  if (onClick) {
    return (
      <div className={containerClasses[variant]}>
        <button
          onClick={onClick}
          className="inline-block hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded bg-transparent border-none p-0 cursor-pointer"
        >
          {logoImage}
        </button>
      </div>
    );
  }

  // Default static logo
  return <div className={containerClasses[variant]}>{logoImage}</div>;
};

export default Logo;
