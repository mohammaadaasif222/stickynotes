import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "./Header";

import { selectUser } from "../../store/slices/authSlice";
import { ChevronRightIcon, HomeIcon } from "lucide-react";


const UserLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const user = useSelector(selectUser);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest("aside") &&
        !event.target.closest("button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSetActiveTab = (tabName, menuItem) => {
    setActiveTab(tabName);

    if (tabName === "Income" && user?.id) {
      const url = `${menuItem.to}?user_id=${user.id}`;
      navigate(url);
    } else if (menuItem?.to) {
      navigate(menuItem.to);
    }

    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  const handleGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    else if (hour < 17) return "Good Afternoon";
    else return "Good Evening";
  };
  return (
    <div className="min-h-screen bg-gray-50">
   
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`transition-all duration-300`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="p-4 ">
          <div className="max-w-7xl mx-auto ">
            <div className="flex justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-200 tracking-wide">
                {handleGreeting()},
                <span className="text-transparent text-base bg-clip-text bg-gradient-to-r from-[#4abd0b] to-green-400">
                  &nbsp;{user?.full_name}
                </span>
              </h2>
              <nav aria-label="Breadcrumb" className="lg:flex hidden">
                <ol role="list" className="flex items-center space-x-2">
                  <li>
                    <Link to="/" className="text-gray-200">
                      <HomeIcon
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                      <span className="sr-only">Home</span>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-[#4abd0b]"
                      />
                      <p className="ml-2 text-sm font-medium text-gray-200">
                        {activeTab}
                      </p>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
             <div className="flex justify-between items-center mb-4">
              
              <nav aria-label="Breadcrumb" className="flex lg:hidden">
                <ol role="list" className="flex items-center space-x-2">
                  <li>
                    <Link to="/" className="text-gray-200">
                      <HomeIcon
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      />
                      <span className="sr-only">Home</span>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-[#4abd0b]"
                      />
                      <p className="ml-2 text-sm font-medium text-gray-200">
                        {activeTab}
                      </p>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="text-white cursor-pointer   lg:hidden">
            </div>
            </div>
           
            <div className=" min-h-[calc(100vh-200px)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
