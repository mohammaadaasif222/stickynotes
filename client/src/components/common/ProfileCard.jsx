// components/layout/Header/UserProfile.jsx
import React, { memo } from 'react';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaRegUser } from 'react-icons/fa';
import { IoMdLogOut } from 'react-icons/io';

const UserProfile = memo(({ user, onLogout, authId }) => (
  <Menu as="div" className="relative inline-block text-left">
    <Menu.Button 
      className="flex items-center p-3 text-sm font-medium rounded-full text-gray-400 bg-[#e0e21e]"
      aria-label="User menu"
    >
      <FaUserAlt aria-hidden="true" className="size-4 text-[#0089bd]" />
    </Menu.Button>

    <Menu.Items className="absolute right-0 z-50 mt-2 min-w-48 max-w-96 break-all origin-top-right rounded-sm bg-black py-1 shadow-lg ring-1 focus:outline-none">
      <div className="flex items-center px-4 pb-1 border-b border-gray-400">
        <div className="shrink-0 border bg-[#0089bd] p-2 rounded-full">
          <FaUserAlt aria-hidden="true" className="size-4 text-gray-300" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-300">{user?.fullname}</div>
          <div className="text-sm font-medium text-gray-300">{user?.email}</div>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-2">
        <Menu.Item>
          {({ active }) => (
            <Link to={`/user/profile/${authId}`}>
              <button
                className={`group flex w-full text-gray-200 items-center px-4 py-2 text-sm font-medium ${
                  active ? "bg-gray-900 text-gray-100" : "hover:bg-gray-900 hover:text-gray-100"
                }`}
              >
                <FaRegUser className="mr-2 h-4 w-4" />
                Profile
              </button>
            </Link>
          )}
        </Menu.Item>
        
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={onLogout}
              className={`flex w-full items-center font-medium text-left px-4 py-2 text-sm text-red-400 ${
                active ? "bg-gray-900" : "hover:bg-gray-900"
              }`}
            >
              <IoMdLogOut className="mr-2 h-5 w-5 text-red-400" />
              Logout
            </button>
          )}
        </Menu.Item>
      </div>
    </Menu.Items>
  </Menu>
));

UserProfile.displayName = 'UserProfile';

export default UserProfile