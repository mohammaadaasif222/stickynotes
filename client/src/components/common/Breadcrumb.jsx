// components/layout/Header/Breadcrumb.jsx
import React, { memo } from 'react';
import { Home } from 'lucide-react';

const Breadcrumb = memo(({ pageName, user }) => {
  
  return (
    <nav aria-label="Breadcrumb" className="flex md:justify-between justify-end px-4 py-2">
      <ol role="list" className="hidden space-x-4 lg:flex w-full">
        <li className="flex">
          <div className="flex items-center">
            <a href="#" className="text-gray-100 hover:text-gray-200/85">
              <Home className="flex-shrink-0 w-5 h-5" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        <li className="flex">
          <div className="flex items-center">
            <svg
              fill="currentColor"
              viewBox="0 0 24 44"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="flex-shrink-0 w-6 h-full text-[#4abd0b] hover:text-[#4abd0b]/85"
            >
              <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
            </svg>
            <a className="ml-4 text-base font-medium text-[#4abd0b] hover:text-[#4abd0b]/85">
              {user?.full_name}
            </a>
          </div>
        </li>
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
