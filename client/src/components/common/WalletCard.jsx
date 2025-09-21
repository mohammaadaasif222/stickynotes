
import React, { memo } from 'react';
import {
  BanknoteIcon,
  WalletIcon,
  CreditCardIcon,
  DollarSignIcon,
  CoinsIcon,
  PiggyBankIcon,
  LandmarkIcon,
  ReceiptIcon,
  ShieldCheckIcon,
} from 'lucide-react';

const iconMap = {
  wallet: WalletIcon,
  balance: BanknoteIcon,
  earnings: DollarSignIcon, 
  revenue: CoinsIcon,
  savings: PiggyBankIcon,
  bank: LandmarkIcon,
  payment: CreditCardIcon,
  invoice: ReceiptIcon,
  secure: ShieldCheckIcon,
  default: DollarSignIcon,
};

const getIconByTitle = (title = '') => {
  const lowerTitle = title.toLowerCase();
  for (const key in iconMap) {
    if (lowerTitle.includes(key)) {
      return iconMap[key];
    }
  }
  return iconMap.default;
};

const WalletCard = memo(({ title, amount, gradient = 'from-green-600 via-green-700 to-green-600', testId }) => {
  const Icon = getIconByTitle(title);

  return (
    <div
      className={`relative overflow-hidden text-white p-1 rounded-md border border-white/20 bg-gradient-to-br ${gradient} shadow-md hover:shadow-xl backdrop-blur-md transition-all duration-300`}
      data-testid={testId}
    >
      <Icon className="absolute right-2 bottom-2 h-20 w-20 text-yellow-100 opacity-30 rotate-12 pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-2 rounded-full bg-green-500/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-green-300" />
        </div>
        <div className="flex flex-col">
          <p className="text-[14px] font-semibold text-white">
            ${typeof amount === 'number' ? amount.toFixed(2) : amount}
          </p>
          <p className="text-[12px] font-medium text-white/90">{title}</p>
        </div>
      </div>
    </div>
  );
});

WalletCard.displayName = 'WalletCard';
export default WalletCard;

