// Admin & User Menu Items with Lucide Icons Only
import {
  Bell,
  BellElectric,
  HelpCircle,
  Ban,
  FileBarChart2,
  ShieldCheck,
  UserX,
  UserCheck,
  Users,
  HandCoins,
  Banknote,
  ArrowBigDown,
  Landmark,
  Trophy,
  LayoutDashboard,
  Network,
  Settings,
  Repeat,
  UsersRound,
  LifeBuoy,
  CircleDollarSign,
  FlagTriangleRight,
  Gift,
  ListOrdered,
  ArrowLeftRight,
  ArrowBigUp,
} from "lucide-react";

export const adminSettingsMenu = [
  {
    name: "Create Notification",
    to: "/admin/notifications",
    icon: Bell,
    current: false,
    submenu: [],
  },
  // {
  //   name: "Notification List",
  //   to: "/admin/notification/list",
  //   icon: BellElectric,
  //   current: false,
  //   submenu: [],
  // },

  {
    name: "Banners",
    to: "/admin/banners",
    icon: HelpCircle,
    current: false,
    submenu: [],
  },

  // {
  //   name: "Reports",
  //   to: "/admin/reports",
  //   icon: FileBarChart2,
  //   current: false,
  //   submenu: [],
  // },
];

export const adminUserManagementMenu = [
  {
    name: "Unblocked Users",
    to: "/admin/user/unblock",
    icon: ShieldCheck,
    current: false,
  },
  {
    name: "Blocked Users",
    to: "/admin/user/block",
    icon: UserX,
    current: false,
  },
  {
    name: "Active Members",
    to: "/admin/user/active",
    icon: UserCheck,
    current: false,
  },
  {
    name: "Inactive Members",
    to: "/admin/user/inactive",
    icon: UserX,
    current: false,
  },
  { name: "All Users", to: "/admin/user-manager", icon: Users, current: false },
];

export const adminRequestMenu = [
  // { name: "CTO", to: "/admin/cto", icon: Landmark, current: false, submenu: [] },

  {
    name: "Deposit",
    to: "/admin/transactions?transactionType=deposit",
    icon: ArrowBigDown,
    current: false,
  },
  {
    name: "Top-Up",
    to: "/admin/transactions?transactionType=invest",
    icon: Banknote,
    current: false,
  },
];

export const adminAchieverMenu = [
  {
    name: "Rewards",
    to: "/admin/rewards",
    icon: Trophy,
    current: false,
    submenu: [],
  },
];

export const adminMainMenu = [
  {
    name: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    current: true,
    submenu: [],
  },
  {
    name: "Membership Plans",
    to: "/admin/membership/plan",
    icon: Network,
    current: false,
    submenu: [],
  },
  {
    name: "User Management",
    to: "/admin/user/all",
    icon: Users,
    current: false,
    submenu: [],
  },
  {
    name: "Rewards",
    to: "/admin/reward-list",
    icon: Trophy,
    current: false,
    submenu: [],
  },
  {
    name: "Finance",
    to: "/admin/finance",
    icon: HandCoins,
    current: false,
    submenu: adminRequestMenu,
  },
  {
    name: "Withdrawals Requests",
    to: "/admin/withdrawals?withdrawalType=ROI",
    icon: Landmark,
    current: false,
    submenu: [
      {
        name: "ROI Requests",
        to: "/admin/withdrawals?withdrawalType=ROI",
        icon: Banknote,
        current: false,
      },
      {
        name: "Income Requests",
        to: "/admin/withdrawals?withdrawalType=income",
        icon: Banknote,
        current: false,
      },
    ],
  },
  {
    name: "Settings",
    to: "/admin/settings",
    icon: Settings,
    current: false,
    submenu: adminSettingsMenu,
  },
];

// User Menu Items
export const userIncomeMenu = [
  {
    name: "ROI",
    to: "/user/transactions?transactionType=roi_earning",
    icon: Banknote,
    submenu: [],
  },
  {
    name: "Direct",
    to: "/user/transactions?transactionType=direct_bonus",
    icon: CircleDollarSign,
    submenu: [],
  },
  {
    name: "Level",
    to: "/user/transactions?transactionType=level_commission",
    icon: FlagTriangleRight,
    submenu: [],
  },
    {
    name: "Upline",
    to: "/user/transactions?transactionType=upline_commission",
    icon: ArrowBigUp,
    submenu: [],
  },

  {
    name: "Salary",
    to: "/user/transactions?transactionType=salary",
    icon: Gift,
    submenu: [],
  },
  {
    name: "Income Details",
    to: "/user/finance",
    icon: ListOrdered,
    submenu: [],
  },
];

export const userWalletMenu = []; // can be filled later if needed
export const depositMenu = [
  {
    name: "Wallet Deposit",
    to: "/user/crypto-wallet",
    icon: Banknote,
    submenu: [],
  },
  {
    name: "Scanner",
    to: "/user/scanner",
    icon: Banknote,
    submenu: [],
  },
  // { name: "Scanner", to: "/user/transactions?transactionType=direct_bonus", icon: CircleDollarSign, submenu: [] },
  // { name: "Bank Deposit", to: "/user/transactions?transactionType=level_commission", icon: FlagTriangleRight, submenu: [] },
]; // can be filled later if needed
export const withdrawalMenu = [
  {
    name: "Request ROI ",
    to: "/user/withdrawals/request?requestType=ROI",
    icon: Banknote,
    submenu: [],
  },
  {
    name: "Request Income",
    to: "/user/withdrawals/request?requestType=income",
    icon: CircleDollarSign,
    submenu: [],
  },
]; // can be filled later if needed

export const userMainMenu = [
  {
    name: "Dashboard",
    to: "/user/dashboard",
    icon: LayoutDashboard,
    submenu: [],
  },
  { name: "Referral Tree", to: "/user/tree", icon: Network, submenu: [] },
  { name: "Add Address", to: "/user/accounts", icon: Repeat, submenu: [] },
  {
    name: "Deposit",
    to: "/user/transactions?transactionType=deposit",
    icon: ArrowBigDown,
    submenu: depositMenu,
  },
  {
    name: "Income",
    to: "/user/finance",
    icon: HandCoins,
    submenu: userIncomeMenu,
  },
  {
    name: "Withdrawal",
    to: "/user/withdrawals",
    icon: Banknote,
    submenu: withdrawalMenu,
  },
  { name: "Rewards", to: "/user/rewards", icon: Trophy, submenu: [] },

  // { name: "ReTop-Up", to: "/user/topup", icon: Repeat, submenu: [] },
  {
    name: "Investments History",
    to: "/user/investments",
    icon: Repeat,
    submenu: [],
  },
  // {
  //   name: "Re-Investments",
  //   to: "/user/reinvest",
  //   icon: Repeat,
  //   submenu: [],
  // },
  {
    name: "Transactions",
    to: "/user/transactions?transactionType=invest",
    icon: ArrowLeftRight,
    submenu: [],
  },
  {
    name: "Membership Plan",
    to: "/user/investment-plans",
    icon: UsersRound,
    submenu: [],
  },
  { name: "Notifications", to: "/user/notifications", icon: Bell, submenu: [] },
  { name: "Support", to: "/user/sendsupport", icon: LifeBuoy, submenu: [] },
];
