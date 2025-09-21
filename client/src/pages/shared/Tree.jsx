// import React, { useState } from "react";
// import {
//   Users,
//   User,
//   Phone,
//   Mail,
//   Calendar,
//   TrendingUp,
//   ChevronDown,
//   ChevronRight,
//   Crown,
//   Star,
// } from "lucide-react";
// import { useCompleteTree } from "../../hooks/useTree";
// import { useSelector } from "react-redux";
// import { selectUser } from "../../store/slices/authSlice";

// // User Card Component
// const UserCard = ({ user, isExpanded, onToggle, hasChildren }) => {
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="relative">
//       <div className="bg-gradient-to-r from-white/30 to-white/20 rounded-xl p-1 shadow-md">
//         <div className="bg-[#2a2a2a] rounded-lg p-4 w-[280px] text-white">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center space-x-2">
//               <div className="w-10 h-10 bg-gradient-to-r from-white to-white rounded-full flex items-center justify-center shadow-inner">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">{user.username}</h3>
//                 <span className="text-xs text-white">
//                   Level {user.level}
//                 </span>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="flex items-center space-x-1 text-green-400">
//                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                 <span className="text-xs font-medium">
//                   {user.user_status}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Info */}
//           <div className="space-y-2 text-sm text-gray-200">
//             <div className="flex items-center space-x-2">
//               <Mail className="w-4 h-4 text-white" />
//               <span className="truncate">{user.user_email}</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Phone className="w-4 h-4 text-white" />
//               <span>{user.user_phone}</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Calendar className="w-4 h-4 text-white" />
//               <span>Joined {formatDate(user.user_joined_date)}</span>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="mt-3 pt-3 border-t border-gray-700">
//             <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
//               <div className="text-center">
//                 <div className="font-bold text-white">
//                   {user.direct_referrals}
//                 </div>
//                 <div className="text-gray-400">Direct Referrals</div>
//               </div>
//               <div className="text-center">
//                 <div className="font-bold text-white">
//                   {user.total_team_size}
//                 </div>
//                 <div className="text-gray-400">Team Size</div>
//               </div>
//             </div>
//           </div>

//           {/* Expand Button */}
//           {hasChildren && (
//             <div className="mt-3 pt-3 border-t border-gray-700">
//               <button
//                 onClick={onToggle}
//                 className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
//                   isExpanded
//                     ? "bg-white/10 text-white hover:bg-white/20"
//                     : "bg-white/10 text-white hover:bg-white/20"
//                 }`}
//               >
//                 {isExpanded ? (
//                   <>
//                     <ChevronDown className="w-4 h-4" />
//                     <span className="text-sm font-medium">Hide Children</span>
//                   </>
//                 ) : (
//                   <>
//                     <ChevronRight className="w-4 h-4" />
//                     <span className="text-sm font-medium">
//                       Show Children ({user.children?.length || 0})
//                     </span>
//                   </>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Tree Header
// const TreeHeader = ({ maxDepth }) => (
//   <div className="mb-12">
//     <div className="sm:flex items-center border-b  border-white/20 justify-between space-x-3 p-4">
//       <div>
//       <h1 className="text-2xl font-semibold bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
//         User Referral Tree
//       </h1>
//       <p className="text-gray-300 text-base">
//       Visualizing the team structure and referral hierarchy
//     </p>
//     </div>
//     <div className="sm:mt-0 mt-4 inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-lg">
//       <TrendingUp className="w-4 h-4 text-white" />
//       <span className="text-sm font-medium text-white">
//         Max Depth: {maxDepth} levels
//       </span>
//     </div>
//     </div>
//   </div>
// );

// // Tree Legend
// const TreeLegend = () => {
//   const legendItems = [
//     { color: "from-white to-amber-500", label: "Level 1 - Crown Elite", icon: Crown },
//     { color: "from-amber-400 to-orange-400", label: "Level 2 - Star Members", icon: Star },
//     { color: "from-orange-400 to-amber-400", label: "Level 3 - Premium", icon: User },
//     { color: "from-white to-amber-400", label: "Level 4+ - Standard", icon: User },
//   ];

