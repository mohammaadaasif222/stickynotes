import React, { useState, useEffect, memo } from "react";
import { DollarSign, AlertCircle } from "lucide-react";
import {
  useInvestmentPlans,
  usePlanROI,
  usePlanValidation,
} from "../../hooks/useInvestmentPlan";
import { useInvestments, useUserInvestments } from "../../hooks/useInvestment";
import PlanSkeleton from "../../components/features/shared/PlanSkeleton";
import PlanCard from "../../components/features/shared/PlanCard";
import { toast } from "react-hot-toast";
import { useWallet } from "../../hooks/useWallet";
const PageHeader = memo(() => (
  <div className="mb-4 p-4 border-b border-white/20">
    <h1 className="text-3xl font-semibold bg-green-300 bg-clip-text text-transparent">
      Investment Plans
    </h1>
    <p className="text-lg text-gray-300 max-w-2xl ">
      Choose the perfect investment plan tailored to your financial goals and
      risk appetite
    </p>
  </div>
));

const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-800 mb-2">
      Error Loading Plans
    </h3>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
));

const InvestmentPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const { getUserWallet } = useWallet();
  const { actions, loading: investLoading } = useInvestments();
  const { userInvestments, investmentSummary } = useUserInvestments({
    autoFetch: true,
  });
  console.log(userInvestments);
  const {
    activePlans,
    loading,
    errors,
    stats: plansStats,
    loadActivePlans,
    clearAllErrors,
  } = useInvestmentPlans({
    autoFetch: true,
    fetchActive: true,
    fetchAll: true,
    cacheTimeout: 5 * 60 * 1000,
  });

  const { planValidation, validateAmount } = usePlanValidation();
  const { planROI, calculateROI } = usePlanROI();

  const handleValidateAmount = async (plan) => {
    const amount = parseFloat(investmentAmount);
  };

  const handleInvest = async (plan) => {
    const amount = parseFloat(investmentAmount);
    if (amount >= plan.min_amount && amount <= plan.max_amount) {
      try {
        await actions.create({
          plan_id: plan.id,
          invested_amount: amount,
        });
        toast.success("Investment Successfull!");
        await getUserWallet();
        setInvestmentAmount("");
        setSelectedPlan(null);
      } catch (error) {
        console.error("Investment failed:", error);
        alert("Investment failed. Please try again.");
      }
    } else {
      alert(
        `Investment amount must be between $${plan.min_amount} and $${plan.max_amount}`
      );
    }
  };

  const handleRetry = () => {
    clearAllErrors();
    loadActivePlans();
  };

  return (
    <div className="bg-[#1e1e1e]">
      <div className="mx-auto">
        <PageHeader />

        {errors.active && (
          <ErrorDisplay error={errors.active} onRetry={handleRetry} />
        )}

        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-2 p-4">
          {/* Loading State */}
          {loading.active && !activePlans.length && (
            <>
              <PlanSkeleton />
              <PlanSkeleton />
              <PlanSkeleton />
            </>
          )}

          {/* Plans Display */}
          {activePlans.length > 0 &&
            activePlans.map((plan, index) => {
              const isActivePlan = userInvestments.find(
                (item) => item.plan_id === plan.id && item.status === "active"
              );
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isActivePlan={isActivePlan}
                  index={index}
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  investmentAmount={investmentAmount}
                  setInvestmentAmount={setInvestmentAmount}
                  handleValidateAmount={handleValidateAmount}
                  handleInvest={handleInvest}
                  planValidation={planValidation}
                  planROI={planROI}
                  isProcessing={investLoading.create}
                />
              );
            })}

          {/* Empty State */}
          {loading.active && (
            <div className="col-span-3 text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Active Plans Available
              </h3>
              <p className="text-gray-500">
                Check back later for new investment opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlans;
