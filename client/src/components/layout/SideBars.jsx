import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { ChevronDown, ChevronLeft, LineSquiggle, X } from "lucide-react";

const SideBar = ({
  isSidebarOpen,
  isMobileMenuOpen,
  activeTab,
  menus,
  onToggleSidebar,
  onToggleMobileMenu,
  onSetActiveTab,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#1E2328] border-r border-white/50 text-white transition-all duration-300 z-50
      ${
        isMobileMenuOpen
          ? "w-64 translate-x-0"
          : isSidebarOpen
          ? "w-64"
          : "md:w-16"
      }
      ${
        isMobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Logo with Mobile Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/50">
        <Link to="/" aria-label="Go to homepage">
          <img src="/logo.png" className="w-12" alt="grozy Logo" />
        </Link>
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden text-white p-2"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <LineSquiggle className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Desktop Toggle */}
      <button
        onClick={onToggleSidebar}
        className="absolute top-[50px] -right-3.5 p-2 text-white bg-white/10 backdrop-blur-md rounded-full transition-all duration-300 hidden md:block"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          className={`w-4 h-4 transition-transform ${
            isSidebarOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      {/* Menu */}
      <div className="flex flex-col h-full p-2">
        <ul className="flex flex-col space-y-2 no-scrollbar overflow-auto mb-28">
          {menus.map((menu, index) => {
            const isActive = activeTab === menu.name;
            const IconComponent = menu.icon;
            const hasSubmenu = menu.submenu && menu.submenu.length > 0;

            return (
              <Disclosure as="div" key={index}>
                {({ open }) => (
                  <>
                    <Link to={menu.to}>
                      <Disclosure.Button
                        className={`flex items-center w-full text-white ${
                          isSidebarOpen ? "p-3" : "p-2 "
                        } ${
                          isActive
                            ? "bg-[#dfdada]/10 border-l-2 border-[#4abd0b]"
                            : "hover:bg-[#dfdada]/10 hover:border-l-2 hover:border-[#4abd0b] backdrop-blur-md"
                        }`}
                        onClick={() => onSetActiveTab(menu.name, menu)}
                        aria-label={`Navigate to ${menu.name}`}
                      >
                        {IconComponent && (
                          <IconComponent className="w-6 h-6" />
                        )}
                        {(isSidebarOpen || isMobileMenuOpen) && (
                          <span className="ml-3">{menu.name}</span>
                        )}
                        {(isSidebarOpen || isMobileMenuOpen) &&
                          hasSubmenu && (
                            <ChevronDown
                              className={`w-5 h-5 ml-auto transition-transform ${
                                open ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          )}
                      </Disclosure.Button>
                    </Link>

                    {open &&
                      (isSidebarOpen || isMobileMenuOpen) &&
                      hasSubmenu && (
                        <Disclosure.Panel className="pl-4">
                          <ul>
                            {menu.submenu.map((item, subIndex) => {
                              const SubIcon = item.icon;
                              const isSubActive = activeTab === item.name;

                              return (
                                <li
                                  key={subIndex}
                                  className={`p-2 cursor-pointer transition-colors ${
                                    isSubActive
                                      ? "bg-[#dfdada]/10 border-l-2 border-[#4abd0b]"
                                      : "hover:bg-[#dfdada]/10 hover:border-l-2 hover:border-[#4abd0b] backdrop-blur-md"
                                  }`}
                                  onClick={() => onSetActiveTab(item.name)}
                                >
                                  <Link
                                    to={item.to}
                                    className="w-full block flex items-center"
                                    aria-label={`Navigate to ${item.name}`}
                                  >
                                    {SubIcon && (
                                      <SubIcon className="w-5 h-5 inline-block mr-4" />
                                    )}
                                    {item.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </Disclosure.Panel>
                      )}
                  </>
                )}
              </Disclosure>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default SideBar;