//   return (
//     <div className="mt-12 bg-[#181818]  rounded-sm p-4 ">
//       <h3 className="text-2xl font-bold mb-6 text-white flex items-center space-x-2">
//         <Crown className="w-6 h-6" />
//         <span>Membership Tiers</span>
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {legendItems.map((item, index) => {
//           const Icon = item.icon;
//           return (
//             <div
//               key={index}
//               className="flex items-center space-x-3 bg-[#1e1e1e] rounded-lg p-4 border border-gray-700 hover:border-white/50 transition-all duration-300"
//             >
//               <div
//                 className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center`}
//               >
//                 <Icon className="w-4 h-4 text-black" />
//               </div>
//               <span className="text-gray-200 font-medium">{item.label}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // Tree Level
// const TreeLevel = ({ users, level, expandedNodes, onToggleNode }) => {
//   if (!users || users.length === 0) return null;

//   const allChildren = [];
//   users.forEach((user) => {
//     if (user.children && user.children.length > 0 && expandedNodes.has(user.id)) {
//       allChildren.push(...user.children);
//     }
//   });

//   return (
//     <div className="flex flex-col items-center space-y-8">
//       <div className="flex justify-center gap-4 overflow-x-auto min-w-full">
//         <div className="flex gap-6">
//           {users.map((user, index) => (
//             <div
//               key={`${user.id}-${index}`}
//               className="flex flex-col items-center flex-shrink-0"
//             >
//               <UserCard
//                 user={user}
//                 isExpanded={expandedNodes.has(user.id)}
//                 onToggle={() => onToggleNode(user.id)}
//                 hasChildren={user.children && user.children.length > 0}
//               />
//               {user.children &&
//                 user.children.length > 0 &&
//                 expandedNodes.has(user.id) && (
//                   <div className="w-px h-8 bg-gray-600 mt-4"></div>
//                 )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {allChildren.length > 0 && (
//         <>
//           <div className="w-full flex justify-center">
//             <div className="h-px bg-gray-900 w-3/4 max-w-4xl"></div>
//           </div>
//           <TreeLevel
//             users={allChildren}
//             level={level + 1}
//             expandedNodes={expandedNodes}
//             onToggleNode={onToggleNode}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// // Main Component
// const Tree = () => {
//   const [expandedNodes, setExpandedNodes] = useState(new Set());
//   const user = useSelector(selectUser);
//   const { completeTree, loading, error } = useCompleteTree(user.id);

//   const toggleNode = (nodeId) => {
//     setExpandedNodes((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
//       return newSet;
//     });
//   };

//   return (
//     <div className="min-h-screen bg-[#1e1e1e]">
//       <div className="max-w-7xl mx-auto">
//         <TreeHeader maxDepth={completeTree?.maxDepth} />
//         <div className=" overflow-x-auto">
//           <TreeLevel
//             users={completeTree?.tree}
//             level={1}
//             expandedNodes={expandedNodes}
//             onToggleNode={toggleNode}
//           />
//         </div>
//         <TreeLegend />
//       </div>
//     </div>
//   );
// };

// export default Tree;

// Updated Tree with new backend and old design

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Crown,
  Mail,
  Phone,
  Calendar,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { useCompleteTree } from "../../hooks/useTree";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const UserCard = ({ user, isExpanded, onToggle, hasChildren }) => {
  return (
    <li className="relative flex flex-col items-center">
      <div className="node-container relative group">
        <div
          className="bg-[#2a2a2a] text-white border border-gray-700 shadow-md py-2 px-4 rounded hover:bg-[#3a3a3a] transition-all duration-200 flex flex-col items-center cursor-pointer"
          onDoubleClick={onToggle}
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src="/logo.png" alt={user?.username} className="w-20" />
              {user?.user_status === "active" && (
                <div className="absolute -top-1  -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              )}
            </div>
            <div className="font-semibold mt-1">{user?.username}</div>
            <div className="text-xs text-white mt-1">
              Direct Referrals: {user.direct_referrals || 0}
            </div>
            {hasChildren && (
              <div className="absolute w-0.5 h-4 bg-gray-500 left-1/2 transform -translate-x-1/2 top-full"></div>
            )}
          </div>

          <div className="details-card absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#1e1e1e] p-3 rounded-lg shadow-lg z-10 w-64 text-left border border-gray-600 hidden group-hover:block">
            <div className="text-gray-300 text-sm">
              <div className="text-gray-100">{user?.user_email}</div>
              <div className="mt-1">
                Status :{" "}
                <span className="font-medium text-green-400">
                  {user?.user_status}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <div className="bg-[#2a2a2a] px-2 py-1 rounded flex justify-between">
                  <span>Phone :</span>
                  <span>{user?.user_phone}</span>
                </div>
                <div className="bg-[#2a2a2a] px-2 py-1 rounded flex justify-between">
                  <span>Joined :</span>
                  <span>{formatDate(user?.user_joined_date)}</span>
                </div>
                <div className="bg-[#2a2a2a] px-2 py-1 rounded flex justify-between">
                  <span>Team Size:</span>
                  <span>{user?.total_team_size}</span>
                </div>
              </div>
              <div className="flex justify-center mt-2 text-xs text-gray-500">
                {isExpanded
                  ? "Double-click to collapse"
                  : "Double-click to expand"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && user.children?.length > 0 && (
        <ul className="flex justify-center pt-6 relative">
          {user.children.map((child, index) => (
            <UserCard
              key={child.id}
              user={child}
              isExpanded={isExpanded}
              onToggle={() => onToggle(child.id)}
              hasChildren={child.children && child.children.length > 0}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Tree = ({ maxDepth }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const user = useSelector(selectUser);
  const { completeTree } = useCompleteTree(user.id);

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
      return newSet;
    });
  };
  

  const treeData = completeTree?.tree || [];

  return (
    <div className="py-12 px-6 sm:px-24 overflow-auto genealogy-scroll whitespace-nowrap min-h-screen text-center bg-[#1e1e1e] text-white">
      <div className="flex justify-center items-center mb-10">
        <div className="bg-[#2a2a2a] text-white p-4 rounded-md relative cursor-pointer group border border-gray-600 shadow-md">
          <div className="relative justify-center flex mb-1">
            <div className="absolute -top-6 rounded-t-lg bg-white text-black px-3 py-1 text-xs">
              {user?.user_status}
            </div>
            <img src="/logo.png" alt={user?.username} className="w-20" />
          </div>

          <div className="font-medium text-sm mt-1">{user?.username}</div>

          <div className="text-xs text-white mt-1">
            Total Referrals:{" "}
            {treeData.reduce(
              (acc, u) => acc + 1 + (u?.direct_referrals || 0),
              0
            )}
          </div>

          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-[#1e1e1e] p-4 rounded-lg shadow-lg z-10 w-72 text-left border border-gray-600 hidden group-hover:block">
            <div className="text-gray-300">
              <div className="text-sm text-gray-400">{user?.user_email}</div>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <div className="bg-[#2a2a2a] px-3 py-2 rounded">
                  <span>Status: </span>
                  <span className="font-medium text-white">
                    {user?.user_status}
                  </span>
                </div>
                <div className="bg-[#2a2a2a] px-3 py-2 rounded">
                  <span>Referral code: </span>
                  <span>{user?.user_refferal_code}</span>
                </div>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500 break-words px-2 ">
                <div>Max Depth: {maxDepth} levels</div>
                <div>Double-click to expand/collapse</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tree inline-block">
        <ul className="flex justify-center pt-5">
          {treeData.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              isExpanded={expandedNodes.has(user.id)}
              onToggle={() => toggleNode(user.id)}
              hasChildren={user.children && user.children.length > 0}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tree;
