import React from "react";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Gift,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  PiggyBank,
  Target,
} from "lucide-react";
import { useTransactionStats } from "../../hooks/useTransactions";

const Financial = () => {
  const { stats } = useTransactionStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const StatCard = ({ title, value, icon: Icon, bgColorVar, iconBgVar }) => {
    return (
      <div
        className="rounded-md shadow-md p-4 border border-white/20 hover:shadow-md transition-shadow duration-300"
        style={{ backgroundColor: `var(${bgColorVar})` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `var(${iconBgVar})` }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--title-color)" }}
            >
              ${parseFloat(value || 0).toFixed(2)}
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--subtitle-color)" }}
            >
              {title}
            </p>
          </div>
        </div>
      </div>
    );
  };

const TransactionStatusCard = ({ title, count, bgColor, iconColor, icon: Icon }) => (
  <div
    className="rounded-lg p-4 border border-white/20 flex items-center space-x-3"
    style={{ backgroundColor: bgColor }}
  >
    <div
      className="p-2 rounded-full"
      style={{ backgroundColor: iconColor }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xl font-semibold" style={{ color: 'rgb(222, 192, 1)' }}>
        {count}
      </p>
      <p className="text-sm" style={{ color: '#ffffff' }}>
        {title}
      </p>
    </div>
  </div>
);


  const totalEarnings =
    parseFloat(stats?.total_roi_earning) +
    parseFloat(stats?.total_level_commission) +
    parseFloat(stats?.total_direct_bonus) +
    parseFloat(stats?.total_reward_bonus);

  const netBalance =
    parseFloat(stats?.total_deposit) +
    totalEarnings -
    parseFloat(stats?.total_withdrawal) -
    parseFloat(stats?.total_transfer_out) -
    parseFloat(stats?.total_invest);

  return (
    <div className="min-h-screen bg-[var(--bg-inner)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/20 p-4">
          <h1 className="text-2xl font-semibold text-[var(--title-color)] ">
            Financial Dashboard
          </h1>
          <p className="text-[var(--subtitle-color)] font-medium ">
            Complete overview of your financial activities
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <StatCard
            title="Total Deposits"
            value={stats?.total_deposit}
            icon={ArrowDownRight}
            bgColorVar="--grid-bg-1"
            iconBgVar="--icon-bg-1"
          />
          <StatCard
            title="Total Investments"
            value={stats?.total_invest}
            icon={PiggyBank}
            bgColorVar="--grid-bg-2"
            iconBgVar="--icon-bg-2"
          />
          <StatCard
            title="Total Earnings"
            value={totalEarnings}
            icon={TrendingUp}
            bgColorVar="--grid-bg-3"
            iconBgVar="--icon-bg-3"
          />
          <StatCard
            title="Net Balance"
            value={netBalance}
            icon={DollarSign}
            bgColorVar="--grid-bg-4"
            iconBgVar="--icon-bg-4"
          />
        </div>

        {/* Earnings Breakdown */}
        <div className="px-4 pb-4">
        <div className=" bg-[var(--bg-inner)] rounded-md shadow-md">
          <h2 className="text-2xl font-semibold text-[var(--title-color)]  border-b border-white/20 p-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
            Earnings Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg text-white">
              <p className="text-lg font-semibold">ROI Earnings</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.total_roi_earning)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg text-white">
              <p className="text-lg font-semibold">Level Commission</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.total_level_commission)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 rounded-lg text-white">
              <p className="text-lg font-semibold">Direct Bonus</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.total_direct_bonus)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-lg text-white">
              <p className="text-lg font-semibold">Reward Bonus</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.total_reward_bonus)}
              </p>
            </div>
          </div>
        </div>
