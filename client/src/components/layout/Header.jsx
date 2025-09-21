import { Bell, User, LogOut, ChevronDownIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  selectAdmin,
  selectUser,
  resetUserAuth,
  resetAdminAuth,
} from "../../store/slices/authSlice";
import { useEffect, useState, useRef } from "react";



// import CountdownTimer from "../common/CountdownButton";
const Header = ({ isSidebarOpen, onToggleMobileMenu, isMobileMenuOpen }) => {
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
  const user = useSelector(selectUser)
   const location = useLocation();
  const isAdminPath = location.pathname.includes("/admin");
  const currentUser = true
  const showWalletCards = !isAdminPath;
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (isAdminPath) {
      dispatch(resetAdminAuth());
    } else {
      dispatch(resetUserAuth());
    }
  };


  return (
    <header className="shadow-sm bg-[#1E2328] border-b border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6 text-white">
   
      <div className="flex items-center md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="text-[#4abd0b] hover:text-white p-2"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-center space-x-4 ml-auto relative">
       
        {isAdminPath && (
          <div className="hidden sm:block">
            <div className="px-3 py-1 bg-[#4abd0b]/10 text-[#4abd0b] rounded-full text-sm font-semibold">
              Admin Panel
            </div>
          </div>
        )}
        <button className="relative p-2 text-[#4abd0b] hover:text-white transition">
        </button>
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">
                {user?.firstName }
                {user?.lastName}
              </p>
              <p className="text-xs text-[#4abd0b]">
                {isAdminPath ? "Administrator" : currentUser?.role}
              </p>
            </div>
            <div className="w-8 h-8 bg-[#4abd0b]/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-[#2B2F36] border border-[#4abd0b]/30 rounded-md shadow-lg z-50">
              <Link
                to="/user/profile"
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#4abd0b]/10"
              >
                <span className="w-4 h-4 mr-2 text-[#4abd0b]">👤</span>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#4abd0b]/10"
              >
                <LogOut className="w-4 h-4 mr-2 text-[#4abd0b]" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