</div>
        {/* Transaction Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4">
          {/* Transaction Status */}
          <div className="bg-[var(--bg-inner)] rounded-md shadow-lg ">
            <h3 className="text-xl font-semibold text-[var(--title-color)] p-4 border-b border-white/20 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Transaction Status
            </h3>
            <div className="grid grid-cols-1 gap-4 p-4 ">
              <TransactionStatusCard
                title="Completed"
                count={stats?.completed_transactions}
                icon={CheckCircle}
                bgColor="#1e3a8a"
                iconColor="#1e40af"
              />
              <TransactionStatusCard
                title="Pending"
                count={stats?.pending_transactions}
                icon={Clock}
                bgColor="#065f46"
                iconColor="#047857"
              />
              <TransactionStatusCard
                title="Failed"
                count={stats?.failed_transactions}
                icon={XCircle}
                bgColor="#b91c1c"
                iconColor="#cc0303"
              />
            </div>
          </div>

          {/* Transfers & Others */}
          <div className="bg-[var(--bg-inner)] rounded-md shadow-md">
            <h3 className="text-xl font-semibold text-[var(--title-color)] p-4 border-b border-white/20 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-500" />
              Transfers & Others
            </h3>
            <div className="">
              <div className="flex justify-between items-center p-3 border-b border-white/10  ">
                <span className="text-[var(--subtitle-color)]">Transfer In</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats?.total_transfer_in)}
                </span>
              </div>
              <div className="flex justify-between items-center  p-3.5 border-b border-white/10 ">
                <span className="text-[var(--subtitle-color)]">Transfer Out</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats?.total_transfer_out)}
                </span>
              </div>
              <div className="flex justify-between items-center  p-3.5 border-b border-white/10 ">
                <span className="text-[var(--subtitle-color)]">Top Up</span>
                <span className="font-semibold text-[var(--title-color)]">
                  {formatCurrency(stats?.total_topup)}
                </span>
              </div>
              <div className="flex justify-between items-center  p-3.5 border-b border-white/10 ">
                <span className="text-[var(--subtitle-color)]">Compound</span>
                <span className="font-semibold text-[var(--title-color)]">
                  {formatCurrency(stats?.total_compound)}
                </span>
              </div>
              <div className="flex justify-between items-center  p-3.5 border-b border-white/10 ">
                <span className="text-[var(--subtitle-color)]">Penalty</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats?.total_penalty)}
                </span>
              </div>
              <div className="flex justify-between items-center  p-3.5">
                <span className="text-[var(--subtitle-color)]">Refund</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats?.total_refund)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-4">
        <div className="bg-[var(--bg-inner)] rounded-md shadow-md">
          <h3 className="text-xl font-semibold text-[var(--title-color)] border-b border-white/20 p-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
  {/* Total Transactions */}
  <div className="text-center rounded-md p-4" style={{ backgroundColor: 'var(--grid-bg-1)' }}>
    <div className="text-xl font-semibold " style={{ color: 'var(--title-color)' }}>
      {stats?.total_transactions}
    </div>
    <div className="text-base" style={{ color: 'var(--subtitle-color)' }}>
      Total Transactions
    </div>
  </div>

  {/* Success Rate */}
  <div className="text-center rounded-xl p-4" style={{ backgroundColor: 'var(--grid-bg-2)' }}>
    <div className="text-xl font-semibold " style={{ color: 'var(--title-color)' }}>
      {(
        (parseFloat(stats?.completed_transactions) / parseFloat(stats?.total_transactions)) *
        100
      ).toFixed(1)}
      %
    </div>
    <div className="text-base" style={{ color: 'var(--subtitle-color)' }}>
      Success Rate
    </div>
  </div>

  {/* ROI Percentage */}
  <div className="text-center rounded-xl p-4" style={{ backgroundColor: 'var(--grid-bg-3)' }}>
    <div className="text-xl font-semibold " style={{ color: 'var(--title-color)' }}>
      {formatCurrency(
        (
          (totalEarnings / parseFloat(stats?.total_invest)) *
          100
        ).toFixed(2)
      )}
    </div>
    <div className="text-base" style={{ color: 'var(--subtitle-color)' }}>
      ROI Percentage
    </div>
  </div>
</div>

        </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;
